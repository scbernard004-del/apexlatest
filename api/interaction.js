const buckets=new Map();
const clean=(value,max=120)=>typeof value==='string'?value.trim().replace(/[\r\n\x00-\x1f]/g,' ').slice(0,max):'';
const allowed=new Set(['whatsapp-order','whatsapp-help','selection-whatsapp','call','sms','email']);
function canSend(ip,now=Date.now()){
 const bucket=buckets.get(ip);
 if(!bucket||now>bucket.reset){buckets.set(ip,{count:1,reset:now+600000});return true;}
 if(bucket.count>=12)return false;
 bucket.count++;return true;
}
export function createHandler({env=process.env,sendMail}={}){
 return async function handler(req,res){
  const reply=(status,payload)=>{res.statusCode=status;res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(payload));};
  if(req.method!=='POST'){res.setHeader('Allow','POST');return reply(405,{ok:false});}
  try{
   let origin;try{origin=new URL(req.headers.origin||'');}catch{return reply(403,{ok:false});}
   if(origin.host!==req.headers.host||!['http:','https:'].includes(origin.protocol))return reply(403,{ok:false});
   if(!(req.headers['content-type']||'').toLowerCase().startsWith('application/json'))return reply(415,{ok:false});
   const ip=String(req.headers['x-vercel-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
   if(!canSend(ip))return reply(200,{ok:true,rateLimited:true});
   let body=req.body;
   if(body===undefined){let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>4096)return reply(413,{ok:false});}try{body=JSON.parse(raw);}catch{return reply(400,{ok:false});}}
   else if(typeof body==='string'){try{body=JSON.parse(body);}catch{return reply(400,{ok:false});}}
   const type=clean(body?.type,40);
   if(!allowed.has(type))return reply(400,{ok:false});
   if(!env.SMTP_USER||!env.SMTP_PASS)return reply(200,{ok:true,emailEnabled:false});
   const productId=clean(body?.productId,120)||'Not specified';
   const label=clean(body?.label,160)||'Website action';
   const page=clean(body?.page,160)||'/';
   const language=body?.language==='sw'?'Kiswahili':'English';
   const time=new Date().toISOString();
   const text=`APEX COMPUTERS WEBSITE INTERACTION\n\nAction: ${type}\nProduct ID: ${productId}\nLink / button: ${label}\nPage: ${page}\nLanguage: ${language}\nTime: ${time}\n\nThis means the visitor clicked the website action. It does not prove that they completed a WhatsApp message, phone call, SMS or payment.`;
   const mail={from:{name:'Apex Computers Website',address:env.SMTP_USER},to:env.NOTIFICATION_EMAIL||'scbernard004@gmail.com',subject:`Apex website: ${type}`,text};
   if(sendMail)await sendMail(mail);else{
    const {default:nodemailer}=await import('nodemailer');
    const port=Number(env.SMTP_PORT||465);
    const transport=nodemailer.createTransport({host:env.SMTP_HOST||'smtp.gmail.com',port,secure:port===465,requireTLS:port!==465,auth:{user:env.SMTP_USER,pass:env.SMTP_PASS.replace(/\s/g,'')},connectionTimeout:7000,greetingTimeout:7000,socketTimeout:10000});
    try{await transport.sendMail(mail);}finally{transport.close();}
   }
   return reply(200,{ok:true});
  }catch(error){console.error('Interaction notification failed:',error.code||error.name||'unknown');return reply(200,{ok:true,emailFailed:true});}
 };
}
export default createHandler();
