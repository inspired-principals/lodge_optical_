import React, { useEffect, useRef } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

interface FaceMeshTrackerProps {
  webcamRef: React.RefObject<any>;
  onDistanceUpdate: (cm: number) => void;
  onCalibrationComplete: () => void;
  isCalibrating: boolean;
}

export function FaceMeshTracker({ webcamRef, onDistanceUpdate, onCalibrationComplete, isCalibrating }: FaceMeshTrackerProps) {
  const FOCAL_LENGTH = useRef(600); // Base webcam focal length assumption
  const ACTUAL_EYE_WIDTH = 3.0; // cm between inner canthi

  useEffect(() => {
    if (!webcamRef.current || !webcamRef.current.video) return;

    const videoElement = webcamRef.current.video as HTMLVideoElement;

    // Load from CDN to bypass massive WASM bundling limits and strict HIPAA transmission
    const faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      }
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    faceMesh.onResults((results: any) => {
      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        
        // 33: Left inner canthus, 263: Right inner canthus
        const leftEye = landmarks[33];
        const rightEye = landmarks[263];
        
        const videoWidth = videoElement.videoWidth || 1280;
        const videoHeight = videoElement.videoHeight || 720;

        const pixelDist = Math.sqrt(
          Math.pow((rightEye.x - leftEye.x) * videoWidth, 2) + 
          Math.pow((rightEye.y - leftEye.y) * videoHeight, 2)
        );

        if (pixelDist > 0) {
          if (isCalibrating) {
            onCalibrationComplete();
          }

          const distanceCM = (FOCAL_LENGTH.current * ACTUAL_EYE_WIDTH) / pixelDist;
          onDistanceUpdate(distanceCM);
        }
      }
    });

    const camera = new Camera(videoElement, {
      onFrame: async () => {
         try {
           await faceMesh.send({ image: videoElement });
         } catch(e) {}
      },
      width: 1280,
      height: 720
    });

    try {
      camera.start();
    } catch(e) {
      console.warn("Camera start failed in MediaPipe layer", e);
    }

    return () => {
      try {
        camera.stop();
        faceMesh.close();
      } catch(e) {}
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webcamRef]);

  return null; // Headless AI Engine
}
