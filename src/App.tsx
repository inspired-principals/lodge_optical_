/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import QuickInquiry from './components/QuickInquiry';
import Footer from './components/Footer';
import SiteAssistant from './components/SiteAssistant';
import { ErrorBoundary } from './components/ErrorBoundary';

import { ExitIntentOverlay } from './components/ExitIntentOverlay';

// Pages
import Home from './pages/Home';
import Services from './pages/Services';
import Keratoconus from './pages/Keratoconus';
import PostSurgical from './pages/PostSurgical';
import DryEye from './pages/DryEye';
import Info from './pages/Info';
import FAQ from './pages/FAQ';
import About from './pages/About';
import Contact from './pages/Contact';
import Checkout from './pages/Checkout';
import UserProfile from './pages/UserProfile';
import Auth from './pages/Auth';
import Triage from './pages/Triage';
import { MagicLinkRequest } from './portals/MagicLinkRequest';
import { VerifyLink } from './portals/VerifyLink';
import PatientPortal from './portals/PatientPortal';
import DoctorPortal from './portals/DoctorPortal';
import ControlSurface from './portals/ControlSurface';
import CaseDetailSurface from './portals/CaseDetailSurface';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

function SiteFrame() {
  const location = useLocation();
  const useMinimalChrome =
    location.pathname.startsWith('/portal') ||
    location.pathname.startsWith('/control') ||
    location.pathname === '/auth/verify';

  return (
    <div className="site-shell relative flex min-h-screen flex-col overflow-x-hidden grain-overlay">
      <div className="pointer-events-none fixed left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-blue-400/10 blur-[120px] animate-pulse" />
      <div className="pointer-events-none fixed bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-blue-900/10 blur-[120px]" />

      {!useMinimalChrome ? <ExitIntentOverlay /> : null}
      {!useMinimalChrome ? <Header /> : null}
      {!useMinimalChrome ? <QuickInquiry /> : null}
      {!useMinimalChrome ? <SiteAssistant /> : null}

      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/keratoconus" element={<Keratoconus />} />
          <Route path="/post-surgical" element={<PostSurgical />} />
          <Route path="/dry-eye" element={<DryEye />} />
          <Route path="/info" element={<Info />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/portal" element={<MagicLinkRequest />} />
          <Route path="/portal/patient" element={<PatientPortal />} />
          <Route path="/portal/doctor" element={<DoctorPortal />} />
          <Route path="/auth/verify" element={<VerifyLink />} />
          <Route path="/control" element={<ControlSurface />} />
          <Route path="/control/case/:id" element={<CaseDetailSurface />} />
        </Routes>
      </ErrorBoundary>

      {!useMinimalChrome ? <Footer /> : null}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/triage" element={<Triage />} />
        <Route path="*" element={<SiteFrame />} />
      </Routes>
    </Router>
  );
}
