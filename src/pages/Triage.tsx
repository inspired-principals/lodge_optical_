import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, ShieldAlert, CheckCircle2, ChevronRight, Activity, X, RotateCcw, Eye, EyeOff, AlertTriangle, Clock, Users, FileText, Zap } from 'lucide-react';
import Webcam from 'react-webcam';
import { Link } from 'react-router-dom';
import { FaceMesh } from '@mediapipe/face_mesh';
import * as camUtils from '@mediapipe/camera_utils';
import { jsPDF } from 'jspdf';
import { ClinicalEmitter } from '@shared/services/emitter';
import { useAdaptiveUI } from '../hooks/useAdaptiveUI';
import { submitTriage } from '../services/triageApi';
import type { AdminTriageCase, TriageSubmissionRequest } from '../types/triageSubmission';

// Enhanced triage types
interface SymptomData {
  pain: number; // 0-10
  dryness: number;
  glare: number;
  halos: number;
  distortion: number;
  fluctuation: number;
  redness: number;
  discharge: number;
  itching: number;
  burning: number;
  foreignBody: boolean;
  suddenChange: boolean;
  trauma: boolean;
  surgery: boolean;
  contacts: boolean;
  glasses: boolean;
}

interface DiagnosticResults {
  visualAcuity: { os: string; od: string };
  refraction: { os: { sphere: number; cylinder: number; axis: number }; od: { sphere: number; cylinder: number; axis: number } };
  contrastSensitivity: number;
  colorVision: 'normal' | 'deficient';
  astigmatismRegularity: number; // 0-1
  dryEyeScore: number; // OSDI equivalent
  keratoconusRisk: number; // 0-1
  postSurgicalRisk: number; // 0-1
}

interface RiskAssessment {
  score: number; // 0-100
  level: 'routine' | 'expedited' | 'urgent' | 'escalation' | 'emergency';
  recommendedSpecialty: string;
  urgencyDays: number;
  clinicalNotes: string[];
}

interface PatientIdentity {
  full_name: string;
  email: string;
  phone: string;
}

const SNELLEN_LEVELS = [200, 100, 70, 50, 40, 30, 25, 20];
const ORIENTATIONS = ['up', 'right', 'down', 'left'] as const;
type Orientation = typeof ORIENTATIONS[number];

// Enhanced triage steps
const TRIAGE_STEPS = [
  { key: 'consent', label: 'Consent', icon: ShieldAlert },
  { key: 'symptoms', label: 'Symptoms', icon: FileText },
  { key: 'permissions', label: 'Access', icon: Camera },
  { key: 'calibration', label: 'Calibrate', icon: Activity },
  { key: 'acuity', label: 'Acuity', icon: Eye },
  { key: 'refraction', label: 'Refraction', icon: EyeOff },
  { key: 'contrast', label: 'Contrast', icon: Zap },
  { key: 'analysis', label: 'Analysis', icon: Activity },
  { key: 'report', label: 'Report', icon: CheckCircle2 }
] as const;

export default function Triage() {
  const [step, setStep] = useState<'consent' | 'symptoms' | 'permissions' | 'calibration' | 'acuity' | 'refraction' | 'contrast' | 'analysis' | 'report'>('consent');
  const [isExamComplete, setIsExamComplete] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);

  // Enhanced data collection
  const [symptoms, setSymptoms] = useState<SymptomData>({
    pain: 0, dryness: 0, glare: 0, halos: 0, distortion: 0, fluctuation: 0,
    redness: 0, discharge: 0, itching: 0, burning: 0,
    foreignBody: false, suddenChange: false, trauma: false, surgery: false,
    contacts: false, glasses: false
  });

  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResults>({
    visualAcuity: { os: 'Pending', od: 'Pending' },
    refraction: {
      os: { sphere: 0, cylinder: 0, axis: 0 },
      od: { sphere: 0, cylinder: 0, axis: 0 }
    },
    contrastSensitivity: 0,
    colorVision: 'normal',
    astigmatismRegularity: 1.0,
    dryEyeScore: 0,
    keratoconusRisk: 0,
    postSurgicalRisk: 0
  });

  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment>({
    score: 0,
    level: 'routine',
    recommendedSpecialty: 'General Optometry',
    urgencyDays: 30,
    clinicalNotes: []
  });
  const [patientIdentity, setPatientIdentity] = useState<PatientIdentity>({
    full_name: '',
    email: '',
    phone: '',
  });
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [submissionError, setSubmissionError] = useState('');
  const [submittedCase, setSubmittedCase] = useState<AdminTriageCase | null>(null);

  const webcamRef = useRef<Webcam>(null);
  const faceMeshRef = useRef<FaceMesh | null>(null);
  const cameraRef = useRef<camUtils.Camera | null>(null);
  
  // Optical Metrics State
  const [distance, setDistance] = useState<number>(0); // in cm
  const [ppm, setPpm] = useState<number>(0); // pixels per mm (e.g. 3.78 for 96dpi)
  const [lastCommand, setLastCommand] = useState<string>('');

  // Examination State
  const [examState, setExamState] = useState({
    activeEye: 'OS' as 'OS' | 'OD', // OS = Left, OD = Right
    levelIndex: 0, // Starts at 200
    orientation: 'up' as Orientation,
    correctCount: 0,
    history: [] as { eye: string, level: number, correct: boolean }[]
  });

  // --- CONNECT SYSTEM NERVES (TRINITY ENGINE) ---
  const { uiState } = useAdaptiveUI({
    session: { mode: isManualMode ? 'manual' : 'camera' },
    triage: { 
      currentStep: step, 
      completed: isExamComplete,
      confidence: Object.values(diagnosticResults.visualAcuity).every(v => v !== 'Pending') ? 0.9 : 0.5,
      severity: riskAssessment.score > 40 ? 'high' : 'low'
    }
  });

  // Risk assessment calculation
  const calculateRiskAssessment = useCallback((results: DiagnosticResults, symptoms: SymptomData): RiskAssessment => {
    let score = 0;
    const notes: string[] = [];

    // Visual acuity scoring
    const acuityOS = parseInt(results.visualAcuity.os.replace('20/', '')) || 200;
    const acuityOD = parseInt(results.visualAcuity.od.replace('20/', '')) || 200;
    const worseEye = Math.max(acuityOS, acuityOD);

    if (worseEye >= 100) score += 30; // 20/100 or worse
    else if (worseEye >= 60) score += 20; // 20/60-20/100
    else if (worseEye >= 40) score += 10; // 20/40-20/60

    // Refractive error scoring
    const refractionOS = Math.abs(results.refraction.os.sphere) + Math.abs(results.refraction.os.cylinder);
    const refractionOD = Math.abs(results.refraction.od.sphere) + Math.abs(results.refraction.od.cylinder);
    const maxRefraction = Math.max(refractionOS, refractionOD);

    if (maxRefraction > 10) score += 20;
    else if (maxRefraction > 6) score += 15;
    else if (maxRefraction > 3) score += 10;

    // Astigmatism regularity
    if (results.astigmatismRegularity < 0.7) {
      score += 15;
      notes.push('Irregular astigmatism detected - consider corneal topography');
    }

    // Symptom-based scoring
    if (symptoms.pain > 7) score += 25;
    if (symptoms.distortion > 6) score += 20;
    if (symptoms.glare > 7 || symptoms.halos > 6) score += 15;
    if (symptoms.dryness > 7) score += 12;
    if (symptoms.redness > 6) score += 10;
    if (symptoms.suddenChange) score += 20;
    if (symptoms.trauma) score += 15;
    if (symptoms.surgery) score += 10;

    // Condition-specific risks
    if (results.dryEyeScore > 45) {
      score += 12;
      notes.push('Severe dry eye symptoms - consider scleral lens evaluation');
    }
    if (results.keratoconusRisk > 0.7) {
      score += 20;
      notes.push('High keratoconus risk - urgent corneal specialist evaluation needed');
    }
    if (results.postSurgicalRisk > 0.6) {
      score += 15;
      notes.push('Post-surgical regression indicators present');
    }

    // Determine level and specialty
    let level: RiskAssessment['level'] = 'routine';
    let specialty = 'General Optometry';
    let urgencyDays = 30;

    if (score >= 81) {
      level = 'emergency';
      specialty = 'Emergency Ophthalmology';
      urgencyDays = 0;
    } else if (score >= 61) {
      level = 'escalation';
      specialty = results.keratoconusRisk > 0.7 ? 'Corneal Specialist' : 'Comprehensive Ophthalmologist';
      urgencyDays = 1;
    } else if (score >= 41) {
      level = 'urgent';
      specialty = results.dryEyeScore > 45 ? 'Dry Eye Specialist' : 'Specialty Optometrist';
      urgencyDays = 3;
    } else if (score >= 21) {
      level = 'expedited';
      specialty = 'Advanced Optometrist';
      urgencyDays = 7;
    }

    return {
      score: Math.min(score, 100),
      level,
      recommendedSpecialty: specialty,
      urgencyDays,
      clinicalNotes: notes
    };
  }, []);

  // Enhanced step progression with adaptive testing
  const advanceStep = useCallback(() => {
    const stepOrder = ['consent', 'symptoms', 'permissions', 'calibration', 'acuity', 'refraction', 'contrast', 'analysis', 'report'];
    const currentIndex = stepOrder.indexOf(step);

    if (currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1] as typeof step;

      // Adaptive skipping based on symptoms
      if (nextStep === 'contrast' && symptoms.dryness < 3 && symptoms.glare < 3) {
        // Skip contrast test if no relevant symptoms
        setStep('analysis');
        return;
      }

      setStep(nextStep);
    } else {
      setStep('report');
      setIsExamComplete(true);
    }
  }, [step, symptoms]);


  useEffect(() => {
    // Enhanced triage events
    ClinicalEmitter.emit('triage_started', { mode: 'comprehensive' });
    
    return () => {
      if (!isExamComplete) {
        ClinicalEmitter.emit('triage_abandoned', { step });
      }
    };
  }, []); // Only on mount/unmount

  useEffect(() => {
    // Step completion tracking
    ClinicalEmitter.emit('triage_step_completed', { step });
    
    if (step === 'report' && submissionStatus === 'idle') {
      setIsExamComplete(true);
      ClinicalEmitter.emit('triage_completed');

      const assessment = calculateRiskAssessment(diagnosticResults, symptoms);
      setRiskAssessment(assessment);

      setSubmissionStatus('submitting');
      setSubmissionError('');

      submitTriage(buildTriageSubmission(assessment))
        .then((savedCase) => {
          setSubmittedCase(savedCase);
          setSubmissionStatus('success');
        })
        .catch((error: Error) => {
          setSubmissionStatus('error');
          setSubmissionError(error.message || 'Triage submission failed.');
        });
    }
  }, [step, diagnosticResults, symptoms, calculateRiskAssessment, submissionStatus, buildTriageSubmission]);

  const [results, setResults] = useState<{os: string, od: string}>({ os: 'Pending', od: 'Pending' });
  const currentStepIndex = TRIAGE_STEPS.findIndex((item) => item.key === step);
  const hasPatientIdentity = patientIdentity.full_name.trim().length >= 2 && patientIdentity.email.trim().length > 0;

  const resetExam = () => {
    setExamState({
      activeEye: 'OS',
      levelIndex: 0,
      orientation: 'up',
      correctCount: 0,
      history: []
    });
    setStep('consent');
    setSubmissionStatus('idle');
    setSubmissionError('');
    setSubmittedCase(null);
  };

  function buildTriageSubmission(assessment: RiskAssessment): TriageSubmissionRequest {
    const symptomSummary = [
      symptoms.pain > 0 ? `eye pain:${symptoms.pain}` : null,
      symptoms.dryness > 0 ? `dryness:${symptoms.dryness}` : null,
      symptoms.glare > 0 ? `glare:${symptoms.glare}` : null,
      symptoms.halos > 0 ? `halos:${symptoms.halos}` : null,
      symptoms.distortion > 0 ? `distortion:${symptoms.distortion}` : null,
      symptoms.fluctuation > 0 ? `fluctuation:${symptoms.fluctuation}` : null,
      symptoms.redness > 0 ? `redness:${symptoms.redness}` : null,
      symptoms.discharge > 0 ? `discharge:${symptoms.discharge}` : null,
      symptoms.itching > 0 ? `itching:${symptoms.itching}` : null,
      symptoms.burning > 0 ? `burning:${symptoms.burning}` : null,
      symptoms.foreignBody ? 'foreign body sensation' : null,
      symptoms.suddenChange ? 'sudden vision change' : null,
      symptoms.trauma ? 'recent ocular trauma' : null,
      symptoms.surgery ? 'post-surgical history' : null,
      symptoms.contacts ? 'contact lens wearer' : null,
      symptoms.glasses ? 'wears glasses' : null,
    ].filter(Boolean) as string[];

    const history = [
      symptoms.surgery ? 'Reports previous ocular surgery.' : null,
      symptoms.trauma ? 'Reports recent ocular trauma.' : null,
      symptoms.contacts ? 'Uses contact lenses.' : null,
      symptoms.glasses ? 'Uses prescription glasses.' : null,
      isManualMode ? 'Assessment completed in manual mode.' : 'Assessment completed with camera-assisted mode.',
    ].filter(Boolean).join(' ');

    const notes = [
      `Visual acuity OS ${diagnosticResults.visualAcuity.os}, OD ${diagnosticResults.visualAcuity.od}.`,
      `Contrast sensitivity ${diagnosticResults.contrastSensitivity.toFixed(1)}/10.`,
      assessment.clinicalNotes.length > 0 ? `Clinical notes: ${assessment.clinicalNotes.join(' | ')}` : null,
    ].filter(Boolean).join(' ');

    return {
      patient: {
        full_name: patientIdentity.full_name.trim(),
        email: patientIdentity.email.trim(),
        phone: patientIdentity.phone.trim() || undefined,
      },
      triage: {
        symptoms: symptomSummary,
        history,
        severity_score: assessment.score,
        notes,
        risk_level: assessment.level,
        recommended_specialty: assessment.recommendedSpecialty,
        urgency_days: assessment.urgencyDays,
        clinical_notes: assessment.clinicalNotes,
        diagnostic_results: {
          visualAcuity: diagnosticResults.visualAcuity,
          refraction: diagnosticResults.refraction,
          contrastSensitivity: diagnosticResults.contrastSensitivity,
          colorVision: diagnosticResults.colorVision,
          astigmatismRegularity: diagnosticResults.astigmatismRegularity,
          dryEyeScore: diagnosticResults.dryEyeScore,
          keratoconusRisk: diagnosticResults.keratoconusRisk,
          postSurgicalRisk: diagnosticResults.postSurgicalRisk,
        },
      },
    };
  }

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(24);
    doc.setTextColor(37, 99, 235);
    doc.text("OptiScan Lite Digital Triage", 20, 30);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 35, 190, 35);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
    
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("Visual Acuity Results:", 20, 70);
    
    const osData = examState.history.filter(h => h.eye === 'OS' && h.correct);
    const odData = examState.history.filter(h => h.eye === 'OD' && h.correct);
    
    const osLevel = osData.length > 0 ? Math.min(...osData.map(h => h.level)) : '20/200+';
    const odLevel = odData.length > 0 ? Math.min(...odData.map(h => h.level)) : '20/200+';
    
    doc.setFontSize(14);
    doc.text(`Left Eye (OS): ${osLevel === '20/200+' ? osLevel : `20/${osLevel}`}`, 30, 85);
    doc.text(`Right Eye (OD): ${odLevel === '20/200+' ? odLevel : `20/${odLevel}`}`, 30, 95);
    
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("NOTE: This report is a digital pre-evaluation and not a medical diagnosis.", 20, 120);
    doc.text("Please bring this report to your physical assessment for clinical verification.", 20, 126);
    
    doc.save("LodgeOptical_Triage_Report.pdf");
  };

  const startManualMode = () => {
    setStep('snellen');
    setPpm(3.78); // Desktop standard
    setDistance(60); 
    ClinicalEmitter.emit('triage_mode_selected', { mode: 'manual' });
  };

  const startCameraMode = () => {
    setStep('permissions');
    ClinicalEmitter.emit('triage_mode_selected', { mode: 'camera' });
  };

  const calibratePpm = () => {
    // We assume the user has placed a standard card (85.6mm) to match the box on screen.
    // The box is 150% scaled of 85.6mm in the UI (scale-150).
    // Let's use a standard 3.78 ppm (96 dpi) as baseline and adjust.
    setPpm(3.78 * (window.devicePixelRatio || 1));
    setStep('snellen');
  };

  const requestPermissions = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setHasPermissions(true);
      setStep('calibration');
    } catch (err) {
      console.error("Permissions denied:", err);
      ClinicalEmitter.emit('triage_error', { code: 'PERM_DENIED', message: 'User rejected camera' });
    }
  };

  const advanceAcuity = useCallback((correct: boolean) => {
    setExamState(prev => {
      const currentLevel = SNELLEN_LEVELS[prev.levelIndex];
      const nextHistory = [...prev.history, { eye: prev.activeEye, level: currentLevel, correct }];
      const nextOrient = ORIENTATIONS[Math.floor(Math.random() * ORIENTATIONS.length)];
      
      if (correct) {
        if (prev.correctCount >= 1) { // 2 correct in a row at this level
          if (prev.levelIndex < SNELLEN_LEVELS.length - 1) {
            return { ...prev, levelIndex: prev.levelIndex + 1, correctCount: 0, orientation: nextOrient, history: nextHistory };
          } else {
            // Finished 20/20!
            if (prev.activeEye === 'OS') return { ...prev, activeEye: 'OD', levelIndex: 0, correctCount: 0, orientation: nextOrient, history: nextHistory };
            setStep('analysis');
            return prev;
          }
        }
        return { ...prev, correctCount: prev.correctCount + 1, orientation: nextOrient, history: nextHistory };
      } else {
        if (prev.correctCount <= -1) { // 2 incorrect in a row at this level
           if (prev.activeEye === 'OS') return { ...prev, activeEye: 'OD', levelIndex: 0, correctCount: 0, orientation: nextOrient, history: nextHistory };
           setStep('analysis');
           return prev;
        }
        return { ...prev, correctCount: prev.correctCount - 1, orientation: nextOrient, history: nextHistory };
      }
    });
  }, []);

  // Initialize Speech Recognition
  const startSpeech = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.lang = 'en-US';
      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
        setLastCommand(transcript);
        
        // Handle Exam Navigation
        const commandMapping: Record<string, Orientation> = {
          'up': 'up', 'top': 'up', 'north': 'up',
          'down': 'down', 'bottom': 'down', 'south': 'down',
          'left': 'left', 'west': 'left',
          'right': 'right', 'east': 'right'
        };

        const recognizedDir = commandMapping[transcript];
        if (recognizedDir) {
           setExamState(current => {
             const isCorrect = recognizedDir === current.orientation;
             advanceAcuity(isCorrect);
             return current;
           });
        }

        // Handle Emergency Triggers
        const emergencyKeywords = ['pain', 'emergency', 'help', 'curtain', 'blind', 'blood', 'intense'];
        if (emergencyKeywords.some(kw => transcript.includes(kw))) {
           setStep('consent'); // Reset to consent/emergency protocol
           alert("EMERGENCY PROTOCOL TRIGGERED: Please seek immediate medical attention if you are experiencing intense pain or sudden vision loss.");
        }
      };
      recognition.start();
      return () => recognition.stop();
    }
  }, [advanceAcuity]);

  useEffect(() => {
    if (step === 'calibration' || step === 'acuity') {
      const faceMesh = new FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults((results) => {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          const landmarks = results.multiFaceLandmarks[0];
          const leftEye = landmarks[33];
          const rightEye = landmarks[263];
          const dx = rightEye.x - leftEye.x;
          const dy = rightEye.y - leftEye.y;
          const pixelDist = Math.sqrt(dx*dx + dy*dy) * 1000;
          
          const estimatedDistance = Math.round(50 * (60 / pixelDist)); 
          setDistance(estimatedDistance);
        }
      });

      if (webcamRef.current?.video) {
        const camera = new camUtils.Camera(webcamRef.current.video, {
          onFrame: async () => {
             if (webcamRef.current?.video) {
               await faceMesh.send({image: webcamRef.current.video});
             }
          },
          width: 1280,
          height: 720
        });
        camera.start();
        cameraRef.current = camera;
      }
      
      return () => {
        cameraRef.current?.stop();
      };
    }
  }, [step]);

  useEffect(() => {
    if (step === 'acuity') {
      const recognition = startSpeech();
      return () => recognition && (recognition as any)();
    }
  }, [step, startSpeech]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {(step === 'calibration' || step === 'acuity') && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-2 rounded-full bg-slate-900 border border-blue-500/30 flex items-center gap-4 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Tracked Distance</span>
            <span className="text-xl font-black text-blue-400">{distance > 0 ? `${distance} cm` : 'Calibrating...'}</span>
          </div>
          <div className="w-px h-8 bg-white/10 mx-2" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Acuity Trigger</span>
            <span className="text-xl font-black text-white">{lastCommand || 'Awaiting Voice'}</span>
          </div>
        </div>
      )}      {/* Secure Header */}
      <header className="px-6 md:px-8 py-5 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white leading-none">OptiScan <span className="text-blue-500">Lite</span></h1>
            <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mt-1">Digital Triage Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-blue-400">Encrypted Session</span>
          </div>
          <Link to="/" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center">
            <X className="w-5 h-5 text-slate-300" />
          </Link>
        </div>
      </header>

      <div className="px-4 pt-4 md:px-8 relative z-20">
        <div className="max-w-5xl mx-auto rounded-[1.5rem] border border-white/10 bg-white/5 p-3 md:p-4 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <span>Progress Tracker</span>
            <span>Approx. 3–5 minutes</span>
          </div>
          <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
            {TRIAGE_STEPS.map((item, index) => {
              const isActive = index === currentStepIndex;
              const isComplete = index < currentStepIndex;
              return (
                <div
                  key={item.key}
                  className={`rounded-xl px-2 py-3 text-center text-[10px] font-bold uppercase tracking-widest transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-[0_10px_30px_rgba(37,99,235,0.35)]'
                      : isComplete
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                        : 'bg-white/5 text-slate-400 border border-white/5'
                  }`}
                >
                  {item.label}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Stage */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
        {/* Ambient Dark Lighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />

        <AnimatePresence mode="wait">
          
          {step === 'consent' && (
            <motion.div 
              key="consent"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl w-full bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative z-10"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-8 shadow-inner shadow-blue-500/20">
                <ShieldAlert className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-5 tracking-tight">Clinical Consent & Triage</h2>
              <p className="text-lg text-slate-300 leading-relaxed mb-8">
                OptiScan Lite is an AI-assisted digital pre-evaluation module. <strong className="text-white">This is not a medical diagnosis.</strong> It is strictly designed to execute a preliminary visual acuity screen to prepare our clinical team for your visit.
              </p>
              
              <div className="space-y-4 mb-10">
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-black/40 border border-white/5">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-slate-300 text-sm leading-relaxed">Your optical data is processed locally on your device's hardware. Images are never transmitted to external servers without your explicit PDF report generation.</p>
                </div>
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-red-950/30 border border-red-500/20">
                  <ShieldAlert className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-slate-200 text-sm leading-relaxed font-medium">Emergency Protocol: If you are experiencing a sudden curtain over your vision, intense ocular pain, or recent chemical exposure, close this tool and dial 911 or visit an ER immediately.</p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3 mb-10">
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-slate-300">Takes only a few minutes to complete.</div>
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-slate-300">Works best in stable lighting and a quiet room.</div>
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-slate-300">Useful for identifying whether a specialty assessment may be worthwhile.</div>
              </div>

              <div className="grid gap-4 md:grid-cols-3 mb-10">
                <input
                  type="text"
                  value={patientIdentity.full_name}
                  onChange={(event) => setPatientIdentity((current) => ({ ...current, full_name: event.target.value }))}
                  placeholder="Full name"
                  className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none"
                />
                <input
                  type="email"
                  value={patientIdentity.email}
                  onChange={(event) => setPatientIdentity((current) => ({ ...current, email: event.target.value }))}
                  placeholder="Email address"
                  className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none"
                />
                <input
                  type="tel"
                  value={patientIdentity.phone}
                  onChange={(event) => setPatientIdentity((current) => ({ ...current, phone: event.target.value }))}
                  placeholder="Phone number"
                  className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none"
                />
              </div>

              {!hasPatientIdentity && (
                <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-950/20 px-4 py-3 text-sm text-amber-200">
                  Enter at least your name and email before starting the assessment. This is the patient record used by the clinical team.
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-4">
                <button 
                  onClick={() => setStep('symptoms')}
                  disabled={!hasPatientIdentity}
                  className="flex-1 py-5 px-8 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black tracking-widest text-xs uppercase flex items-center justify-between transition-all shadow-[0_8px_30px_rgba(37,99,235,0.4)] group"
                >
                  <span>Start Comprehensive Assessment</span>
                  <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
                <button 
                  onClick={() => { setIsManualMode(true); setStep('symptoms'); }}
                  disabled={!hasPatientIdentity}
                  className="flex-1 py-5 px-8 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-black tracking-widest text-xs uppercase flex items-center justify-between transition-all"
                >
                  <span>Use Manual Mode</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'symptoms' && (
            <motion.div
              key="symptoms"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-4xl w-full bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative z-10"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-8 shadow-inner shadow-blue-500/20">
                <FileText className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-5 tracking-tight">Symptom Assessment</h2>
              <p className="text-lg text-slate-300 leading-relaxed mb-8">
                Please rate your current symptoms on a scale of 0-10. This helps us understand your condition and recommend the most appropriate care.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Pain & Discomfort */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white mb-4">Pain & Discomfort</h3>
                  {[
                    { key: 'pain', label: 'Eye Pain' },
                    { key: 'dryness', label: 'Dryness' },
                    { key: 'burning', label: 'Burning' },
                    { key: 'itching', label: 'Itching' },
                    { key: 'foreignBody', label: 'Foreign Body Sensation', type: 'boolean' }
                  ].map((symptom) => (
                    <div key={symptom.key} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-slate-300 font-medium">{symptom.label}</span>
                      {symptom.type === 'boolean' ? (
                        <button
                          onClick={() => setSymptoms(prev => ({ ...prev, [symptom.key]: !prev[symptom.key as keyof SymptomData] }))}
                          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                            symptoms[symptom.key as keyof SymptomData]
                              ? 'bg-blue-600 text-white'
                              : 'bg-white/10 text-slate-400 hover:bg-white/20'
                          }`}
                        >
                          {symptoms[symptom.key as keyof SymptomData] ? 'Yes' : 'No'}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-sm w-8">{symptoms[symptom.key as keyof SymptomData]}</span>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            value={symptoms[symptom.key as keyof SymptomData] as number}
                            onChange={(e) => setSymptoms(prev => ({ ...prev, [symptom.key]: parseInt(e.target.value) }))}
                            className="w-24 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Vision Quality */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white mb-4">Vision Quality</h3>
                  {[
                    { key: 'glare', label: 'Glare Sensitivity' },
                    { key: 'halos', label: 'Halos Around Lights' },
                    { key: 'distortion', label: 'Visual Distortion' },
                    { key: 'fluctuation', label: 'Vision Fluctuation' },
                    { key: 'redness', label: 'Eye Redness' }
                  ].map((symptom) => (
                    <div key={symptom.key} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-slate-300 font-medium">{symptom.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-sm w-8">{symptoms[symptom.key as keyof SymptomData]}</span>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={symptoms[symptom.key as keyof SymptomData] as number}
                          onChange={(e) => setSymptoms(prev => ({ ...prev, [symptom.key]: parseInt(e.target.value) }))}
                          className="w-24 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medical History */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-white mb-4">Medical History</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { key: 'suddenChange', label: 'Sudden vision change in last 24 hours' },
                    { key: 'trauma', label: 'Recent eye trauma or injury' },
                    { key: 'surgery', label: 'Previous eye surgery' },
                    { key: 'contacts', label: 'Contact lens wearer' },
                    { key: 'glasses', label: 'Glasses wearer' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-slate-300 font-medium">{item.label}</span>
                      <button
                        onClick={() => setSymptoms(prev => ({ ...prev, [item.key]: !prev[item.key as keyof SymptomData] }))}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                          symptoms[item.key as keyof SymptomData]
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/10 text-slate-400 hover:bg-white/20'
                        }`}
                      >
                        {symptoms[item.key as keyof SymptomData] ? 'Yes' : 'No'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={advanceStep}
                className="w-full py-5 px-8 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black tracking-widest text-sm uppercase flex items-center justify-center gap-3 transition-all shadow-[0_8px_30px_rgba(37,99,235,0.4)]"
              >
                <span>Continue to Assessment</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 'permissions' && (
             <motion.div 
              key="permissions"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="max-w-xl w-full text-center relative z-10"
            >
              <div className="w-28 h-28 mx-auto rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mb-10 relative shadow-2xl">
                <div className="absolute inset-0 rounded-full border-2 border-blue-500 animate-[ping_2s_ease-out_infinite] opacity-40" />
                <Camera className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl font-black text-white mb-6 tracking-tight">Hardware Framework Access</h2>
              <p className="text-xl text-slate-400 leading-relaxed mb-12 max-w-md mx-auto">
                OptiScan requires secure WebRTC access to your camera and microphone to execute spatial distance mapping and voice-command tracking.
              </p>
              
              <button 
                onClick={requestPermissions}
                className="py-5 px-12 bg-white text-slate-950 hover:bg-blue-50 rounded-full font-black tracking-widest uppercase shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105 transition-all text-sm"
              >
                Enable Secure Access
              </button>
            </motion.div>
          )}

          {step === 'calibration' && (
            <motion.div 
              key="calibration"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-5xl aspect-[4/3] md:aspect-video bg-black rounded-[3rem] overflow-hidden relative shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-white/10"
            >
               <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover opacity-50"
                mirrored={false}
                imageSmoothing={true}
                forceScreenshotSourceSize={false}
                disablePictureInPicture={true}
                onUserMedia={() => console.log("Camera ready")}
                onUserMediaError={() => console.log("Camera error")}
                screenshotQuality={0.92}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60">
                
                {/* Calibration Box */}
                <div className="w-[85.6mm] h-[53.98mm] max-w-[80vw] max-h-[50vw] border-2 border-dashed border-blue-400/60 rounded-xl mb-10 relative backdrop-blur-sm bg-blue-500/10 scale-150">
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-[3px] border-l-[3px] border-blue-400" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-[3px] border-r-[3px] border-blue-400" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-[3px] border-l-[3px] border-blue-400" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-[3px] border-r-[3px] border-blue-400" />
                  <div className="w-full h-full flex flex-col items-center justify-center text-blue-300 font-bold uppercase tracking-widest text-[8px] md:text-xs">
                    Hold ID Card Here
                    <span className="text-[6px] tracking-normal font-medium mt-1 opacity-80">(Standard Credit/ID Card Size)</span>
                  </div>
                </div>

                <div className="absolute bottom-0 inset-x-0 p-8 md:p-12 bg-gradient-to-t from-black to-transparent flex flex-col items-center">
                  <h3 className="text-3xl font-black text-white drop-shadow-md mb-3 tracking-tight">Scale Calibration</h3>
                  <p className="text-slate-300 max-w-2xl drop-shadow-md text-lg leading-relaxed mb-6">
                    {uiState.microcopy || 'Hold any standard-sized card directly up to the screen inside the target box. This calibrates the physical pixel boundaries for the mathematical visual acuity engine.'}
                  </p>
                  <div className="flex gap-4">
                    <button onClick={calibratePpm} className="bg-white text-slate-900 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors shadow-xl flex items-center gap-4">
                      <span>Calibration Confirmed</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    {uiState.showSkip && (
                      <button 
                        onClick={() => setStep('snellen')}
                        className="bg-white/10 text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10"
                      >
                        Skip Calibration
                      </button>
                    )}
                  </div>

                  <div className="mt-6 grid gap-3 md:grid-cols-3 text-left text-[11px] text-slate-300">
                    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">Use even lighting and hold your device steady.</div>
                    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">If possible, remove distractions and cover one eye as instructed.</div>
                    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">This improves the quality of the pre-evaluation and final summary.</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'acuity' && (
             <motion.div
               key="acuity"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="w-full max-w-5xl aspect-[4/3] md:aspect-video bg-white rounded-[3rem] overflow-hidden relative shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-white/20 flex flex-col items-center justify-center"
             >
                <div className="absolute top-8 left-8 text-slate-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Testing <span className="text-blue-600 font-black px-2 py-0.5 bg-blue-50 rounded-md ml-1">{examState.activeEye === 'OS' ? 'Left Eye (OS)' : 'Right Eye (OD)'}</span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 mb-4">Distance Acuity Test</span>
                  <span className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 mb-10">Current Level: 20/{SNELLEN_LEVELS[examState.levelIndex]}</span>
                  <motion.h2
                    key={`${examState.levelIndex}-${examState.orientation}-${examState.activeEye}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1, rotate: examState.orientation === 'up' ? 0 : examState.orientation === 'right' ? 90 : examState.orientation === 'down' ? 180 : 270 }}
                    style={{
                      fontSize: (SNELLEN_LEVELS[examState.levelIndex] / 20) * ((distance || 60) / 600) * 8.726 * (ppm || 3.78)
                    }}
                    className="font-bold text-slate-900 leading-none select-none"
                  >
                    E
                  </motion.h2>
                </div>

                <div className="absolute bottom-8 flex flex-col items-center gap-4">
                  <div className="px-5 py-2 rounded-full bg-slate-100 border border-slate-200 flex items-center gap-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Distance: {(distance || 0).toFixed(0)}cm | Target: 40-60cm</span>
                    <div className={`w-2 h-2 rounded-full ${(distance || 0) >= 35 && (distance || 0) <= 70 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-400'}`} />
                  </div>
                  <div className="text-center">
                    <p className="text-slate-600 text-sm font-medium mb-2">Say "UP", "DOWN", "LEFT", or "RIGHT" to indicate E direction</p>
                    <div className="flex gap-2 justify-center">
                      {['UP', 'DOWN', 'LEFT', 'RIGHT'].map((dir) => (
                        <button
                          key={dir}
                          onClick={() => {
                            const isCorrect = dir.toLowerCase() === examState.orientation;
                            advanceAcuity(isCorrect);
                          }}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded transition-colors"
                        >
                          {dir}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-8 right-8 flex gap-4">
                  <button
                    onClick={() => advanceAcuity(false)}
                    className="bg-white border-2 border-slate-900 text-slate-900 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-slate-50 transition-all"
                  >
                    Cannot See
                  </button>
                  <button
                    onClick={() => advanceStep()}
                    className="bg-slate-900 text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-slate-800 transition-all"
                  >
                    Complete Acuity <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
             </motion.div>
          )}

          {step === 'refraction' && (
            <motion.div
              key="refraction"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl w-full bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative z-10 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-8 shadow-inner shadow-blue-500/20 mx-auto">
                <EyeOff className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-3xl font-black text-white mb-5 tracking-tight">Refractive Assessment</h2>
              <p className="text-lg text-slate-300 leading-relaxed mb-8">
                We'll now assess your basic refractive needs. Look at the center dot and indicate if the lines appear clearer with different lens powers.
              </p>

              <div className="bg-white rounded-2xl p-8 mb-8">
                <div className="w-32 h-32 mx-auto bg-slate-900 rounded-full flex items-center justify-center mb-4">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <p className="text-slate-600 font-medium">Focus on the center dot. Which option looks clearer?</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <button
                  onClick={() => {
                    setDiagnosticResults(prev => ({
                      ...prev,
                      refraction: {
                        ...prev.refraction,
                        [examState.activeEye === 'OS' ? 'os' : 'od']: {
                          sphere: prev.refraction[examState.activeEye === 'OS' ? 'os' : 'od'].sphere - 0.25,
                          cylinder: prev.refraction[examState.activeEye === 'OS' ? 'os' : 'od'].cylinder,
                          axis: prev.refraction[examState.activeEye === 'OS' ? 'os' : 'od'].axis
                        }
                      }
                    }));
                    advanceStep();
                  }}
                  className="py-4 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all"
                >
                  Left Option Clearer
                </button>
                <button
                  onClick={() => {
                    setDiagnosticResults(prev => ({
                      ...prev,
                      refraction: {
                        ...prev.refraction,
                        [examState.activeEye === 'OS' ? 'os' : 'od']: {
                          sphere: prev.refraction[examState.activeEye === 'OS' ? 'os' : 'od'].sphere + 0.25,
                          cylinder: prev.refraction[examState.activeEye === 'OS' ? 'os' : 'od'].cylinder,
                          axis: prev.refraction[examState.activeEye === 'OS' ? 'os' : 'od'].axis
                        }
                      }
                    }));
                    advanceStep();
                  }}
                  className="py-4 px-6 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-bold transition-all"
                >
                  Right Option Clearer
                </button>
              </div>

              <button
                onClick={() => advanceStep()}
                className="w-full py-3 px-6 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all border border-white/20"
              >
                Skip Refraction Assessment
              </button>
            </motion.div>
          )}

          {step === 'contrast' && (
            <motion.div
              key="contrast"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl w-full bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative z-10 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-8 shadow-inner shadow-blue-500/20 mx-auto">
                <Zap className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-3xl font-black text-white mb-5 tracking-tight">Contrast Sensitivity</h2>
              <p className="text-lg text-slate-300 leading-relaxed mb-8">
                This test assesses your ability to see details in low contrast conditions, which is important for night driving and reading.
              </p>

              <div className="bg-white rounded-2xl p-8 mb-8">
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[1, 2, 3].map((level) => (
                    <div key={level} className="text-slate-900">
                      <div className="w-16 h-16 mx-auto bg-slate-200 rounded-lg flex items-center justify-center mb-2">
                        <span className="font-bold text-lg">{level}</span>
                      </div>
                      <p className="text-xs font-medium">Level {level}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <p className="text-slate-300 mb-4">Which number do you see most clearly?</p>
                <div className="flex justify-center gap-4">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        setDiagnosticResults(prev => ({ ...prev, contrastSensitivity: num * 0.3 }));
                        advanceStep();
                      }}
                      className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition-all border border-white/20"
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => advanceStep()}
                className="w-full py-3 px-6 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all border border-white/20"
              >
                Skip Contrast Test
              </button>
            </motion.div>
          )}

          {step === 'analysis' && (
            <motion.div 
              key="analysis"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onAnimationComplete={() => setTimeout(() => setStep('report'), 5000)}
              className="text-center relative z-10"
            >
              <div className="w-20 h-20 mx-auto rounded-full border-4 border-t-blue-500 border-r-blue-500 border-b-slate-700 border-l-slate-700 animate-spin mb-8" />
              <h2 className="text-3xl font-black text-white mb-4 tracking-tight">AI Clinical Analysis</h2>
              <p className="text-lg text-slate-400 mb-8">Processing comprehensive diagnostic data and risk assessment...</p>
              
              <div className="max-w-2xl mx-auto">
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mb-2 mx-auto">
                      <Eye className="w-4 h-4 text-blue-400" />
                    </div>
                    <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1">Visual Acuity</p>
                    <p className="text-sm text-white font-medium">Analyzing bilateral measurements</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center mb-2 mx-auto">
                      <Activity className="w-4 h-4 text-green-400" />
                    </div>
                    <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1">Refraction</p>
                    <p className="text-sm text-white font-medium">Estimating corrective needs</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center mb-2 mx-auto">
                      <AlertTriangle className="w-4 h-4 text-purple-400" />
                    </div>
                    <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1">Risk Assessment</p>
                    <p className="text-sm text-white font-medium">Clinical decision support</p>
                  </div>
                </div>
                
                <div className="space-y-2 opacity-70">
                  <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">🔍 Analyzing symptom patterns...</p>
                  <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">📊 Calculating risk stratification...</p>
                  <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">🎯 Determining care pathway...</p>
                  <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">📅 Optimizing appointment scheduling...</p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'report' && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl w-full bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative z-10 text-left"
            >
              <div className="flex justify-between items-start mb-10 pb-8 border-b border-white/10">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight mb-2">Comprehensive OptiScan Report</h2>
                  <p className="text-slate-400 font-semibold tracking-wide">Generated on {new Date().toLocaleDateString()}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-blue-400" />
                </div>
              </div>

              <div className={`mb-8 rounded-2xl border px-4 py-3 text-sm ${
                submissionStatus === 'success'
                  ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-200'
                  : submissionStatus === 'error'
                  ? 'border-red-500/30 bg-red-950/20 text-red-200'
                  : 'border-blue-500/20 bg-blue-950/20 text-blue-200'
              }`}>
                {submissionStatus === 'success' && submittedCase
                  ? `Submission stored as case #${submittedCase.submission_id}.`
                  : submissionStatus === 'error'
                  ? `Backend submission failed: ${submissionError}`
                  : 'Submitting triage record to the clinical backend...'}
              </div>

              {/* Risk Assessment Banner */}
              <div className={`mb-8 rounded-2xl p-6 border-2 ${
                riskAssessment.level === 'emergency' ? 'bg-red-950/30 border-red-500/50' :
                riskAssessment.level === 'escalation' ? 'bg-orange-950/30 border-orange-500/50' :
                riskAssessment.level === 'urgent' ? 'bg-yellow-950/30 border-yellow-500/50' :
                riskAssessment.level === 'expedited' ? 'bg-blue-950/30 border-blue-500/50' :
                'bg-green-950/30 border-green-500/50'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black text-white">Clinical Risk Assessment</h3>
                  <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                    riskAssessment.level === 'emergency' ? 'bg-red-600 text-white' :
                    riskAssessment.level === 'escalation' ? 'bg-orange-600 text-white' :
                    riskAssessment.level === 'urgent' ? 'bg-yellow-600 text-black' :
                    riskAssessment.level === 'expedited' ? 'bg-blue-600 text-white' :
                    'bg-green-600 text-white'
                  }`}>
                    {riskAssessment.level.toUpperCase()} - SCORE: {riskAssessment.score}/100
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-bold text-white mb-2">Recommended Care</p>
                    <p className="text-slate-300">{riskAssessment.recommendedSpecialty}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white mb-2">Suggested Timeline</p>
                    <p className="text-slate-300">
                      {riskAssessment.urgencyDays === 0 ? 'Immediate medical attention required' :
                       riskAssessment.urgencyDays === 1 ? 'Next business day' :
                       `Within ${riskAssessment.urgencyDays} days`}
                    </p>
                  </div>
                </div>
                {riskAssessment.clinicalNotes.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-bold text-white mb-2">Clinical Notes</p>
                    <ul className="text-slate-300 text-sm space-y-1">
                      {riskAssessment.clinicalNotes.map((note, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-10">
                {/* Diagnostic Results */}
                <div>
                  <h3 className="text-lg font-black text-white mb-6">Diagnostic Results</h3>

                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-slate-400">Visual Acuity</span>
                        <Eye className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-slate-500">Left (OS)</span>
                          <p className="text-lg font-bold text-white">{diagnosticResults.visualAcuity.os}</p>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500">Right (OD)</span>
                          <p className="text-lg font-bold text-white">{diagnosticResults.visualAcuity.od}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-slate-400">Refractive Estimate</span>
                        <EyeOff className="w-4 h-4 text-green-400" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-500">Left Eye:</span>
                          <span className="text-sm font-medium text-white">
                            S: {diagnosticResults.refraction.os.sphere > 0 ? '+' : ''}{diagnosticResults.refraction.os.sphere} C: {diagnosticResults.refraction.os.cylinder} × {diagnosticResults.refraction.os.axis}°
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-500">Right Eye:</span>
                          <span className="text-sm font-medium text-white">
                            S: {diagnosticResults.refraction.od.sphere > 0 ? '+' : ''}{diagnosticResults.refraction.od.sphere} C: {diagnosticResults.refraction.od.cylinder} × {diagnosticResults.refraction.od.axis}°
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-slate-400">Contrast Sensitivity</span>
                        <Zap className="w-4 h-4 text-purple-400" />
                      </div>
                      <p className="text-lg font-bold text-white">{diagnosticResults.contrastSensitivity.toFixed(1)}/10</p>
                    </div>
                  </div>
                </div>

                {/* Symptom Summary */}
                <div>
                  <h3 className="text-lg font-black text-white mb-6">Symptom Summary</h3>

                  <div className="space-y-3">
                    {Object.entries(symptoms).map(([key, value]) => {
                      if (typeof value === 'boolean') {
                        return value ? (
                          <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-red-950/20 border border-red-500/20">
                            <span className="text-sm text-white capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                          </div>
                        ) : null;
                      } else if (typeof value === 'number' && value > 0) {
                        return (
                          <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                            <span className="text-sm text-slate-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-white/20 rounded-full">
                                <div
                                  className="h-full bg-blue-500 rounded-full transition-all"
                                  style={{ width: `${(value / 10) * 100}%` }}
                                />
                              </div>
                              <span className="text-xs text-slate-400 w-6">{value}/10</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </div>

              <div className="mb-8 rounded-2xl bg-blue-500/10 border border-blue-500/20 p-5">
                <p className="text-sm font-bold text-blue-300 mb-2">Next Steps</p>
                <p className="text-slate-200 leading-relaxed">
                  {riskAssessment.level === 'emergency'
                    ? 'Please seek immediate medical attention. Call 911 or go to the nearest emergency room.'
                    : riskAssessment.level === 'escalation'
                    ? `Schedule an appointment with a ${riskAssessment.recommendedSpecialty} within the next ${riskAssessment.urgencyDays} day${riskAssessment.urgencyDays > 1 ? 's' : ''}.`
                    : `Book a ${riskAssessment.recommendedSpecialty} consultation within ${riskAssessment.urgencyDays} days for comprehensive evaluation.`
                  }
                </p>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <button onClick={generatePDF} className="flex-1 py-4 bg-white hover:bg-slate-200 text-slate-900 rounded-xl font-black tracking-widest uppercase transition-colors text-sm shadow-xl">
                  Download Comprehensive Report
                </button>
                <button onClick={resetExam} className="flex px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-black tracking-widest uppercase transition-colors text-sm items-center justify-center gap-2">
                  <RotateCcw className="w-4 h-4" /> Start New Assessment
                </button>
                <Link to="/contact" className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black tracking-widest uppercase transition-colors text-sm shadow-xl text-center py-4">
                  Schedule {riskAssessment.recommendedSpecialty}
                </Link>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
