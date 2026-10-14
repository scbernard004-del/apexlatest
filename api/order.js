import {EnquiryError,validateEnquiry,makeOrderEmail,allowAttempt,newReference} from './_enquiry.mjs';

export function createHandler({env=process.env,sendMail}={}){
 return async function handler(req,res){
  const reply=(status,payload)=>{res.statusCode=status;res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(payload));};
  if(req.method!=='POST'){res.setHeader('Allow','POST');return reply(405,{ok:false,message:'Use POST to send an order request.'});}
  try{
   let origin;try{origin=new URL(req.headers.origin||'');}catch{throw new EnquiryError('Invalid request origin.',403);}
   if(origin.host!==req.headers.host||!['http:','https:'].includes(origin.protocol))throw new EnquiryError('Invalid request origin.',403);
   if(!(req.headers['content-type']||'').toLowerCase().startsWith('application/json'))throw new EnquiryError('Send order data as JSON.',415);
   if(Number(req.headers['content-length']||0)>16384)throw new EnquiryError('The order request is too large.',413);
   const ip=String(req.headers['x-vercel-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
   if(!allowAttempt('order:'+ip))throw new EnquiryError('Too many order requests. Please use WhatsApp directly.',429);
   let body=req.body;
   if(body===undefined){let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>16384)throw new EnquiryError('The order request is too large.',413);}try{body=JSON.parse(raw);}catch{throw new EnquiryError('Invalid order data.');}}
   else if(typeof body==='string'){try{body=JSON.parse(body);}catch{throw new EnquiryError('Invalid order data.');}}
   const enquiry=validateEnquiry(body);
   if(!env.SMTP_USER||!env.SMTP_PASS)throw new EnquiryError('Email notifications are not connected yet. Continue with WhatsApp.',503);
   const reference=newReference();
   const mail={...makeOrderEmail(enquiry,reference),from:{name:'Apex Computers Website',address:env.SMTP_USER},to:env.NOTIFICATION_EMAIL||'scbernard004@gmail.com'};
   if(sendMail)await sendMail(mail);else{
    const {default:nodemailer}=await import('nodemailer');
    const port=Number(env.SMTP_PORT||465);
    const transport=nodemailer.createTransport({host:env.SMTP_HOST||'smtp.gmail.com',port,secure:port===465,requireTLS:port!==465,auth:{user:env.SMTP_USER,pass:env.SMTP_PASS.replace(/\s/g,'')},connectionTimeout:8000,greetingTimeout:8000,socketTimeout:12000});
    try{const result=await transport.sendMail(mail);if(!result.accepted?.length)throw new Error('Recipient was not accepted.');}finally{transport.close();}
   }
   return reply(200,{ok:true,reference,message:'Order request notification sent.'});
  }catch(error){if(error instanceof EnquiryError)return reply(error.status,{ok:false,message:error.message});console.error('Order notification failed:',error.code||error.name||'unknown');return reply(502,{ok:false,message:'Email notification could not be confirmed. Continue with WhatsApp.'});}
 };
}
export default createHandler();
