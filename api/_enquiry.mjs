import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
const catalog=JSON.parse(readFileSync(new URL('./catalog.json',import.meta.url),'utf8'));
const products=new Map(catalog.products.map(p=>[p.id,p]));
const isComputerProduct=p=>/^(Business|Workstation|2-in-1|Everyday|All-in-one|Desktop|Gaming|MacBook|Laptop|Laptops|Desktops)$/i.test(p.category||'');
export class EnquiryError extends Error {constructor(message,status=400){super(message);this.status=status;}}
const clean=(value,max)=>typeof value==='string'?value.trim().slice(0,max):'';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function validateEnquiry(body){
 if(!body||typeof body!=='object'||Array.isArray(body))throw new EnquiryError('Invalid enquiry.');
 if(body.website)throw new EnquiryError('Unable to send this enquiry.');
 if(body.consent!==true)throw new EnquiryError('Please agree to share your details with Apex Computers.');
 const name=clean(body.name,80),phone=clean(body.phone,25),email=clean(body.email,160),message=clean(body.message,2000);
 if(name.length<2||/[\r\n\x00-\x1f]/.test(name))throw new EnquiryError('Please enter your full name.');
 if(!/^[+\d()\-\s]{7,25}$/.test(phone)||phone.replace(/\D/g,'').length<7)throw new EnquiryError('Please enter a valid phone number.');
 if(email&&!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email))throw new EnquiryError('Please enter a valid email address.');
 if(!Array.isArray(body.items)||body.items.length<1||body.items.length>20)throw new EnquiryError('Choose between 1 and 20 products.');
 const keys=new Set();
 const items=body.items.map(x=>{if(!x||typeof x!=='object')throw new EnquiryError('Invalid product.');const p=products.get(x.id);if(!p||p.public===false)throw new EnquiryError('A selected product is no longer in the catalogue.');const variant=x.variant??0;
 if(!Number.isInteger(x.qty)||x.qty<1||x.qty>10)throw new EnquiryError('Quantity must be between 1 and 10.');
 if(!Number.isInteger(variant)||variant<0||variant>=Math.max(1,p.variants?.length||0))throw new EnquiryError('Invalid product configuration.');
 const key=p.id+':'+variant;if(keys.has(key))throw new EnquiryError('Duplicate product lines.');keys.add(key);
 const option=p.variants?.[variant],details={...p,...(option?.details||{})},computer=isComputerProduct(details);
 const configuration=option?.label||(computer?details.storage:(details.summary||[]).join(' · '))||details.description||'Confirm product details';
 return {id:p.id,name:details.name,configuration,qty:x.qty,unitPrice:option?.price??p.price,computerProduct:computer,cpu:computer?details.cpu:undefined,ram:computer?details.ram:undefined,description:computer?undefined:details.description};});
 return {name,phone,email,message,items,language:body.language==='sw'?'sw':'en'};
}
const itemLine=(x,fmt)=>[`${x.qty} × ${x.name}`,x.configuration,x.computerProduct?(x.ram==null?'Confirm RAM':x.ram+'GB RAM'):null,x.cpu||x.description,`${fmt(x.unitPrice)} each`].filter(Boolean).join(' | ');
export function makeEmail(enquiry,reference){
 const fmt=v=>v==null?'Price to be quoted':'TSh '+new Intl.NumberFormat('en-TZ').format(v);
 const total=enquiry.items.reduce((n,x)=>n+(x.unitPrice??0)*x.qty,0);
 const lines=enquiry.items.map(x=>itemLine(x,fmt)).join('\n');
 const text=`NEW WEBSITE ENQUIRY ${reference}\n\nPreferred language: ${enquiry.language==='sw'?'Kiswahili':'English'}\nCustomer: ${enquiry.name}\nPhone / WhatsApp: ${enquiry.phone}\nEmail: ${enquiry.email||'Not provided'}\n\n${lines}\n\nIndicative subtotal: ${fmt(total)}${enquiry.items.some(x=>x.unitPrice==null)?' plus items requiring a quote':''}\n\nMessage: ${enquiry.message||'No additional message'}\n\nCustomer agreed to share their details to answer this enquiry. This is an enquiry, not a paid or confirmed order. Confirm current prices, availability, configuration, condition and delivery directly with the customer.`;
 return {subject:`Apex Computers enquiry ${reference}`,text,html:`<div style="font-family:Arial,sans-serif;max-width:680px;color:#16352b"><h1>New shop enquiry</h1><p>${escape(reference)}</p><pre style="white-space:pre-wrap;font:14px/1.7 Arial,sans-serif">${escape(text)}</pre></div>`,...(enquiry.email?{replyTo:enquiry.email}:{})};
}
const attempts=new Map();
export function allowAttempt(ip,now=Date.now()){
 if(attempts.size>5000)for(const [key,x]of attempts)if(now>x.reset)attempts.delete(key);
 const bucket=attempts.get(ip);if(!bucket||now>bucket.reset){attempts.set(ip,{count:1,reset:now+600000});return true;}if(bucket.count>=5)return false;bucket.count++;return true;
}
export const newReference=()=>`AC-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${randomUUID().slice(0,8).toUpperCase()}`;

export function makeOrderEmail(enquiry,reference){
 const fmt=v=>v==null?'Price to be confirmed':'TSh '+new Intl.NumberFormat('en-TZ').format(v);
 const total=enquiry.items.reduce((n,x)=>n+(x.unitPrice??0)*x.qty,0);
 const lines=enquiry.items.map(x=>itemLine(x,fmt)).join('\n');
 const text=`NEW WEBSITE ORDER REQUEST ${reference}\n\nPreferred language: ${enquiry.language==='sw'?'Kiswahili':'English'}\nCustomer: ${enquiry.name}\nPhone / WhatsApp: ${enquiry.phone}\nEmail: ${enquiry.email||'Not provided'}\n\nORDER ITEMS\n${lines}\n\nEstimated total: ${fmt(total)}${enquiry.items.some(x=>x.unitPrice==null)?' plus items requiring a quote':''}\n\nDelivery / customer note:\n${enquiry.message||'No additional note'}\n\nThis is an order request from the Apex Computers website, not a completed payment. Contact the customer on WhatsApp/phone to confirm stock, exact unit, final price, payment and delivery.`;
 return {subject:`Apex Computers ORDER ${reference}`,text,html:`<div style="font-family:Arial,sans-serif;max-width:720px;color:#16352b"><p style="font-size:12px;font-weight:700;color:#f26422;letter-spacing:.08em">APEX COMPUTERS WEBSITE</p><h1 style="margin:0 0 8px">New order request</h1><p><strong>${escape(reference)}</strong></p><pre style="white-space:pre-wrap;font:14px/1.7 Arial,sans-serif;background:#f7f7f5;padding:18px;border-radius:12px">${escape(text)}</pre></div>`,...(enquiry.email?{replyTo:enquiry.email}:{})};
}
