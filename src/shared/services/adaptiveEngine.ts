import { AdaptiveRule, RuleContext, UIState, SegmentProfile } from '../types/clinical';
import { ClinicalEmitter } from './emitter';

// --- THE TRINITY: COMPETING OBJECTIVES ---
const TRINITY_RULES: AdaptiveRule[] = [
  // Accuracy Protects Truth (Universal)
  {
    id: 'accuracy_soften_low_confidence',
    type: 'accuracy',
    weight: 100,
    priority: 100,
    condition: (ctx) => ctx.triage.completed && ctx.triage.confidence < 0.6,
    action: (setUI) => {
      setUI(prev => ({ ...prev, resultTone: 'soft', ctaText: 'Review Your Summary', detailLevel: 'high' }));
    }
  },
  // Segment: THE SKEPTIC
  {
    id: 'skeptic_trust_nudge',
    type: 'segmentation',
    weight: 80,
    priority: 50,
    condition: (ctx) => ctx.segment === 'skeptic' && ctx.session.idleTime > 4000,
    action: (setUI) => {
      setUI(prev => ({ ...prev, microcopy: 'Your clinical data remains local. This is a secure, zero-cloud assessment.', resultTone: 'soft' }));
    }
  },
  // Segment: THE COMPLIANT
  {
    id: 'compliant_fast_track',
    type: 'conversion',
    weight: 90,
    priority: 60,
    condition: (ctx) => ctx.segment === 'compliant' && ctx.triage.completed,
    action: (setUI) => {
      setUI(prev => ({ ...prev, ctaText: 'Finalize Your Enrollment', resultTone: 'clinical' }));
    }
  },
  // Segment: THE ANALYZER
  {
    id: 'analyzer_inject_detail',
    type: 'segmentation',
    weight: 85,
    priority: 55,
    condition: (ctx) => ctx.segment === 'analyzer' && ctx.triage.currentStep === 'report',
    action: (setUI) => {
      setUI(prev => ({ ...prev, detailLevel: 'high', microcopy: 'Review the mathematical deviations in your corneal topography estimation.' }));
    }
  },
  // Segment: THE DISTRESSED
  {
    id: 'distressed_reassurance',
    type: 'segmentation',
    weight: 95,
    priority: 70,
    condition: (ctx) => ctx.segment === 'distressed',
    action: (setUI) => {
      setUI(prev => ({ ...prev, resultTone: 'urgent', microcopy: 'We take ocular distress seriously. Book next-day assessment.', ctaText: 'Escalate to Specialist' }));
    }
  },
  // Global Conversion Pressure
  {
    id: 'cta_mutation_aggressive',
    type: 'conversion',
    weight: 70,
    priority: 40,
    condition: (ctx) => ctx.triage.completed && ctx.segment !== 'skeptic',
    action: (setUI) => {
      setUI(prev => ({ ...prev, ctaText: 'Proceed to Clinical Fit' }));
    }
  }
];

class AdaptiveEngine {
  private lastSegment: SegmentProfile = 'unknown';
  private cooldowns: Map<string, number> = new Map();

  detectSegment(ctx: RuleContext): SegmentProfile {
    const { session, behavior, triage } = ctx;
    
    // 1. The Distressed (Rapid activity + High severity)
    if (behavior.rapidClicking || triage.severity === 'high') return 'distressed';
    
    // 2. The Skeptic (Long idle + Manual mode)
    if (session.idleTime > 6000 && session.mode === 'manual' && behavior.clicks < 3) return 'skeptic';
    
    // 3. The Analyzer (High scroll depth + High content interaction)
    if (behavior.scrollDepth > 70 && session.timeOnPage > 120000) return 'analyzer';
    
    // 4. The Compliant (Fast progression + High CTA engagement)
    if (session.timeOnPage < 90000 && triage.completed) return 'compliant';

    return 'unknown';
  }

  run(context: RuleContext, setUI: (update: (prev: UIState) => UIState) => void, activeRulesConfig: Record<string, boolean>) {
    // A. Assign & Track Segment
    const currentSegment = this.detectSegment(context);
    context.segment = currentSegment;
    
    if (currentSegment !== this.lastSegment && currentSegment !== 'unknown') {
      ClinicalEmitter.emit('api_error', { // Use emitter for signals
        code: 'SEGMENT_ASSIGNED',
        message: `User classified as ${currentSegment}`,
        payload: { segment: currentSegment, sessionId: context.session.id }
      });
      this.lastSegment = currentSegment;
    }

    // B. Safety Line: Accuracy always overrides conversion when confidence is low
    const isHighRisk = context.triage.confidence < 0.6;
    
    const sortedRules = [...TRINITY_RULES].sort((a,b) => b.priority - a.priority);
    
    for (const rule of sortedRules) {
      if (!activeRulesConfig[rule.id]) continue;
      if (this.isOnCooldown(rule)) continue;

      // C. Priority Arbitration
      if (isHighRisk && rule.type === 'conversion') {
         continue; // Suppress conversion on low-confidence clinical metrics
      }

      if (rule.condition(context)) {
        rule.action(setUI, context);
        this.setCooldown(rule);
        
      ClinicalEmitter.emit('api_error', {
        code: 'ADAPTIVE_RULE_TRIGGERED',
        message: `Rule ${rule.id} activated for ${currentSegment}`,
        payload: { ruleId: rule.id, type: rule.type, weight: rule.weight }
      });
      }
    }
  }

  private isOnCooldown(rule: AdaptiveRule) {
    const now = Date.now();
    const lastRun = this.cooldowns.get(rule.id) || 0;
    return (now - lastRun) < (rule.cooldown || 0);
  }

  private setCooldown(rule: AdaptiveRule) {
    this.cooldowns.set(rule.id, Date.now());
  }
}

export const engine = new AdaptiveEngine();

