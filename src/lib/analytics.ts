import { track } from "@vercel/analytics";

export type AnalyticsEventName =
  | "register_submit"
  | "register_success"
  | "profile_save_submit"
  | "profile_save_success"
  | "event_register_submit"
  | "event_register_success";

export function trackEvent(name: AnalyticsEventName, props?: Record<string, string | number | boolean>) {
  try {
    track(name, props);
  } catch {
    // ignore if analytics is not available
  }
}


