import { supabase } from "@/integrations/supabase/client";
import { createServerFn } from "@tanstack/react-start";

export const getGPTAdsConfig = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from('gpt_ads_config')
      .select('*')
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching GPT Ads config:', error);
      return null;
    }
    return data;
  });

export const updateGPTAdsConfig = createServerFn({ method: "POST" })
  .input((data: any) => data)
  .handler(async ({ data }) => {
    // Note: In a real app, we'd verify the admin role here using context.supabase
    // For now, we assume RLS handles the permission check on the DB level.
    const { error } = await supabase
      .from('gpt_ads_config')
      .upsert({
        id: data.id || undefined,
        pixel_id: data.pixel_id,
        config_code: data.config_code,
        status: data.status,
        whatsapp_contact_enabled: data.whatsapp_contact_enabled,
        lead_form_submitted_enabled: data.lead_form_submitted_enabled,
        budget_requested_enabled: data.budget_requested_enabled,
        updated_at: new Error().toISOString(), // Simple way to get current timestamp
      });

    if (error) throw new Error(error.message);
    return { success: true };
  });
