/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArrowRight, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const clinicalFocusAreas = ['Keratoconus', 'Post-Surgical Vision', 'Dry Eye Management'];
const quickLinks = [
  { label: 'Services', href: '/services' },
  { label: 'Resources', href: '/info' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Digital Triage', href: '/triage' },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-slate-800 bg-slate-950 py-16 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_0,transparent_38%),radial-gradient(circle_at_bottom_right,rgba(234,179,8,0.1),transparent_0,transparent_34%)]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap gap-2">
          {['Custom Scleral Care', 'Digital Triage', 'Complex Corneal Rehab'].map((item) => (
            <span key={item} className="rounded-full border border-slate-700 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-200">
              {item}
            </span>
          ))}
        </div>

        <div className="grid gap-10 md:grid-cols-[1.3fr_0.85fr_0.85fr_1fr]">
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 text-xl font-bold uppercase tracking-[0.18em]">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-sky-500 text-sm font-black">LO</span>
              <span>Lodge Optical</span>
            </Link>
            <p className="max-w-md text-sm leading-7 text-slate-300">
              Specialty contact lens care delivered with clinical rigor, calm communication, and long-term follow-through.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-amber-50"
            >
              Book a consultation
              <ArrowRight size={14} />
            </Link>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Clinical Focus</h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              {clinicalFocusAreas.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Quick Links</h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="transition hover:text-amber-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Contact</h4>
            <div className="mt-4 space-y-3 text-sm text-slate-200">
              <a href="mailto:clinical@lodgeoptical.com" className="inline-flex items-center gap-2 transition hover:text-white">
                <Mail className="h-4 w-4 text-blue-400" />
                clinical@lodgeoptical.com
              </a>
              <div className="inline-flex items-center gap-2 text-slate-300">
                <Phone className="h-4 w-4 text-amber-300" />
                Assessment and callback support available
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-800 pt-6 text-xs text-slate-400 md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} Lodge Optical</span>
          <span>Precision fit. Clear guidance. Premium specialty care.</span>
        </div>
      </div>
    </footer>
  );
}
