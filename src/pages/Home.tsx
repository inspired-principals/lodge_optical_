import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import heroVideo from '../images/6798787-hd_1920_1080_24fps.mp4';
import consultationImage from '../images/premium_clinical_consultation.png';
import topographyMap from '../images/corneal_topography_map.png';
import fittingImage from '../images/pexels-shkrabaanthony-6749774.jpg';
import diagnosticImage from '../images/pexels-tima-miroshnichenko-6608260.jpg';

const patientScenarios = [
  {
    title: 'Inconsistent or Unstable Vision',
    description: 'Your prescription seems correct, but your vision fluctuates or never feels fully clear.',
    bullets: ['Advanced corneal mapping', 'Precision lens stabilization strategies']
  },
  {
    title: 'Discomfort or Contact Lens Intolerance',
    description: 'Lenses feel dry, irritating, or impossible to wear consistently.',
    bullets: ['Scleral lenses with fluid reservoir', 'Ocular surface protection']
  },
  {
    title: 'Post-Surgical Vision Issues',
    description: 'Vision has not stabilized after LASIK, PRK, RK, or transplant.',
    bullets: ['Post-surgical optical rehabilitation', 'Precision refitting protocols']
  },
  {
    title: 'Diagnosed Corneal Conditions',
    description: 'Keratoconus, PMD, or irregular astigmatism affecting daily function.',
    bullets: ['Custom scleral and RGP lens design', 'Long-term management strategy']
  }
];

const clinicalPathway = [
  {
    title: 'Advanced Topography',
    description: 'We map over 20,000 data points across your cornea to understand its exact structure.'
  },
  {
    title: 'Diagnostic Fitting',
    description: 'Trial lenses are used to evaluate real-time physiological response.'
  },
  {
    title: 'Custom Fabrication',
    description: 'Lenses are manufactured to micron-level precision based on your data.'
  },
  {
    title: 'Ongoing Management',
    description: 'Continuous monitoring ensures long-term ocular health and visual stability.'
  }
];

const clinicalFocusConditions = [
  {
    title: 'Keratoconus',
    description: 'Custom scleral and rigid gas permeable lenses to vault irregular corneas for sharper, more stable vision.'
  },
  {
    title: 'Post-Surgical Corneas',
    description: 'Rehabilitation after LASIK, PRK, RK, or corneal transplants with precision fits that restore comfort and predictability.'
  },
  {
    title: 'Severe Dry Eye',
    description: 'Scleral lenses create a continuous tear reservoir for hydration, relief, and more consistent vision.'
  },
  {
    title: 'Pellucid Marginal Degeneration',
    description: 'Specialized lens strategies for inferior corneal thinning and progressive irregularity.'
  },
  {
    title: 'High Astigmatism',
    description: 'Custom toric and specialty lens designs for extreme or irregular prescriptions where standard lenses fall short.'
  },
  {
    title: 'Corneal Scarring',
    description: 'Optical correction to bypass surface irregularities caused by trauma, infection, or previous disease.'
  }
];

const authorityStats = [
  { value: '25+', label: 'Years of specialty lens experience' },
  { value: '10,000+', label: 'Complex fittings and refits' },
  { value: '20,000+', label: 'Corneal data points mapped per eye' }
];

const painLock = [
  "Your prescription looks correct — but your vision still isn't stable",
  "Contacts feel uncomfortable, dry, or impossible to wear",
  "You've been told \"nothing else can be done\""
];

const reassuranceSteps = [
  'Diagnostic evaluation of ocular health and history',
  'Targeted lens design based on data',
  'Structured refinement for optimal fit',
  'Long-term monitoring and adjustment'
];

const trustComparison = {
  before: [
    'Vision fluctuates even when the prescription seems correct',
    'Contacts feel inconsistent or unwearable',
    "You've tried multiple solutions with no real answer"
  ],
  after: [
    'Stable, data-driven vision correction',
    'Comfort designed around your eye — not forced onto it',
    'A clear long-term plan instead of trial-and-error'
  ]
};

export default function Home() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="flex flex-col min-h-screen"
    >
      <section className="relative flex min-h-[84vh] items-center overflow-hidden text-white">
        <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover">
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-slate-950/65" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-900/30" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:px-10 md:py-24">
          <div className="max-w-5xl space-y-6">
            <div className="deep-panel p-8 md:p-10 lg:p-12">
              <span className="inline-flex rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1 text-sm font-semibold tracking-wide text-blue-100">
                Specialty scleral &amp; RGP lens care
              </span>

              <div className="mt-6 max-w-4xl">
                <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                  Advanced Optical Solutions for Complex Eyes
                </h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200 md:text-xl">
                  When vision refuses to settle with ordinary care, we build the solution around the real structure and behavior of your eye.
                </p>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
                  We welcome complex cases — irregular corneas, post-surgical changes, severe dryness, and patients who need a clinic prepared to go deeper.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/triage"
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  Start Your Eye Rescue Assessment
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="luminous-chip">Stable vision</span>
                <span className="luminous-chip">Long-term comfort</span>
                <span className="luminous-chip">Precision fit</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Lock Section - Emotional Identification */}
      <section className="bg-slate-900 py-16 md:py-20 text-white">
        <div className="max-w-4xl mx-auto px-6 md:px-10">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold md:text-4xl">You've Probably Been Through This:</h2>
            <div className="space-y-4">
              {painLock.map((pain, index) => (
                <div key={index} className="flex items-start gap-4 py-3 border-b border-slate-700 last:border-b-0">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
                    •
                  </div>
                  <p className="text-lg text-slate-100">{pain}</p>
                </div>
              ))}
            </div>
            <div className="pt-6 space-y-4 border-t border-slate-700">
              <p className="text-xl font-semibold text-slate-100">At some point, you stop trusting the process.</p>
              <p className="text-lg text-slate-300">
                <span className="font-semibold">You're not the problem.</span>
              </p>
              <p className="text-slate-300">
                You've just been treated with systems designed for normal eyes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Repositioning Section */}
      <section className="bg-slate-950 text-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-10 text-center">
          <p className="text-2xl font-bold md:text-3xl">Complex vision deserves a clinic built for complexity.</p>
          <p className="mt-4 text-base text-slate-300 md:text-lg">
            When standard care fails, we build the solution around the real structure and behavior of your eye.
          </p>
        </div>
      </section>

      {/* Patient Scenarios - Activated */}
      <section className="bg-slate-50 py-16 md:py-20 soft-grid">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="section-box max-w-3xl p-6 md:p-8 mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Scenario Recognition</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">Which of These Feels Familiar?</h2>
            <p className="mt-4 text-slate-600">Select one to explore your path forward</p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {patientScenarios.map((scenario, index) => (
              <Link
                key={scenario.title}
                to={`/triage?scenario=${index}`}
                className="layer-panel p-7 cursor-pointer hover:shadow-lg hover:bg-blue-50 transition-all duration-200 group"
              >
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition">{scenario.title}</h3>
                <p className="mt-3 text-slate-600">{scenario.description}</p>
                <ul className="mt-5 space-y-2 text-sm font-medium text-slate-700">
                  {scenario.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-600" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 inline-flex items-center text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all">
                  Explore →
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-slate-600 mb-6">Ready to move forward?</p>
            <Link
              to="/triage"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700 shadow-lg hover:shadow-xl"
            >
              Start Your Eye Rescue Assessment
            </Link>
          </div>
        </div>
      </section>

      {/* Clinical Authority - Moved Down */}
      <section id="clinical-pathway" className="bg-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">How It Works</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">The Clinical Pathway</h2>
              <p className="mt-4 text-slate-600">
                Our process eliminates guesswork and replaces it with data-driven precision.
              </p>
            </div>

            <div className="grid gap-6">
              {clinicalPathway.map((step, index) => (
                <div key={step.title} className="layer-panel p-6 hover:bg-blue-50 transition">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">0{index + 1}</p>
                  <h3 className="mt-3 text-lg font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-3 text-slate-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 overflow-hidden rounded-3xl bg-slate-900 p-4 text-white shadow-xl">
            <img src={topographyMap} alt="Corneal topography scan" className="w-full rounded-2xl object-cover" />
            <p className="mt-4 text-sm leading-6 text-slate-200">
              Advanced imaging reveals the exact irregularities standard optics often miss, allowing us to build a more stable custom correction plan.
            </p>
          </div>
        </div>
      </section>

      {/* Custom Optics Explanation - Unchanged positioning */}
      <section className="bg-slate-50 py-16 md:py-20">
        <div className="max-w-6xl mx-auto grid gap-10 px-6 md:px-10 lg:grid-cols-2 lg:items-center">
          <div className="section-box p-6 md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Service Explanation</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">Custom optics built around the eye in front of us</h2>
            <p className="mt-5 text-lg leading-8 text-slate-700">
              Specialty lenses are not a generic upgrade — they are a clinical tool for restoring sharper, steadier, more wearable vision in demanding cases.
            </p>
            <p className="mt-4 text-slate-600">
              Our scleral and rigid gas permeable designs create a smooth optical surface, protect the ocular surface when needed, and give each fit a data-driven path forward.
            </p>
            <div className="soft-divider mt-6" />
            <p className="mt-4 text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Built for complex corneas, dry eye, and post-surgical rehabilitation</p>
          </div>

          <div className="space-y-4">
            <img src={consultationImage} alt="Specialty consultation in clinic" className="w-full rounded-3xl shadow-xl" />
            <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-xl">
              <ul className="space-y-4 text-base md:text-lg">
                <li>• Vaults over irregular corneas (Keratoconus)</li>
                <li>• Maintains hydration for severe dry eye</li>
                <li>• Restores vision after surgical procedures</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Precision & Clinical Focus - Unchanged */}
      <section
        className="relative overflow-hidden bg-cover bg-center bg-no-repeat py-24 text-white md:bg-fixed md:py-32"
        style={{ backgroundImage: `linear-gradient(rgba(2,6,23,0.72), rgba(15,23,42,0.72)), url(${diagnosticImage})` }}
      >
        <div className="max-w-4xl mx-auto px-6 md:px-10">
          <div className="deep-panel p-8 md:p-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">Full-Scope Clinical Precision</p>
            <h2 className="mt-4 text-3xl font-bold md:text-5xl">
              High-level specialty care should feel decisive, calm, and highly tailored.
            </h2>
            <p className="mt-5 text-lg text-slate-200">
              We combine advanced diagnostics, custom fabrication, and careful follow-up so patients feel both supported and confidently guided.
            </p>
          </div>
        </div>
      </section>

      {/* Clinical Focus Conditions */}
      <section className="clinical-focus bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Clinical Focus — Custom Contact Lens Solutions for Complex Eyes
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-700">
              Each of these cases benefits from stronger diagnostics, a more exact fitting strategy, and close clinical follow-through.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {clinicalFocusConditions.map((condition) => (
              <div key={condition.title} className="condition-card rounded-xl bg-white p-6 shadow-md hover:shadow-lg transition">
                <h3 className="mb-2 text-2xl font-bold text-slate-900">{condition.title}</h3>
                <p className="text-slate-600">{condition.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Before/After */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="max-w-3xl mb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Impact & Outcomes</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">What changes when the fit is finally right</h2>
            <p className="mt-4 text-slate-600">
              The difference is not cosmetic. It is functional, measurable, and felt in daily life.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="layer-panel bg-rose-50 p-8 ring-2 ring-rose-200"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-700">Without the right solution</p>
              <ul className="mt-5 space-y-3 text-slate-700">
                {trustComparison.before.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-rose-500 font-bold">✗</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="layer-panel bg-emerald-50 p-8 ring-2 ring-emerald-200"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">With the right solution</p>
              <ul className="mt-5 space-y-3 text-slate-700">
                {trustComparison.after.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <img src={fittingImage} alt="Specialty lens fitting process" className="w-full rounded-3xl shadow-xl" />
            <div className="rounded-3xl bg-slate-50 p-8 ring-1 ring-slate-200">
              <h3 className="text-2xl font-bold text-slate-900">What precision actually means</h3>
              <p className="mt-4 text-slate-600">
                Instead of forcing your eye into a standard product, we build the solution around your anatomy, your history, and the way your eye responds in real time.
              </p>
              <p className="mt-4 text-sm text-slate-500 italic">
                The outcome isn't just a fitted lens—it's the confidence that comes with finally understanding your vision.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Process Reassurance</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">A Precision-Driven Approach</h2>
            <p className="mt-4 text-slate-600">
              Every eye requires a highly specific solution. Our process is structured, measured, and continuously refined.
            </p>
          </div>

          <ol className="mt-10 grid gap-4 md:grid-cols-2">
            {reassuranceSteps.map((step, index) => (
              <li key={step} className="rounded-2xl bg-slate-50 p-6 text-slate-700 ring-1 ring-slate-200 hover:bg-blue-50 transition">
                <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <p className="mt-2 font-medium">{step}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10 rounded-2xl bg-blue-50 p-6 text-center text-lg font-semibold text-slate-800">
            Our objective is not just a successful fit — it is long-term visual stability.
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Book Your Clinical Assessment
            </Link>
          </div>
        </div>
      </section>

      {/* Strengthened Final CTA */}
      <section className="bg-slate-950 py-16 text-white md:py-20">
        <div className="max-w-4xl mx-auto px-6 text-center md:px-10">
          <div className="deep-panel p-8 md:p-12">
            <h2 className="text-3xl font-bold md:text-5xl">If nothing has worked so far…</h2>
            <p className="mt-6 text-lg text-slate-300">
              Doing nothing keeps you exactly where you are.
            </p>
            <p className="mt-4 text-lg text-slate-300">
              Or—
            </p>
            <p className="mt-6 text-2xl font-semibold text-blue-300">
              You can finally find out what's actually possible for your eyes.
            </p>
            <p className="mt-8 text-sm uppercase tracking-[0.18em] text-slate-400">No assumptions. Data-driven solutions. Clear direction.</p>
            <Link
              to="/triage"
              className="mt-8 inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-4 font-semibold text-white text-lg transition hover:bg-blue-700 shadow-lg hover:shadow-xl"
            >
              Start Your Eye Rescue Assessment
            </Link>
          </div>
        </div>
      </section>
    </motion.main>
  );
}
