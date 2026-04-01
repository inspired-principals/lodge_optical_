# OptiScan Lite: Clinical Triage UX Flow Design

This document outlines the screen-by-screen logic and UI triggers for the high-conversion, professional triage experience.

---

### Phase 1: Contextual Arrival
*   **Trigger**: Clicking "Start Triage" from Hero, Exit-Intent, or FAQ Nudges.
*   **UI Emotion**: Direct, Clean, High-Trust.

#### Screen 01: Clinical Consent & Privacy Sandbox
*   **Logic**: Mandatory 2-step data agreement. 
*   **Key Detail**: Explicit mention of "No PHI stored during session" and "Zero Server Transmission".
*   **Action**: `[I UNDERSTAND & AGREE]` → Progress to Hardware Framework.

---

### Phase 2: Hardware Verification
*   **Trigger**: Authorization of Camera/Microphone via WebRTC.

#### Screen 02: Spatial Calibration (Distance Tracking)
*   **UI Trigger**: Mediapipe FaceMesh detects "Iris-to-Iris" distance.
*   **Feedback**: "MOVE CLOSER (Currently 120cm)" → "PERFECT (Current: 55cm)".
*   **Logic**: Dynamic `ppm` calculation (based on standardized card-on-screen calibration if available).
*   **Action**: Automatic lock-in once distance is within ±2cm for 3 seconds.

---

### Phase 3: The Examination (Progressive Complexity)
*   **Trigger**: Calibration Successful.

#### Screen 03: Voice-Controlled Snellen Chart
*   **Logic**: Snellen optotypes (the "E") are rendered as SVG.
*   **Progressions**: Starts at 20/200. Successful voice command ("UP", "DOWN") scales the font size down.
*   **Manual Override**: Tiny "I can't see this" button for patients with severe impairments where voice might fail.
*   **Safety Trigger**: Detecting words like "PAIN" or "DARKNESS" immediately pauses the test with an emergency consultation card.

---

### Phase 4: AI Synthesis (The "Decision" Layer)
*   **Trigger**: 20/20 reached or 3 consecutive incorrect inputs.

#### Screen 04: The Clinical Snapshot
*   **Logic**: No diagnostic language used. Instead, "Observed Markers" and "Stability Analytics" are shown.
*   **Visual Feedback**: A heatmap overlaid on the webcam feed showing vascular injection detection (hyperemia).
*   **Action**: `[DOWNLOAD CLINICAL FILE]` and `[SECURE PATIENT VAULT ACCESS]`.

---

### Phase 5: The Hand-off (Conversion Persistence)
*   **Trigger**: Completion of Phase 4.

#### Screen 05: Vault Linkage (The "Magic Link" V1)
*   **Logic**: Results are cached in the secure vault. Magic Link is sent to patient's email.
*   **Frictionless Logic**: Single field for email verification.
*   **Final Action**: Redirect to `/portal/patient` with data pre-populated from the current session.

---

### 🧬 UI Triggers & Behavioral Edge
*   **Micro-Animations**: Use `motion.div` to pulse the distance marker in emerald when focused.
*   **Sound**: Subtle "beeps" for calibration lock (High Fidelity).
*   **Haptic**: Mobile vibration (if on device) when error detected.
