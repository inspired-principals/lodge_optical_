import { useState, useEffect, useRef } from 'react';
import { RuleContext, UIState } from '../types/clinical';
import { engine } from '@shared/services/adaptiveEngine';

export function useAdaptiveUI(localContext: any) {
  const [uiState, setUIState] = useState<UIState>({
    ctaText: 'Continue',
    showSkip: false,
    microcopy: null,
    resultTone: 'neutral',
    modePreference: null,
    detailLevel: 'minimal'
  });

  const [activeRules, setActiveRules] = useState<Record<string, boolean>>({
    accuracy_soften_low_confidence: true,
    skeptic_trust_nudge: true,
    compliant_fast_track: true,
    analyzer_inject_detail: true,
    distressed_reassurance: true,
    cta_mutation_aggressive: true
  });

  const [startTime] = useState(Date.now());
  const [idleTime, setIdleTime] = useState(0);
  const lastActiveRef = useRef(Date.now());

  useEffect(() => {
    const handleActivity = () => {
      lastActiveRef.current = Date.now();
      setIdleTime(0);
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    
    const interval = setInterval(() => {
      setIdleTime(Date.now() - lastActiveRef.current);
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      clearInterval(interval);
    };
  }, []);

  // Run Engine Loop
  useEffect(() => {
    const context: RuleContext = {
      session: {
        id: 'local_session',
        mode: localContext.session?.mode || 'camera',
        timeOnPage: Date.now() - startTime,
        idleTime,
        startTime
      },
      triage: {
        currentStep: localContext.triage?.currentStep || 'none',
        completed: localContext.triage?.completed || false,
        result: localContext.triage?.result,
        confidence: localContext.triage?.confidence ?? 1,
        severity: localContext.triage?.severity
      },
      behavior: {
        clicks: 0,
        hovers: 0,
        scrollDepth: (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100 || 0,
        exitIntent: false,
        ctaClicked: false,
        rapidClicking: false,
        ...localContext.behavior
      },
      system: {
        globalStats: {
          cameraUsage: 0.5,
          avgCompletion: 0.7,
          segmentConversion: { skeptic: 0.1, compliant: 0.8, analyzer: 0.4, distressed: 0.2, unknown: 0 }
        }
      },
      segment: 'unknown'
    };

    const debouncer = setTimeout(() => {
      engine.run(context, setUIState, activeRules);
    }, 500);

    return () => clearTimeout(debouncer);
  }, [idleTime, localContext, activeRules, startTime]);

  return { uiState, setUIState, setRules: setActiveRules };
}
