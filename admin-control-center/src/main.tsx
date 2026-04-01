import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ControlSurface from './pages/ControlSurface';
import AdminOverview from './pages/AdminOverview';
import AIChatAssistant from './pages/AIChatAssistant';
import './index.css';

import AdminLayout from './components/AdminLayout';

function AdminApp() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <Routes>
          <Route path="/" element={<AdminOverview />} />
          <Route path="/control" element={<ControlSurface />} />
          <Route path="/chat" element={<AIChatAssistant />} />
        </Routes>
      </AdminLayout>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>,
);
