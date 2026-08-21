ALTER TABLE public.gpt_ads_config ADD COLUMN IF NOT EXISTS conversions_api_doc text;

UPDATE public.gpt_ads_config 
SET conversions_api_doc = 'API de Conversões Configurada';
