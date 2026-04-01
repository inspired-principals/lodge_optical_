export const trackEvent = (action: string, category: string, label?: string) => {
  // Clinical Decision Tracker (Phase 2 Utility)
  // Transparent, zero-PII logging for behavioral optimization
  console.log(`%c[Decision Tracker] %c${category}: ${action}${label ? ` (${label})` : ""}`, 
    "color: #3b82f6; font-weight: bold", 
    "color: #64748b; font-weight: normal",
    { timestamp: new Date().toISOString() });
  
  // Future: Integrate with secure telemetry like PostHog or segment
};

export const trackCTA = (label: string, destination: string) => {
  trackEvent('CTA_CLICK', 'Conversion', `${label} -> ${destination}`);
};
