export default function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET'){res.setHeader('Allow','GET');res.statusCode=405;return res.end(JSON.stringify({ok:false}));}
  res.setHeader('Content-Type','application/json');
  res.end(JSON.stringify({emailEnabled:Boolean(process.env.SMTP_USER&&process.env.SMTP_PASS),turnstileSiteKey:process.env.TURNSTILE_SITE_KEY||null}));
}
