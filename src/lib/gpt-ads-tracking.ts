import { useEffect, useCallback } from 'react';

declare global {
  interface Window {
    gpt_ads_pixel?: (...args: any[]) => void;
  }
}

export const useGPTAds = (config: any) => {
  useEffect(() => {
    if (!config || config.status !== 'active' || !config.pixel_id) {
      return;
    }

    // Prevent duplicate initialization
    if (window.gpt_ads_pixel) return;

    const configCode = typeof config.config_code === 'string' ? config.config_code.trim() : '';
    if (!configCode || configCode.startsWith('<')) {
      console.warn('GPT Ads: configuration code is empty or invalid; skipping script injection.', configCode);
      return;
    }

    try {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = false;
      script.textContent = configCode;
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
