import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const gptAdsConfigSchema = z.object({
  id: z.string().uuid().optional(),
  pixel_id: z.string().nullable(),
  config_code: z.string().nullable(),
  whatsapp_number: z.string().nullable(),
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

    if (!data) {
      return {
        pixel_id: '',
        config_code: '',
        status: 'inactive',
        whatsapp_contact_enabled: true,
        lead_form_submitted_enabled: true,
        budget_requested_enabled: true,
      };
    }

    return data;
  });

export const updateGPTAdsConfig = createServerFn({ method: "POST" })
  .inputValidator((data) => gptAdsConfigSchema.parse(data))
  .handler(async ({ data }) => {
    // Basic server-side protection: in a real app, verify admin role here
    const { data: result, error } = await supabase
      .from('gpt_ads_config' as any)
      .upsert({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return result;
  });
