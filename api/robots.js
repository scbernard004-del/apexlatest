export default function handler(req,res){
  const host=String(req.headers['x-forwarded-host']||req.headers.host||'').split(',')[0].trim();
  const proto=String(req.headers['x-forwarded-proto']||'https').split(',')[0].trim();
  res.statusCode=200;
  res.setHeader('Content-Type','text/plain; charset=utf-8');
  res.setHeader('Cache-Control','public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
  res.end(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /selection.html\n\nSitemap: ${proto}://${host}/sitemap.xml\n`);
}
