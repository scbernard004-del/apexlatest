import {EnquiryError,validateEnquiry,makeEmail,allowAttempt,newReference} from './_enquiry.mjs';
export function createHandler({env=process.env,sendMail,fetchImpl=fetch}={}){
 return async function handler(req,res){
  const reply=(status,payload)=>{res.statusCode=status;res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(payload));};
  if(req.method!=='POST'){res.setHeader('Allow','POST');return reply(405,{ok:false,message:'Use POST to send an enquiry.'});}
  try{
   let origin;try{origin=new URL(req.headers.origin||'');}catch{throw new EnquiryError('Invalid request origin.',403);}
   if(origin.host!==req.headers.host||!['http:','https:'].includes(origin.protocol))throw new EnquiryError('Invalid request origin.',403);
   if(!(req.headers['content-type']||'').toLowerCase().startsWith('application/json'))throw new EnquiryError('Send enquiry data as JSON.',415);
   if(Number(req.headers['content-length']||0)>16384)throw new EnquiryError('The enquiry is too large.',413);
   const ip=String(req.headers['x-vercel-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
   if(!allowAttempt(ip))throw new EnquiryError('Too many enquiries. Please wait ten minutes or use WhatsApp.',429);
   let body=req.body;
   if(body===undefined){let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>16384)throw new EnquiryError('The enquiry is too large.',413);}try{body=JSON.parse(raw);}catch{throw new EnquiryError('Invalid enquiry data.');}}
   else if(typeof body==='string'){if(Buffer.byteLength(body)>16384)throw new EnquiryError('The enquiry is too large.',413);try{body=JSON.parse(body);}catch{throw new EnquiryError('Invalid enquiry data.');}}
   else if(Buffer.byteLength(JSON.stringify(body))>16384)throw new EnquiryError('The enquiry is too large.',413);
   const enquiry=validateEnquiry(body);
   if(!env.SMTP_USER||!env.SMTP_PASS)throw new EnquiryError('Email enquiries are not connected yet. Please use WhatsApp or SMS.',503);
   if(Boolean(env.TURNSTILE_SECRET_KEY)!==Boolean(env.TURNSTILE_SITE_KEY))throw new EnquiryError('Email is temporarily unavailable. Please use WhatsApp or SMS.',503);
   if(env.TURNSTILE_SECRET_KEY){
    if(typeof body.turnstileToken!=='string'||!body.turnstileToken)throw new EnquiryError('Please complete the security check.',400);
    const r=await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:env.TURNSTILE_SECRET_KEY,response:body.turnstileToken,remoteip:ip}),signal:AbortSignal.timeout(8000)});
    const result=await r.json();const hosts=(env.TURNSTILE_HOSTNAMES||'').split(',').map(s=>s.trim()).filter(Boolean);
    if(!r.ok||!result.success||(hosts.length&&!hosts.includes(result.hostname)))throw new EnquiryError('Security check failed. Please try again.',400);
   }
   const reference=newReference(),mail={...makeEmail(enquiry,reference),from:{name:'Apex Computers Website',address:env.SMTP_USER},to:env.NOTIFICATION_EMAIL||'scbernard004@gmail.com'};
   if(sendMail)await sendMail(mail);else{
    const {default:nodemailer}=await import('nodemailer');
    const port=Number(env.SMTP_PORT||465);const transport=nodemailer.createTransport({host:env.SMTP_HOST||'smtp.gmail.com',port,secure:port===465,requireTLS:port!==465,auth:{user:env.SMTP_USER,pass:env.SMTP_PASS.replace(/\s/g,'')},connectionTimeout:8000,greetingTimeout:8000,socketTimeout:12000});
    try{const result=await transport.sendMail(mail);if(!result.accepted?.length)throw new Error('Recipient was not accepted.');}finally{transport.close();}
   }
   return reply(200,{ok:true,reference,message:'Your enquiry has been sent.'});
  }catch(error){if(error instanceof EnquiryError)return reply(error.status,{ok:false,message:error.message});console.error('Enquiry delivery failed:',error.code||error.name||'unknown');return reply(502,{ok:false,message:'Email delivery could not be confirmed. Please use WhatsApp or SMS.'});}
 };
}
export default createHandler();
