import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { HeartHandshake, Microscope, Target } from 'lucide-react';
import practiceImage from '../images/pexels-n-voitkevich-5843341.jpg';
import topographyMap from '../images/corneal_topography_map.png';

const expertisePoints = [
  'Thousands of successful complex lens fittings',
  'Advanced scleral and RGP lens design',
  'Patient-focused, long-term management approach'
];

const pillars = [
  {
    title: 'Precision First',
    description: 'Every case begins with data, not assumptions. Mapping, diagnostics, and on-eye assessment drive the plan.',
    icon: Microscope
  },
  {
    title: 'Empathetic Care',
    description: 'Many patients arrive frustrated after failed fits elsewhere. We slow the process down and solve it properly.',
    icon: HeartHandshake
  },
  {
    title: 'Long-Term Stability',
    description: 'The goal is not just to fit a lens once — it is to keep vision stable, comfortable, and clinically safe over time.',
    icon: Target
  }
];

const experienceStats = [
  { value: '25+', label: 'Years in specialty care' },
  { value: '10,000+', label: 'Complex fits managed' },
  { value: '1 goal', label: 'Long-term stable vision' }
];

export default function About() {
  return (
    <main className="min-h-screen bg-gray-50 pt-24">
      <section className="hero-gradient relative overflow-hidden py-16 text-white md:py-20">
        <div className="container mx-auto grid items-center gap-10 px-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative z-10">
            <div className="deep-panel p-8 md:p-10">
              <span className="inline-flex rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-blue-200">
                About the practice
              </span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 text-4xl font-bold tracking-tight md:text-5xl"
              >
                A specialty clinic built around precision, patience, and results
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-4 max-w-2xl text-lg text-slate-300"
              >
                We serve people who have often spent too long searching for answers. Our role is to bring clarity, confidence, and a plan that makes sense from the first visit.
              </motion.p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="luminous-chip">Precision-first care</span>
                <span className="luminous-chip">Empathetic guidance</span>
                <span className="luminous-chip">Long-term stability</span>
              </div>
              <Link
                to="/contact"
                className="mt-8 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Book a Clinical Assessment
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem]">
            <img
              src={practiceImage}
              alt="Lodge Optical specialty care environment"
              className="w-full rounded-[2rem] shadow-2xl ring-1 ring-white/10"
            />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-slate-950/85 p-4 text-sm text-slate-100 shadow-xl backdrop-blur-md">
              Patients often arrive after years of unstable vision and failed fits. Precision starts by slowing down and mapping the problem properly.
            </div>
          </div>
        </div>
      </section>

      <section className="relative -mt-6 pb-6 md:-mt-8">
        <div className="container mx-auto px-6">
          <div className="grid gap-4 md:grid-cols-3">
            {experienceStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="layer-panel p-5 text-center"
              >
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto grid items-center gap-10 px-6 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">Decades of specialized experience</h2>
            <p className="text-slate-700 leading-7">
              From keratoconus to post-surgical recovery, we approach each case with discipline, empathy, and a commitment to lasting results. Patients deserve an explanation, a plan, and follow-through.
            </p>
            <ul className="mt-5 space-y-3 text-gray-700">
              {expertisePoints.map((point) => (
                <li key={point} className="flex items-start gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
                  <span className="mt-2 h-2.5 w-2.5 rounded-full bg-blue-600" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="overflow-hidden rounded-[2rem] bg-white p-4 shadow-lg ring-1 ring-slate-200">
            <img
              src={topographyMap}
              alt="Corneal topography diagnostic map"
              className="w-full rounded-2xl object-cover"
            />
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              Advanced imaging helps us understand the exact geometry of each eye before finalizing a custom lens strategy.
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mb-10 section-box p-6 md:p-8">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">How we work</h2>
            <p className="mt-3 text-lg text-slate-600">
              Our process stays focused on patients whose eyes need more than a standard retail solution.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div key={pillar.title} className="layer-panel p-6">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{pillar.title}</h3>
                  <p className="mt-3 text-slate-600">{pillar.description}</p>
                </div>
              );
            })}
          </div>

          <div className="section-box mt-8 p-6 md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">A finishing note</p>
            <p className="mt-3 text-xl font-semibold text-slate-900">
              Patients should leave the first visit understanding both the problem and the path forward.
            </p>
            <p className="mt-3 text-slate-600">
              That blend of confidence and reassurance is central to how we practice every day.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
