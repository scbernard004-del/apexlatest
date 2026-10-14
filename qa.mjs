import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import sitemapHandler from './api/sitemap.js';
import robotsHandler from './api/robots.js';

const root = process.cwd();
const data = JSON.parse(fs.readFileSync(path.join(root, 'api/catalog.json'), 'utf8'));
let pass = 0;
const failures = [];
const ok = (name, cond, detail='') => {
  if (cond) { pass++; console.log('PASS', name); }
  else { failures.push(`${name}${detail ? ' — ' + detail : ''}`); console.error('FAIL', name, detail); }
};
const publicProducts = data.products.filter(p => p.public !== false);
const publicIds = new Set(publicProducts.map(p => p.id));
const mediaMap = new Map(data.media.map(m => [m.id, m]));

ok('Unique product IDs', new Set(data.products.map(p => p.id)).size === data.products.length);
ok('Unique public product names', new Set(publicProducts.map(p => p.name.toLowerCase())).size === publicProducts.length);
ok('Unique media IDs', new Set(data.media.map(m => m.id)).size === data.media.length);
ok('All public products have name/price/image', publicProducts.every(p => p.name && Number(p.price) > 0 && p.image));
ok('All public products have source notes', publicProducts.every(p => p.source && p.note));
ok('Featured IDs are public products', (data.config.featured || []).every(id => publicIds.has(id)));
ok('Homepage first 8 avoids generic model-reference heroes', (data.config.featured || []).slice(0,8).every(id => !['model-reference'].includes(data.products.find(p=>p.id===id)?.imageStatus)));
ok('Unsafe inferred 835 G10 is not public', !publicProducts.some(p => /835 G10/i.test(p.name)));
ok('Unsafe inferred IdeaPad D330 is not public', !publicProducts.some(p => /D330/i.test(p.name)));

const missing = [];
for (const p of publicProducts) {
  for (const id of [p.image, ...(p.photos || []), p.flyer].filter(Boolean)) {
    const m = mediaMap.get(id);
    if (!m) { missing.push(`${p.id}:${id}:record`); continue; }
    if (!fs.existsSync(path.join(root, m.src))) missing.push(`${p.id}:${id}:${m.src}`);
    if (!(m.products || []).includes(p.id)) missing.push(`${p.id}:${id}:ownership`);
  }
}
ok('Public product media resolves', missing.length === 0, missing.slice(0,8).join(','));

const visibleMedia = data.media.filter(m => !m.archived && (m.products || []).some(id => publicIds.has(id)));
const visibleMissing = visibleMedia.filter(m => !m.src || !fs.existsSync(path.join(root,m.src)) || (m.thumb && !fs.existsSync(path.join(root,m.thumb))));
ok('All public gallery media files exist', visibleMissing.length === 0, visibleMissing.slice(0,5).map(m=>m.id).join(','));

const heroHashes = new Map();
for (const p of publicProducts) {
  const m = mediaMap.get(p.image);
  if (!m?.src || !fs.existsSync(path.join(root, m.src))) continue;
  const hash = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, m.src))).digest('hex');
  if (!heroHashes.has(hash)) heroHashes.set(hash, []);
  heroHashes.get(hash).push(p.id);
}
const dupHeroes = [...heroHashes.values()].filter(v => v.length > 1);
ok('No repeated public hero image bytes', dupHeroes.length === 0, JSON.stringify(dupHeroes));

ok('Correct WhatsApp number', data.config.phone === '255746584214' && data.config.phoneDisplay === '0746 584 214');
ok('Correct notification email', data.config.email === 'scbernard004@gmail.com');
for (const [id, price] of Object.entries({
  'hp-elitebook-840-g6':880000,
  'hp-e22-g4':370000,
  'dell-optiplex-7020':480000,
  'hp-elitedisplay-e273m':650000,
  'fortis':690000,
  'p23':1550000,
  'hp-elite-dragonfly-g3':1580000
  ,'hp-elitebook-x360-1040-g8':1450000
  ,'dell-latitude-5310-2-in-1':770000
  ,'p10':890000
  ,'dell-latitude-7480':650000
  ,'hp820':580000
  ,'hp-prodesk-600-g6':930000
  ,'hp-elitedesk-800-g5-sff':580000
  ,'dell-p2422h':370000
  ,'lenovo-27-frameless-monitor':680000
})) {
  const p = data.products.find(x => x.id === id);
  ok(`Price lock ${id}`, p?.price === price, `found ${p?.price}`);
}

const browserData = fs.readFileSync(path.join(root,'catalog.js'),'utf8').replace(/^window\.SHOP_DATA = /,'').replace(/;\s*$/,'');
ok('Browser catalogue matches API catalogue', JSON.stringify(JSON.parse(browserData)) === JSON.stringify(data));

const htmlFiles = ['index.html','products.html','product.html','media.html','buying-guide.html','about.html','contact.html','selection.html','catalogue-index.html'];
for (const file of htmlFiles) {
  const s = fs.readFileSync(path.join(root, file), 'utf8');
  ok(`${file} has title`, s.includes('<title>') && s.includes('</title>'));
  ok(`${file} has description`, s.includes('name="description"'));
  ok(`${file} has viewport`, s.includes('name="viewport"'));
}
const missingRefs=[];
for(const file of htmlFiles){
  const s=fs.readFileSync(path.join(root,file),'utf8');
  for(const match of s.matchAll(/(?:href|src)="([^"#]+)"/g)){
    const value=match[1];
    if(/^(https?:|tel:|sms:|mailto:|data:|javascript:)/.test(value)) continue;
    const target=value.split('?')[0];
    if(!target || target.startsWith('/')) continue;
    if(!fs.existsSync(path.join(root,target))) missingRefs.push(`${file}:${value}`);
  }
}
ok('Static HTML local references resolve', missingRefs.length===0, missingRefs.slice(0,8).join(','));

ok('SEO helper present', fs.existsSync(path.join(root,'seo.js')));
ok('Sitemap endpoint present', fs.existsSync(path.join(root,'api/sitemap.js')));
ok('Robots endpoint present', fs.existsSync(path.join(root,'api/robots.js')));
const vercel = JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8'));
ok('Vercel rewrites sitemap and robots', vercel.rewrites?.some(x=>x.source==='/sitemap.xml') && vercel.rewrites?.some(x=>x.source==='/robots.txt'));
ok('Long-cache media headers exist', [1,2,3,4].every(n => vercel.headers?.some(x => x.source === `/media-0${n}/(.*)`)));
ok('Selection page is noindex', fs.readFileSync(path.join(root,'selection.html'),'utf8').includes('name="robots" content="noindex,follow"'));
ok('Crawlable catalogue index contains every public product', publicProducts.every(p => fs.readFileSync(path.join(root,'catalogue-index.html'),'utf8').includes(`product.html?id=${p.id}`)));

function callEndpoint(handler){ let body=''; const headers={}; const req={headers:{host:'apex.example','x-forwarded-proto':'https'}}; const res={statusCode:0,setHeader(k,v){headers[k]=v},end(v=''){body=String(v)}}; handler(req,res); return {body,headers}; }
const sitemap=callEndpoint(sitemapHandler).body;
ok('Generated sitemap is XML', sitemap.startsWith('<?xml') && sitemap.includes('<urlset'));
ok('Generated sitemap contains homepage', sitemap.includes('<loc>https://apex.example/</loc>'));
ok('Generated sitemap contains all public products', publicProducts.every(p => sitemap.includes(`product.html?id=${encodeURIComponent(p.id)}`.replace(/&/g,'&amp;'))));
const robots=callEndpoint(robotsHandler).body;
ok('Generated robots.txt references sitemap', robots.includes('Sitemap: https://apex.example/sitemap.xml'));
ok('Generated robots.txt blocks API and selection', robots.includes('Disallow: /api/') && robots.includes('Disallow: /selection.html'));

const videos = data.media.filter(m => m.kind === 'video');
ok('Videos use local files', videos.every(m => m.src && fs.existsSync(path.join(root,m.src))));
ok('No video over 4 MB', videos.every(m => fs.statSync(path.join(root,m.src)).size < 4*1024*1024));
const multipage=fs.readFileSync(path.join(root,'multipage.js'),'utf8');
ok('Videos do not preload media bytes', multipage.includes('preload="none"') && !multipage.includes('preload="metadata"'));
ok('Lazy images request async decoding', multipage.includes('loading="lazy" decoding="async"'));
ok('Homepage has recommendation CTA', multipage.includes('Get a recommendation'));
ok('Shop has photo-source filter', multipage.includes('mp-photo-source'));
ok('Header Instagram link removed', !multipage.includes('mp-nav-instagram'));
ok('Footer has dedicated WhatsApp CTA', multipage.includes('mp-footer-whatsapp') && multipage.includes('mp-footer-support'));
ok('Floating WhatsApp hides when footer is visible', multipage.includes('mp-footer-in-view') && multipage.includes('__apexFooterObserver'));
const stylePro=fs.readFileSync(path.join(root,'storefront-pro.css'),'utf8');
ok('Product action labels can wrap', stylePro.includes('.mp-product-actions .button.whatsapp span{white-space:normal!important}'));
ok('Mobile WhatsApp action receives full row', stylePro.includes('.mp-product-actions .button.whatsapp{grid-column:1/-1!important'));
ok('Kiswahili has no font-size override', !/html\[lang=["']sw["']\][^{]*\{[^}]*font-size/i.test(stylePro));
ok('Apex favicon PNG present', fs.existsSync(path.join(root,'apex-favicon.png')) && fs.existsSync(path.join(root,'favicon.ico')));
ok('All HTML pages use Apex favicon', htmlFiles.every(file => fs.readFileSync(path.join(root,file),'utf8').includes('apex-favicon.png?v=2.4.4')));
for (const id of ['hp-elitebook-x360-1030-g7-flyer','hp-zbook-power-g7-flyer']) { const m=data.media.find(x=>x.id===id); ok(`Broken placeholder flyer archived ${id}`, m?.archived===true); }

const expectedDirs=['api','media-01','media-02','media-03','media-04'];
const actualDirs=fs.readdirSync(root,{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>x.name).sort();
ok('Only five GitHub folders', JSON.stringify(actualDirs)===JSON.stringify(expectedDirs.sort()), actualDirs.join(','));
ok('Each media folder stays below 100 files', [1,2,3,4].every(n => fs.readdirSync(path.join(root,`media-0${n}`)).length < 100));

for (const file of ['multipage.js','i18n.js','catalog.js','seo.js','api/_enquiry.mjs','api/order.js','api/enquire.js','api/sitemap.js','api/robots.js']) {
  try { execFileSync(process.execPath, ['--check', path.join(root,file)], {stdio:'pipe'}); ok(`${file} syntax`, true); }
  catch (e) { ok(`${file} syntax`, false, String(e.stderr || e.message).slice(0,200)); }
}

console.log(`\nQA: ${pass} passed, ${failures.length} failed. Public products: ${publicProducts.length}. Public media: ${visibleMedia.length}.`);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
