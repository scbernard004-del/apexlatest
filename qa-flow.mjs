import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {validateEnquiry, makeEmail, makeOrderEmail} from './api/_enquiry.mjs';
import {createHandler} from './api/order.js';

// Render/data contract tests. These do not substitute for browser layout tests.
const data=JSON.parse(fs.readFileSync(new URL('./api/catalog.json',import.meta.url),'utf8'));
const publicProducts=data.products.filter(p=>p.public!==false);
const mediaMap=new Map(data.media.map(m=>[m.id,m]));
let checks=0;
const check=(name,test)=>{try{assert.ok(test,name);checks++;}catch(e){throw new Error(name,{cause:e});}};
const format=n=>'TSh '+new Intl.NumberFormat('en-TZ').format(n);
const baseEnquiry={name:'QA Test',phone:'0700000000',consent:true,items:[]};
const selectedProduct=(p,i)=>({...p,...(p.variants?.[i]?.details||{})});
const price=(p,i)=>p.variants?.[i]?.price??p.price;
const defaultIndex=p=>p.variants?.length?p.variants.reduce((best,v,i,rows)=>v.price<rows[best].price?i:best,0):0;

function fixture(page,search='',language='en'){
 const nodes=new Map(),memory=new Map([['apex-computers-language',language]]);
 const node=key=>{if(!nodes.has(key))nodes.set(key,{innerHTML:'',textContent:'',value:'',dataset:{},attributes:{},style:{setProperty(){}},classList:{add(){},remove(){},toggle(){},contains(){return false}},setAttribute(k,v){this.attributes[k]=v;},getAttribute(k){return this.attributes[k]??null;},addEventListener(){},querySelector(s){return node(key+' '+s)},querySelectorAll(){return[]},getBoundingClientRect(){return {height:120}},scrollIntoView(){},remove(){nodes.delete(key)}});return nodes.get(key)};
 const head=node('head');head.appendChild=el=>{if(el.id)nodes.set('#'+el.id,el);};head.querySelector=s=>node('head '+s);
 const document={readyState:'loading',body:{dataset:{page},classList:node('body').classList,append(){}},head,title:'',documentElement:{dataset:{},style:node('html').style},querySelector:node,querySelectorAll(){return[]},getElementById:id=>nodes.get('#'+id)||null,createElement:tag=>node('created '+tag+nodes.size),addEventListener(){},dispatchEvent(){},createTreeWalker(){return {nextNode(){return null}}}};
 const location=new URL('http://qa.invalid/'+(page==='home'?'index.html':page+'.html')+search);
 const window={SHOP_DATA:data,addEventListener(){},scrollY:0};
 const box={window,document,location,history:{replaceState(a,b,url){location.search=new URL(url).search;}},localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},Intl,URL,URLSearchParams,Map,Set,Number,Date,console,NodeFilter:{SHOW_TEXT:4},CustomEvent:class{},requestAnimationFrame(){},setTimeout(){return 1},clearTimeout(){},fetch(){throw Error('QA must not transmit requests')}};
 vm.createContext(box);
 vm.runInContext(fs.readFileSync(new URL('./i18n.js',import.meta.url),'utf8'),box);
 let source=fs.readFileSync(new URL('./multipage.js',import.meta.url),'utf8');
  source=source.replace("  if (document.readyState === 'loading')",'  window.__qa={renderHomePage,renderProductsPage,renderProductPage,renderMediaPage,renderGuidePage,renderAboutPage,renderContactPage,renderSelectionPage,addToSelection,selectionRows,applyTheme,productCard};\n  if (document.readyState === \'loading\')');
 vm.runInContext(source,box);
 const seo=()=>vm.runInContext(fs.readFileSync(new URL('./seo.js',import.meta.url),'utf8'),box);
 return {box,nodes,node,memory,seo,api:window.__qa,html:()=>node('#page-content').innerHTML};
}

const nonComputers=publicProducts.filter(p=>['Monitors','Accessories','Storage','Printers'].includes(p.category));
for(const p of nonComputers){
 for(const lang of ['en','sw']){
  const f=fixture('product','?id='+p.id,lang);
  const card=f.api.productCard(p);
  check(`No RAM placeholder on ${p.category} card ${p.id}:${lang}`,!card.includes('Confirm RAM')&&!card.includes('Thibitisha RAM'));
  f.api.renderProductPage();
  const table=f.html().match(/<table class="mp-spec-table">([\s\S]*?)<\/table>/)?.[1];
  check(`No computer specification labels ${p.id}:${lang}`,!/<th[^>]*>(?:Processor|Memory|Storage|Prosesa|Kumbukumbu|Hifadhi|RAM)<\/th>/.test(table));
  check(`No empty specifications ${p.id}:${lang}`,!/<td><\/td>|undefined/.test(table));
  if(p.category==='Monitors'){
   check(`Monitor card has no RAM or drive claims ${p.id}:${lang}`,!/\b(?:RAM|HDD|SSD|CPU)\b/.test(card));
   check(`Monitor card uses known display detail ${p.id}:${lang}`,card.includes(f.box.window.I18n.translate(p.summary[0])));
  }
  f.seo();
  const schema=JSON.parse(f.nodes.get('#seo-product-jsonld').textContent);
  check(`No computer search claims ${p.id}:${lang}`,!/\b(?:RAM|HDD|SSD|CPU)\b/.test(schema.description));
 }
 const enquiry=validateEnquiry({...baseEnquiry,items:[{id:p.id,qty:1}]});
 check(`Non-computer order details are defined ${p.id}`,typeof enquiry.items[0].configuration==='string'&&enquiry.items[0].configuration.length>0);
 for(const [kind,build] of [['enquiry',makeEmail],['order',makeOrderEmail]]){
  const text=build(enquiry,'QA').text;
  check(`No RAM or drive claims in ${kind} ${p.id}`,!/\b(?:RAM|HDD|SSD|CPU)\b|undefined/.test(text));
  check(`Correct model and price in ${kind} ${p.id}`,text.includes(p.name)&&text.includes(format(p.price)));
 }
}
for(const lang of ['en','sw']){
 const f=fixture('products','?category=Monitors',lang);f.api.renderProductsPage();
 const html=f.node('#mp-product-grid').innerHTML;
 check(`Monitor category renders all four products ${lang}`,(html.match(/class="mp-product-card"/g)||[]).length===4);
 check(`Monitor category has no RAM or drives ${lang}`,!/\b(?:RAM|HDD|SSD|CPU)\b/.test(html));
 const bag=fixture('selection','',lang);
 for(const p of publicProducts.filter(p=>p.category==='Monitors'))bag.api.addToSelection(p.id);
 bag.api.renderSelectionPage();
 check(`Monitor shortlist has no RAM or drives ${lang}`,!/\b(?:RAM|HDD|SSD|CPU)\b/.test(bag.html()));
 const link=bag.html().match(/data-interaction="selection-whatsapp"[^>]*href="([^"]+)"/)?.[1];
 const message=new URL(link.replaceAll('&amp;','&')).searchParams.get('text');
 check(`Monitor WhatsApp shortlist has no computer claims ${lang}`,!/\b(?:RAM|HDD|SSD|CPU)\b/.test(message));
 check(`Monitor shortlist total unchanged ${lang}`,message.includes('TSh 2,070,000'));
}
const fallbackCard=fixture('products');
for(const category of ['Monitors','Accessories','Storage','Printers']){
 const sample={id:'qa-only',name:'QA '+category,category,description:'Product information',price:1000,ram:null,summary:[],specs:[{label:'Display',value:'27-inch'},{label:'Memory',value:'Confirm RAM'}]};
 const html=fallbackCard.api.productCard(sample);
 check(`Empty summary fallback is category-aware for ${category}`,!html.includes('Confirm RAM')&&html.includes('27-inch'));
}
const legacyMonitor=fallbackCard.api.productCard({id:'qa-only',name:'QA monitor',category:'Monitors',cpu:'8GB RAM',ram:8,storage:'1TB HDD',summary:['8GB RAM','1TB HDD','27-inch'],price:1000});
check('Monitor cards ignore misplaced computer fields',!/\b(?:RAM|HDD|SSD|CPU)\b/.test(legacyMonitor)&&legacyMonitor.includes('27-inch'));
const staticIndex=fs.readFileSync(new URL('./catalogue-index.html',import.meta.url),'utf8');
for(const p of nonComputers){
 const card=[...staticIndex.matchAll(/<article class="catalogue-item">[\s\S]*?<\/article>/g)].find(m=>m[0].includes('id='+p.id+'"'))?.[0];
 check(`Static catalogue has correct type details ${p.id}`,Boolean(card)&&!/\b(?:RAM|HDD|SSD|CPU)\b/.test(card));
 check(`Non-computer data contains no CPU/RAM/storage fields ${p.id}`,!['cpu','ram','storage'].some(k=>k in p));
}

for(const p of publicProducts){
 for(let i=0;i<Math.max(1,p.variants?.length||0);i++){
  const selected=selectedProduct(p,i),selectedPrice=price(p,i);
  const result=validateEnquiry({...baseEnquiry,items:[{id:p.id,variant:i,qty:2,unitPrice:1}]});
  check(`Server price ${p.id}:${i}`,result.items[0].unitPrice===selectedPrice);
  check(`Server processor ${p.id}:${i}`,result.items[0].cpu===selected.cpu);
  check(`Server chosen model ${p.id}:${i}`,result.items[0].name===selected.name);
  if(selected.ram!=null){
   check(`Computer enquiry retains memory ${p.id}:${i}`,makeEmail(result,'QA').text.includes(selected.ram+'GB RAM'));
   check(`Computer order retains memory ${p.id}:${i}`,makeOrderEmail(result,'QA').text.includes(selected.ram+'GB RAM'));
  }
  for(const lang of ['en','sw']){
   const f=fixture('product',`?id=${p.id}&variant=${i}`,lang);f.api.renderProductPage();
   const html=f.html();
   check(`Detail price ${p.id}:${i}:${lang}`,html.includes('id="mp-detail-price">'+format(selectedPrice)));
   const link=html.match(/id="mp-product-wa"[^>]*href="([^"]+)"/)?.[1];
   const message=new URL(link.replaceAll('&amp;','&')).searchParams.get('text');
   check(`WhatsApp price ${p.id}:${i}:${lang}`,message.includes(format(selectedPrice)));
   check(`WhatsApp model ${p.id}:${i}:${lang}`,message.includes(selected.name));
   const hero=mediaMap.get(selected.image);
   check(`Detail photo ${p.id}:${i}:${lang}`,html.includes('src="'+hero.src+'"'));
   for(const mid of [selected.image,...(selected.photos||[]),selected.flyer].filter(Boolean)){
    const m=mediaMap.get(mid);check(`Media owner ${p.id}:${mid}`,m?.products?.includes(p.id)&&!m.archived);
   }
   f.seo();
   const schema=JSON.parse(f.nodes.get('#seo-product-jsonld').textContent);
   check(`Search metadata price ${p.id}:${i}:${lang}`,schema.offers.price===selectedPrice);
   check(`Search metadata image ${p.id}:${i}:${lang}`,schema.image[0].endsWith(hero.src));
  }
 }
}

for(const [page,fn] of Object.entries({home:'renderHomePage',products:'renderProductsPage',media:'renderMediaPage',guide:'renderGuidePage',about:'renderAboutPage',contact:'renderContactPage',selection:'renderSelectionPage'})){
 for(const lang of ['en','sw']){const f=fixture(page,'',lang);f.api[fn]();check(`Render ${page}:${lang}`,f.html().length>300);}
}
for(const lang of ['en','sw']){
 const f=fixture('contact','',lang);f.api.renderContactPage();
 const cards=[...f.html().matchAll(/<a class="mp-contact-card"[^>]*>[\s\S]*?<\/a>/g)].map(match=>match[0]);
 const labels=['Call us','WhatsApp us','Send SMS','Email us','Instagram'];
 const details=[data.config.phoneDisplay,f.box.window.I18n.translate('Fast product help'),f.box.window.I18n.translate('Normal text message'),data.config.email,'@apex_computers_tz'];
 const destinations=['tel:+'+data.config.phone,'https://wa.me/'+data.config.phone,'sms:+'+data.config.phone,'mailto:'+data.config.email,data.config.instagram];
 check(`All five contact channels appear once ${lang}`,cards.length===5);
 for(let i=0;i<cards.length;i++){
  const card=cards[i],href=card.match(/href="([^"]+)"/)?.[1].replaceAll('&amp;','&');
  check(`Contact label and detail are present ${labels[i]}:${lang}`,card.includes(f.box.window.I18n.translate(labels[i]))&&card.includes(details[i]));
  check(`Contact destination is correct ${labels[i]}:${lang}`,href===destinations[i]||href.startsWith(destinations[i]+'?'));
  check(`External contact opens safely ${labels[i]}:${lang}`,[1,4].includes(i)?card.includes('target="_blank" rel="noopener"'):!card.includes('target="_blank"'));
  check(`Contact decorations are hidden from screen readers ${labels[i]}:${lang}`,!/<svg(?![^>]*aria-hidden="true")/.test(card));
  if([1,2].includes(i)){
   const message=decodeURIComponent(href.split(i===1?'?text=':'?body=')[1]);
   check(`Contact message matches language ${labels[i]}:${lang}`,message.startsWith(lang==='sw'?'Habari Apex Computers':'Hi Apex Computers'));
  }
 }
}
const gallery=fixture('media');gallery.api.renderMediaPage();gallery.node('#mp-media-type').value='flyer';gallery.node('#mp-media-type').onchange();
check('Flyer filter renders cards',gallery.node('#mp-media-grid').innerHTML.includes('mp-media-card'));
for(const m of data.media.filter(m=>m.id.startsWith('chat-Oct10')&&m.kind==='flyer')){
 const f=fixture('media','?media='+m.id);f.api.renderMediaPage();
 check(`Flyer detail ${m.id}`,f.html().includes(m.src));
 check(`Flyer product variant ${m.id}`,f.html().includes('product.html?id='+m.products[0]+(m.variantIndex!=null?'&variant='+m.variantIndex:'')));
}
const changed=fixture('product','?id=p10&variant=0');changed.api.renderProductPage();changed.seo();changed.node('#mp-variant-select').onchange({target:{value:'1'}});
check('Variant change updates CPU',changed.html().includes('8th Gen Intel Core i7'));
check('Variant change updates price',changed.html().includes('id="mp-detail-price">TSh 1,100,000'));
check('Variant change updates photo',changed.html().includes(mediaMap.get(data.products.find(p=>p.id==='p10').variants[1].details.image).src));
check('Variant change updates metadata',JSON.parse(changed.nodes.get('#seo-product-jsonld').textContent).offers.price===1100000);
const bag=fixture('selection');bag.api.addToSelection('p10',1);bag.api.addToSelection('hp-elitedesk-800-g5-sff',1);bag.api.renderSelectionPage();
check('Selection total matches variants',bag.html().includes('TSh 1,730,000'));
check('Selection links retain chosen variant',bag.html().includes('product.html?id=p10&variant=1'));
check('Selection uses chosen variant photo',bag.html().includes(mediaMap.get(data.products.find(p=>p.id==='p10').variants[1].details.image).src));
for(const id of [data.products.find(p=>p.public===false).id,'missing-product']){
 const f=fixture('product','?id='+id);f.api.renderProductPage();f.seo();
 check(`Unavailable ${id} has no purchase action`,!f.html().includes('id="mp-product-wa"'));
 check(`Unavailable ${id} is noindex`,f.node('head meta[name="robots"]').attributes.content==='noindex,follow');
 check(`Unavailable ${id} has no product schema`,!f.nodes.has('#seo-product-jsonld'));
}
const invalid=fixture('product','?id=p10&variant=0.5');invalid.api.renderProductPage();check('Fractional variant falls back to valid configuration',invalid.html().includes('id="mp-detail-price">TSh 890,000'));
const translated=fixture('about','','sw');translated.api.renderAboutPage();check('Updated About translates',!translated.html().includes('Computers, upgrades and support in one place.'));
const dragonfly=fixture('product','?id=hp-elite-dragonfly-g3&variant=1');dragonfly.api.renderProductPage();check('32GB Dragonfly option shows 32GB RAM',dragonfly.html().includes('32GB RAM'));
const storage=fixture('product','?id=p18&variant=1');storage.api.renderProductPage();check('512GB storage option shows its exact storage',storage.html().includes('<td>512GB SSD</td>'));
const firefly=fixture('product','?id=p7&variant=2');firefly.api.renderProductPage();check('32GB Firefly option shows RAM and storage',firefly.html().includes('<td>32GB RAM</td>')&&firefly.html().includes('<td>1TB SSD</td>'));
const black=fixture('product','?id=aio9&variant=1');black.api.renderProductPage();check('Black all-in-one option shows black reference',black.html().includes(mediaMap.get('online-hp-27-cr2034nh-black').src)&&!black.html().includes(mediaMap.get('online-hp-27-cr2033nh-white').src));
check('Logo tagline translates',translated.box.window.I18n.translate('Technology for work, study and business')==='Teknolojia kwa kazi, masomo na biashara');
translated.api.applyTheme('dark');check('Dark mode sets theme',translated.box.document.documentElement.dataset.theme==='dark');
translated.api.applyTheme('light');check('Light mode sets theme',translated.box.document.documentElement.dataset.theme==='light');

for(const [name,items] of Object.entries({held:[{id:data.products.find(p=>p.public===false).id,qty:1}],duplicates:[{id:'p10',qty:1},{id:'p10',qty:1}],invalidVariant:[{id:'p10',variant:5,qty:1}],invalidQuantity:[{id:'p10',qty:0}]})){
 let rejected=false;try{validateEnquiry({...baseEnquiry,items});}catch{rejected=true;}check('Server rejects '+name,rejected);
}
const capture=async(handler,body,method='POST')=>{let payload;const res={setHeader(){},end(value){payload=JSON.parse(value)}};await handler({method,headers:{host:'qa.invalid',origin:'http://qa.invalid','content-type':'application/json','x-vercel-forwarded-for':'qa-'+checks},body},res);return {status:res.statusCode,payload};};
let sent;
const handler=createHandler({env:{SMTP_USER:'qa@example.invalid',SMTP_PASS:'mock-only'},sendMail:async mail=>{sent=mail}});
const valid={...baseEnquiry,items:[{id:'p10',variant:1,qty:1},{id:'hp-elitedesk-800-g5-sff',variant:1,qty:1}]};
const success=await capture(handler,valid);
check('Order API accepts valid mock request',success.status===200&&success.payload.ok);
check('Mock order email totals correct prices',sent.text.includes('TSh 1,730,000'));
check('Mock email includes selected CPU label',sent.text.includes('Core i7 · 8GB · 256GB SSD · Touch'));
check('Order fallback without SMTP', (await capture(createHandler({env:{}}),valid)).status===503);
check('Order API rejects GET',(await capture(handler,valid,'GET')).status===405);
check('Notification HTML escapes customer input',makeEmail({...validateEnquiry(valid),message:'<script>test</script>'},'QA').html.includes('&lt;script&gt;test&lt;/script&gt;'));
console.log(`Flow QA: ${checks} passed. Render/data contracts checked in English and Kiswahili; no real emails sent.`);
