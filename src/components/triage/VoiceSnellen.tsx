import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface VoiceSnellenProps {
  onComplete: (acuity: string) => void;
  currentDistanceCm: number;
}

const SNELLEN_LEVELS = [
  { size: '20/200', px: 180 },
  { size: '20/100', px: 120 },
  { size: '20/50', px: 80 },
  { size: '20/40', px: 60 },
  { size: '20/30', px: 45 },
  { size: '20/20', px: 30 },
];

const ORIENTATIONS = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
const ROTATIONS: Record<string, number> = {
  'UP': -90,
  'DOWN': 90,
  'LEFT': 180,
  'RIGHT': 0,
};

export function VoiceSnellen({ onComplete, currentDistanceCm }: VoiceSnellenProps) {
  const [levelIndex, setLevelIndex] = useState(0);
  const [orientation, setOrientation] = useState(ORIENTATIONS[Math.floor(Math.random() * 4)]);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorLevel, setErrorLevel] = useState<string | null>(null);

  const level = SNELLEN_LEVELS[levelIndex];
  
  // Voice Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorLevel('Voice Command API not supported continuously on this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const word = event.results[last][0].transcript.trim().toUpperCase();
      setTranscript(word);
      handleCommand(word);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.warn("Speech recognition error", event);
      if (event.error === 'not-allowed') {
         setErrorLevel('Microphone access denied. Voice commands impossible.');
      }
    };

    // Auto-start
    try {
      recognition.start();
      setIsListening(true);
    } catch(e) {}

    return () => {
      try {
        recognition.stop();
      } catch(e) {}
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orientation, levelIndex]);

  const handleCommand = useCallback((command: string) => {
    if (command.includes(orientation)) {
      // Success! Proceed to next smaller size
      if (levelIndex < SNELLEN_LEVELS.length - 1) {
        setOrientation(ORIENTATIONS[Math.floor(Math.random() * 4)]);
        setLevelIndex(prev => prev + 1);
      } else {
        // Passed 20/20!
        onComplete('20/20');
      }
    } else if (ORIENTATIONS.some(o => command.includes(o))) {
      // Failed this level. The final acuity is the one before this.
      const finalAcuity = levelIndex > 0 ? SNELLEN_LEVELS[levelIndex - 1].size : '> 20/200';
      onComplete(finalAcuity);
    }
  }, [orientation, levelIndex, onComplete]);

  // Distance warning logic
  const isTooClose = currentDistanceCm > 0 && currentDistanceCm < 35; // e.g. < 35cm 
  const isTooFar = currentDistanceCm > 60; // > 60cm for near vision test

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-white relative rounded-[3rem] overflow-hidden">
      
      {/* Top Bar Diagnostics */}
      <div className="absolute top-8 w-full px-8 flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400">
        <div className="flex items-center gap-3">
          {isListening ? (
             <div className="flex items-center gap-2 text-rose-500 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100">
               <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
               Mic Active
             </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400">
               <MicOff size={16} />
               Mic Inactive
            </div>
          )}
          {transcript && <span className="opacity-60 ml-2">Heard: "{transcript}"</span>}
        </div>
        
        <div className="text-blue-500 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
          Target: {level.size}
        </div>
      </div>

      {/* Main E Rendering */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] w-full mt-10">
        <AnimatePresence mode="wait">
          {isTooClose || isTooFar ? (
            <motion.div 
              key="warning"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center max-w-sm p-8 bg-amber-50 border-2 border-amber-200 rounded-3xl"
            >
               <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
               <h3 className="text-2xl font-black text-amber-900 mb-2">Distance Error</h3>
               <p className="text-amber-800 font-medium">
                 {isTooClose ? "Please sit back, you are too close for an accurate reading." : "Please move closer to the screen."}
               </p>
               <p className="mt-4 text-xs font-bold tracking-widest uppercase text-amber-600">Current: {Math.round(currentDistanceCm)}cm | Target: ~40cm</p>
            </motion.div>
          ) : (
            <motion.div
              key={orientation + levelIndex}
              initial={{ opacity: 0, scale: 0.5, rotate: ROTATIONS[orientation] - 20 }}
              animate={{ opacity: 1, scale: 1, rotate: ROTATIONS[orientation] }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex items-center justify-center pointer-events-none"
            >
              {/* Tumbling E */}
              <div 
                className="font-sans font-black text-slate-900 leading-none select-none tracking-tighter"
                style={{ fontSize: `${level.px}px` }}
              >
                E
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Instructions Footer */}
      <div className="absolute bottom-8 w-full text-center px-12 pb-4">
        <p className="text-slate-500 font-bold mb-4">Say <span className="text-blue-600 font-black px-2">UP</span> <span className="text-blue-600 font-black px-2">DOWN</span> <span className="text-blue-600 font-black px-2">LEFT</span> or <span className="text-blue-600 font-black px-2">RIGHT</span> to indicate which way the "E" is facing.</p>
        
        {/* Manual Override Buttons (For users without Mic) */}
        <div className="flex justify-center gap-4 border-t border-slate-100 pt-6">
          {['UP', 'DOWN', 'LEFT', 'RIGHT'].map((cmd) => (
             <button 
               key={cmd} 
               onClick={() => handleCommand(cmd)}
               className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs uppercase px-4 py-2 rounded-lg transition-colors"
             >
               {cmd}
             </button>
          ))}
        </div>
        {errorLevel && <p className="text-red-500 text-xs mt-4 font-bold">{errorLevel}</p>}
      </div>
    
    </div>
  );
}
