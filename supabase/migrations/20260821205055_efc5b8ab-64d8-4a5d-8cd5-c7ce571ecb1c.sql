INSERT INTO public.gpt_ads_config (pixel_id, config_code, whatsapp_number, status, whatsapp_contact_enabled, lead_form_submitted_enabled, budget_requested_enabled) 
VALUES (
  'NbZkQktsnntyt6ke638rTA', 
  '<script>!function(w,d,s,u){if(w.oaiq)return;var q=function(){q.q.push(arguments)};q.q=[];w.oaiq=q;var j=d.createElement(s);j.async=1;j.src=u;var f=d.getElementsByTagName(s)[0];f.parentNode.insertBefore(j,f)}(window,document,"script","https://bzrcdn.openai.com/sdk/oaiq.min.js");oaiq("init",{pixelId:"NbZkQktsnntyt6ke638rTA",debug:true});</script>', 
  '5542988377640', 
  'active', 
  true, 
  true, 
  true
) ON CONFLICT DO NOTHING;