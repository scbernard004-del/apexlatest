import fs from 'node:fs';
const catalog=JSON.parse(fs.readFileSync(new URL('./catalog.json',import.meta.url),'utf8'));
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
export default function handler(req,res){
 const host=String(req.headers['x-forwarded-host']||req.headers.host||'').split(',')[0].trim();
 const proto=String(req.headers['x-forwarded-proto']||'https').split(',')[0].trim();
 const base=`${proto}://${host}`;
 const lastmod=catalog.config?.accuracyUpdated||catalog.config?.catalogueDate||new Date().toISOString().slice(0,10);
 const staticUrls=[['/',1,'daily'],['/products.html',.95,'daily'],['/catalogue-index.html',.9,'daily'],['/media.html',.75,'weekly'],['/buying-guide.html',.75,'monthly'],['/about.html',.5,'monthly'],['/contact.html',.6,'monthly']];
 const productUrls=(catalog.products||[]).filter(p=>p.public!==false).map(p=>[`/product.html?id=${encodeURIComponent(p.id)}`,.9,'daily']);
 const urls=[...staticUrls,...productUrls].map(([path,priority,changefreq])=>`<url><loc>${esc(base+path)}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`).join('');
 res.statusCode=200;res.setHeader('Content-Type','application/xml; charset=utf-8');res.setHeader('Cache-Control','public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');res.end(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
}
