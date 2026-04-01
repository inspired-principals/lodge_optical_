/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// --- PHASE 3: EVENT INTELLIGENCE LAYER ---
// This defines the "Nervous System" of the Lodge Optical Intake System.

export type ClinicalEventType = 
  // Triage Signals
  | 'triage_started'
  | 'triage_mode_selected'
  | 'triage_step_completed'
  | 'triage_abandoned'
  | 'triage_completed'
  | 'triage_result_generated'
  // Behavioral Signals
  | 'cta_clicked'
  | 'exit_intent_triggered'
  | 'scroll_depth'
  | 'time_on_page'
  // Auth Signals
  | 'magic_link_requested'
  | 'magic_link_sent'
  | 'magic_link_verified'
  | 'magic_link_failed'
  | 'token_expired'
  | 'rate_limited'
  // System Health
  | 'client_error'
  | 'api_error'
  | 'triage_error'
  | 'auth_error';

export interface ClinicalEvent {
  id: string; // uuid
  sessionId: string;
  userId?: string;
  event: ClinicalEventType;
  payload: Record<string, any>;
  timestamp: number;
}

// Specific Payload Interfaces for Typsafe Signal Processing
export interface TriagePayload {
  mode: 'camera' | 'manual';
  step?: string;
  acuityOS?: string;
  acuityOD?: string;
  abandonmentStep?: string;
  confidenceScore?: number;
}

export interface AuthPayload {
  email: string;
  reason?: string;
  tokenID?: string;
}

export interface BehavioralPayload {
  element: string;
  destination?: string;
  depth?: number;
  duration?: number;
}

export interface ErrorPayload {
  code: string;
  message: string;
  trace?: string;
}

// --- PHASE 4: CONTROL SURFACE TYPES ---

export interface SystemHealthStatus {
  authStatus: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  latency: number; // ms
  errorRate: number; // per 10min
}

export interface ActionPanelCommands {
  killAllSessions: boolean;
  disableMagicLinks: boolean;
  maintenanceMode: boolean;
  activeRules: Record<string, boolean>; // Phase 5 Rule Toggles
}

export type SegmentProfile = 'skeptic' | 'compliant' | 'analyzer' | 'distressed' | 'unknown';
export type RuleType = 'conversion' | 'accuracy' | 'segmentation';

export interface RuleContext {
  session: {
    id: string;
    mode: 'camera' | 'manual';
    timeOnPage: number;
    idleTime: number;
    startTime: number;
  };
  triage: {
    currentStep: string;
    completed: boolean;
    result?: string;
    confidence: number;
    severity?: 'low' | 'medium' | 'high';
  };
  behavior: {
    clicks: number;
    hovers: number;
    scrollDepth: number;
    exitIntent: boolean;
    ctaClicked: boolean;
    rapidClicking: boolean;
  };
  system: {
    globalStats: {
      cameraUsage: number;
      avgCompletion: number;
      segmentConversion: Record<SegmentProfile, number>;
    };
  };
  segment: SegmentProfile;
}

export interface UIState {
  ctaText: string;
  showSkip: boolean;
  microcopy: string | null;
  resultTone: 'neutral' | 'clinical' | 'soft' | 'urgent';
  modePreference: 'camera' | 'manual' | null;
  detailLevel: 'minimal' | 'high';
}

export interface AdaptiveRule {
  id: string;
  type: RuleType;
  weight: number;
  priority: number;
  cooldown?: number;
  condition: (ctx: RuleContext) => boolean;
  action: (setUI: (update: (prev: UIState) => UIState) => void, ctx: RuleContext) => void;
}


