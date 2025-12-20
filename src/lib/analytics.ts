import posthog from 'posthog-js';
import ReactGA from 'react-ga4';

// PostHog configuration
export const initPostHog = () => {
  if (typeof window !== 'undefined') {
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

    if (apiKey) {
      posthog.init(apiKey, {
        api_host: apiHost,
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') posthog.debug();
        },
      });
    }
  }
};

// Google Analytics configuration
export const initGA = () => {
  if (typeof window !== 'undefined') {
    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

    if (measurementId) {
      ReactGA.initialize(measurementId);
    }
  }
};

// Track page views
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined') {
    // PostHog
    if (posthog.__loaded) {
      posthog.capture('$pageview', { url });
    }

    // Google Analytics
    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (measurementId) {
      ReactGA.send({ hitType: 'pageview', page: url });
    }
  }
};

// Track custom events
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    // PostHog
    if (posthog.__loaded) {
      posthog.capture(eventName, properties);
    }

    // Google Analytics
    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (measurementId) {
      ReactGA.event({
        category: properties?.category || 'General',
        action: eventName,
        label: properties?.label,
        value: properties?.value,
      });
    }
  }
};

// Identify user
export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    // PostHog
    if (posthog.__loaded) {
      posthog.identify(userId, properties);
    }
  }
};
