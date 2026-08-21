import { useEffect, useCallback } from 'react';

declare global {
  interface Window {
    gpt_ads_pixel?: (...args: any[]) => void;
  }
}

export const useGPTAds = (config: any) => {
  useEffect(() => {
    if (!config || config.status !== 'active' || !config.pixel_id || !config.config_code) {
      return;
    }

    // Prevent duplicate initialization
    if (window.gpt_ads_pixel) return;

    try {
      // Execute the provided configuration code
      const script = document.createElement('script');
      script.innerHTML = config.config_code;
      document.head.appendChild(script);

      console.log('GPT Ads Pixel initialized with ID:', config.pixel_id);
    } catch (err) {
      console.error('Failed to initialize GPT Ads Pixel:', err);
    }
  }, [config]);

  const trackEvent = useCallback((eventName: string, params?: Record<string, any>) => {
    if (!config || config.status !== 'active') return;

    // Check if the specific event is enabled in admin
    const enabledKey = `${eventName}_enabled`;
    if (config[enabledKey] === false) return;

    if (typeof window.gpt_ads_pixel === 'function') {
      window.gpt_ads_pixel('track', eventName, params);
    } else {
      console.warn(`GPT Ads: Event "${eventName}" triggered but pixel not initialized.`, params);
    }
  }, [config]);

  return { trackEvent };
};

export const trackGPTAdsEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window.gpt_ads_pixel === 'function') {
    window.gpt_ads_pixel('track', eventName, params);
  }
};
