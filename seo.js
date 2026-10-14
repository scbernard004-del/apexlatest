
'use strict';
(() => {
  const data = window.SHOP_DATA || {config:{},products:[],media:[]};
  const config = data.config || {};
  const products = (data.products || []).filter(p => p.public !== false);
  const media = data.media || [];
  const byMedia = new Map(media.map(m => [m.id,m]));
  const page = document.body?.dataset?.page || 'home';
  const origin = location.protocol === 'http:' || location.protocol === 'https:' ? location.origin : '';
  const abs = value => { if (!value) return ''; try { return new URL(value, origin || location.href).href; } catch { return value; } };
  const setMeta = (name, content, property=false) => {
    if (!content) return;
    const key = property ? 'property' : 'name';
    let el = document.head.querySelector(`meta[${key}="${name}"]`);
    if (!el) { el=document.createElement('meta'); el.setAttribute(key,name); document.head.appendChild(el); }
    el.setAttribute('content',content);
  };
  const setCanonical = href => {
    if (!href || !origin) return;
    let el=document.head.querySelector('link[rel="canonical"]');
    if(!el){el=document.createElement('link');el.rel='canonical';document.head.appendChild(el);}
    el.href=href;
  };
  const addJsonLd = (id, value) => {
    let el=document.getElementById(id);
    if(!el){el=document.createElement('script');el.type='application/ld+json';el.id=id;document.head.appendChild(el);}
    el.textContent=JSON.stringify(value);
  };
  const pageMap={
    home:['Apex Computers Tanzania | Laptops, Desktops & Monitors','Shop laptops, workstations, desktops, monitors and accessories from Apex Computers Tanzania. See clear TSh prices, labelled product photos and order directly on WhatsApp.','index.html'],
    products:['Laptop & Computer Shop Tanzania | Apex Computers','Browse Apex Computers laptops, workstations, desktops, monitors and accessories in Tanzania. Compare TSh prices, specifications and clearly labelled product photos.','products.html'],
    media:['Product Photos & Videos | Apex Computers Tanzania','See Apex Computers product photos, videos and supplied sales artwork before choosing a laptop, monitor, desktop or accessory.','media.html'],
    guide:['How to Buy a Laptop in Tanzania | Apex Computers','A practical buying guide from Apex Computers Tanzania: compare specifications, confirm the exact unit, then order directly by WhatsApp or phone.','buying-guide.html'],
    about:['About Apex Computers Tanzania','Learn how Apex Computers presents clear product prices, labelled stock photos and direct buying support for customers in Tanzania.','about.html'],
    contact:['Contact Apex Computers Tanzania | WhatsApp 0746 584 214','Contact Apex Computers Tanzania for laptop, desktop, monitor and accessory availability. WhatsApp or call 0746 584 214.','contact.html'],
    selection:['Your Selection | Apex Computers','Review your Apex Computers shortlist and send an order enquiry on WhatsApp.','selection.html'],
    catalogue:['Full Product Catalogue Index | Apex Computers Tanzania','Browse the Apex Computers Tanzania product catalogue with current public product links, specifications and TSh prices.','catalogue-index.html']
  };
  function refresh(){
  let title, description, path, image, jsonLd, unavailable=false;
  if(page==='product'){
    const params=new URLSearchParams(location.search);
    const id=params.get('id') || config.featured?.[0] || products[0]?.id;
    const baseProduct=products.find(p=>p.id===id);
    const variants=baseProduct?.variants||[];
    const defaultIndex=variants.length?variants.reduce((best,v,i,rows)=>v.price<rows[best].price?i:best,0):0;
    const requested=Number(params.get('variant')??defaultIndex);
    const index=variants.length?Math.min(Math.max(0,Number.isInteger(requested)?requested:defaultIndex),variants.length-1):0;
    const selected=variants[index];
    const product=baseProduct?{...baseProduct,...(selected?.details||{}),price:selected?.price??baseProduct.price}:null;
    if(product){
      const m=byMedia.get(product.image) || media.find(x=>(x.products||[]).includes(product.id));
      title=`${product.name} | TSh ${Number(product.price||0).toLocaleString('en-US')} | Apex Computers`;
      const computer=/^(Business|Workstation|2-in-1|Everyday|All-in-one|Desktop|Gaming|MacBook|Laptop|Laptops|Desktops)$/i.test(product.category||'');
      const facts=computer?[product.cpu,product.ram?product.ram+'GB RAM':null,product.storage]:[product.description,...(product.summary||[])];
      description=[`${product.name} in Tanzania`,...facts,`Apex price TSh ${Number(product.price||0).toLocaleString('en-US')}`,'Order via WhatsApp 0746 584 214'].filter(Boolean).join('. ')+'.';
      path=`product.html?id=${encodeURIComponent(product.id)}`;
      image=m?.src ? abs(m.src) : abs('apex-logo.png');
      const prices=(product.variants||[]).map(v=>v.price).filter(Number.isFinite);
      const offerBase={ '@type':'Offer', priceCurrency:'TZS', url: origin ? `${origin}/${path}` : undefined, seller:{'@type':'Organization','name':'Apex Computers'}, availability:/in stock|only \d+|available/i.test(product.availability||'')?'https://schema.org/InStock':'https://schema.org/LimitedAvailability' };
      const offers=prices.length>1 && !params.has('variant') ? {'@type':'AggregateOffer','priceCurrency':'TZS','lowPrice':Math.min(...prices),'highPrice':Math.max(...prices),'offerCount':prices.length,'availability':offerBase.availability,'url':offerBase.url,'seller':offerBase.seller} : {...offerBase,price:product.price,url:origin?`${origin}/${path}${selected?'&variant='+index:''}`:undefined};
      jsonLd={'@context':'https://schema.org','@type':'Product','name':product.name,'sku':product.id,'brand':{'@type':'Brand','name':product.brand||'Apex Computers'},'description':description,'image':image?[image]:undefined,'offers':offers};
    }else{
      unavailable=true;
      title='Product unavailable | Apex Computers';
      description='Browse available Apex Computers products or contact us to confirm this listing.';
      path='products.html';
      document.getElementById('seo-product-jsonld')?.remove();
    }
  }
  if(!title){ [title,description,path]=pageMap[page]||pageMap.home; image=abs('apex-logo.png'); }
  document.title=title;
  setMeta('description',description);
  setMeta('robots',page==='selection'||unavailable?'noindex,follow':'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1');
  setMeta('og:site_name','Apex Computers',true); setMeta('og:type',page==='product'?'product':'website',true);
  setMeta('og:title',title,true); setMeta('og:description',description,true);
  if(image)setMeta('og:image',image,true);
  setMeta('twitter:card','summary_large_image'); setMeta('twitter:title',title); setMeta('twitter:description',description); if(image)setMeta('twitter:image',image);
  if(origin && page!=='selection'){
    const canonical=page==='home'?`${origin}/`:`${origin}/${path}`;
    setCanonical(canonical); setMeta('og:url',canonical,true);
  }
  const store={'@context':'https://schema.org','@type':'ComputerStore','name':'Apex Computers','description':'Laptop, desktop, monitor and technology shop serving customers in Tanzania.','areaServed':{'@type':'Country','name':'Tanzania'},'telephone':'+255746584214','email':config.email||'scbernard004@gmail.com','url':origin?origin+'/':undefined,'logo':origin?origin+'/apex-logo.png':undefined,'sameAs':[config.instagram||'https://www.instagram.com/apex_computers_tz/']};
  if(page==='home')addJsonLd('seo-store-jsonld',store);
  if(jsonLd)addJsonLd('seo-product-jsonld',jsonLd);
  if(page==='products'){
    const itemList={'@context':'https://schema.org','@type':'ItemList','name':'Apex Computers product catalogue','numberOfItems':products.length,'itemListElement':products.slice(0,100).map((p,i)=>({'@type':'ListItem','position':i+1,'name':p.name,'url':origin?`${origin}/product.html?id=${encodeURIComponent(p.id)}`:undefined}))};
    addJsonLd('seo-catalogue-jsonld',itemList);
  }
  }
  window.ApexSeo={refresh};
  refresh();
})();
