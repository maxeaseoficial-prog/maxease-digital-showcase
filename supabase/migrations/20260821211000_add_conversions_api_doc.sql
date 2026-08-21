ALTER TABLE public.gpt_ads_config ADD COLUMN IF NOT EXISTS conversions_api_doc text;

UPDATE public.gpt_ads_config 
SET conversions_api_doc = 'Envie este evento do lado do servidor a partir do seu backend quando a conversão ocorrer. Substitua os placeholders pela sua chave da Conversions API e pelos detalhes do evento.

Solicitação da API de Conversões (curl -X POST "https://bzr.openai.com/v1/events?pid=NbZkQktsnntyt6ke638rTA" \

  -H "Authorization: Bearer <API-KEY>" \

  -H "Content-Type: application/json" \

  --data ''{

    "validate_only": false,

    "events": [

      {

        "id": "<EVENT-ID>",

        "type": "page_viewed",

        "timestamp_ms": <TIMESTAMP_MS>,

        "source_url": "https://example.com/conversion",

        "action_source": "web",

        "data": {

          "type": "contents"

        }

      }

    ]

  }'')
WHERE pixel_id = 'NbZkQktsnntyt6ke638rTA';
