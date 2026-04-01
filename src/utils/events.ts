export const trackEvent = (event: string, data?: Record<string, any>) => {
  if (typeof window !== "undefined") {
    // Dispatch a custom event that can be caught by analytics providers
    window.dispatchEvent(new CustomEvent("app:event", { detail: { event, data } }));
    
    // Debug logging for development visibility
    console.debug(`[Tracker] ${event}`, data || {});
  }
};
