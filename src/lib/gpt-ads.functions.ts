import { supabase } from "@/integrations/supabase/client";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const gptAdsConfigSchema = z.object({
  id: z.string().uuid().optional(),
  pixel_id: z.string().nullable(),
  config_code: z.string().nullable(),
  status: z.enum(['active', 'inactive']),
  whatsapp_contact_enabled: z.boolean(),
  lead_form_submitted_enabled: z.boolean(),
  budget_requested_enabled: z.boolean(),
});

export const getGPTAdsConfig = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from('gpt_ads_config' as any)
      .select('*')
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching GPT Ads config:', error);
      return null;
    }
    return data;
  });

export const updateGPTAdsConfig = createServerFn({ method: "POST" })
  .validator((data: unknown) => gptAdsConfigSchema.parse(data))
  .handler(async ({ data }) => {
    const { error } = await supabase
      .from('gpt_ads_config' as any)
      .upsert({
        id: data.id || undefined,
        pixel_id: data.pixel_id,
        config_code: data.config_code,
        status: data.status,
        whatsapp_contact_enabled: data.whatsapp_contact_enabled,
        lead_form_submitted_enabled: data.lead_form_submitted_enabled,
        budget_requested_enabled: data.budget_requested_enabled,
        updated_at: new Date().toISOString(),
      } as any);

    if (error) throw new Error(error.message);
    return { success: true };
  });
