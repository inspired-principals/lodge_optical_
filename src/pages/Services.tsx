import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Droplets, Eye, ScanFace, ShieldCheck } from 'lucide-react';
import heroClinicImage from '../images/pexels-skyler-ewing-266953-5754242.jpg';
import fittingImage from '../images/pexels-shkrabaanthony-6749774.jpg';
import processImage from '../images/pexels-shkrabaanthony-6749697.jpg';

const services = [
  {
    title: 'Custom Scleral Lenses',
    description: 'Vault irregular corneas, maintain hydration, and deliver consistent, sharp vision for challenging eye conditions.',
    detail: 'Ideal for keratoconus, ocular surface disease, and patients who need stable all-day comfort.',
    icon: Eye
  },
  {
    title: 'Rigid Gas Permeable Lenses',
    description: 'Precision-fit designs for keratoconus, post-surgical corneas, and high astigmatism when standard lenses are not enough.',
    detail: 'Designed for crisp optics and highly customized correction when soft lenses cannot perform.',
    icon: ScanFace
  },
  {
    title: 'Post-Surgical Vision Rehabilitation',
    description: 'Restore predictability and comfort after LASIK, PRK, RK, or corneal transplant procedures.',
    detail: 'Focused fitting strategies help reduce distortion and improve confidence after surgery.',
    icon: ShieldCheck
  },
  {
    title: 'Severe Dry Eye Management',
    description: 'Scleral lenses and ongoing ocular surface care to reduce irritation, protect the eye, and improve day-to-day vision.',
    detail: 'A fluid reservoir and careful follow-up can dramatically improve comfort in complex dry eye cases.',
    icon: Droplets
  }
];

const processSteps = [
  'Advanced mapping to understand the exact shape and behavior of your cornea',
  'Diagnostic lens evaluation to assess real-time response and comfort',
  'Structured refinement and follow-up for long-term stability'
];

export default function Services() {
  return (
    <main className="flex-grow bg-slate-50 pt-24">
      <section className="hero-gradient relative overflow-hidden py-16 text-white md:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_32%)]" />
        <div className="container mx-auto grid items-center gap-10 px-6 lg:grid-cols-[1.1fr_0.9fr] relative z-10">
          <div className="deep-panel p-8 md:p-10">
            <span className="inline-flex rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-blue-200">
              Specialty lens solutions
            </span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 text-4xl font-bold tracking-tight md:text-5xl"
            >
              Specialty lens care for cases that demand precision
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 max-w-2xl text-lg text-slate-300"
            >
              Every service is designed for people who need more than a routine exam or off-the-shelf lens — with clinical depth, calm communication, and measurable follow-through.
            </motion.p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/contact" className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700">
                Schedule Your Specialty Assessment
              </Link>
              <Link to="/triage" className="inline-flex items-center justify-center rounded-lg border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10">
                Start Digital Triage
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="luminous-chip">Custom scleral care</span>
              <span className="luminous-chip">Post-surgical rehab</span>
              <span className="luminous-chip">Dry eye support</span>
            </div>
          </div>

          <div className="relative">
            <img
              src={heroClinicImage}
              alt="Specialty clinical care at Lodge Optical"
              className="w-full rounded-[2rem] object-cover shadow-2xl ring-1 ring-white/10"
            />
            <div className="absolute -bottom-4 left-4 rounded-2xl bg-slate-950/90 px-4 py-3 text-sm font-semibold text-white shadow-xl ring-1 ring-white/10">
              Hard-to-fit care • data-driven • long-term follow-up
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="layer-panel p-7"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="mb-2 text-2xl font-bold text-slate-900">{service.title}</h2>
                  <p className="text-slate-600">{service.description}</p>
                  <p className="mt-4 border-t border-slate-200 pt-4 text-sm font-medium text-slate-700">{service.detail}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        className="relative overflow-hidden bg-cover bg-center bg-no-repeat py-24 text-white md:bg-fixed"
        style={{ backgroundImage: `linear-gradient(rgba(2,6,23,0.72), rgba(15,23,42,0.72)), url(${fittingImage})` }}
      >
        <div className="container mx-auto max-w-4xl px-6">
          <div className="deep-panel p-8 md:p-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">Full-width parallax section</p>
            <h2 className="mt-4 text-3xl font-bold md:text-5xl">When vision stays unstable, the plan has to get smarter.</h2>
            <p className="mt-5 text-lg text-slate-200">
              That is where diagnostic fitting, methodical refinement, and real specialty experience make the difference.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto grid items-center gap-10 px-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="overflow-hidden rounded-[2rem] shadow-xl">
            <img
              src={processImage}
              alt="Specialty fitting workflow and clinical support"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="section-box p-8 md:p-10">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">What your fitting process looks like</h2>
            <p className="mt-4 text-lg text-slate-600">
              Our process is deliberate and transparent, so you understand what we are testing, why it matters, and how improvement is measured.
            </p>

            <div className="mt-8 space-y-4">
              {processSteps.map((step, index) => (
                <div key={step} className="layer-panel p-4">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="text-slate-700">{step}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-sm uppercase tracking-[0.18em] text-slate-500">Every adjustment is based on measurable response and comfort.</p>

            <Link to="/contact" className="mt-8 inline-flex items-center font-semibold text-blue-700 hover:text-blue-800">
              Book your assessment <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
