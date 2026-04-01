import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, FileText, ShieldCheck } from 'lucide-react';
import resourceImage from '../images/pexels-shkrabaanthony-6749697.jpg';

const resources = [
  {
    title: 'Keratoconus Guide',
    description: 'Understanding keratoconus, treatment options, and how custom lenses can restore more stable daily vision.',
    href: '/keratoconus'
  },
  {
    title: 'Post-Surgical Care',
    description: 'Guidance for patients recovering from LASIK, PRK, RK, or corneal transplant procedures.',
    href: '/post-surgical'
  },
  {
    title: 'Dry Eye Management',
    description: 'Strategies, lens options, and daily habits that reduce discomfort and support clearer vision.',
    href: '/dry-eye'
  }
];

export default function Info() {
  return (
    <main className="flex-grow bg-gray-50 pt-24">
      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto grid items-center gap-10 px-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="section-box p-6 md:p-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-gray-900 md:text-5xl"
            >
              Patient Resources &amp; Support
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 max-w-2xl text-lg text-gray-700"
            >
              Clear, practical guidance for patients researching specialty lens care, irregular corneas, dry eye support, and recovery after surgery.
            </motion.p>
            <p className="mt-4 text-sm uppercase tracking-[0.18em] text-slate-500">Read clearly • arrive prepared • know what to expect</p>
          </div>

          <div className="overflow-hidden rounded-[2rem] bg-slate-900 p-3 shadow-xl">
            <img
              src={resourceImage}
              alt="Patient education and specialty lens support"
              className="w-full rounded-[1.25rem] object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mesh-bg py-16 md:py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {resources.map((resource, index) => (
              <motion.div
                key={resource.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="resource-card layer-panel p-6"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-slate-900">{resource.title}</h2>
                <p className="text-slate-600">{resource.description}</p>
                <Link to={resource.href} className="mt-4 inline-flex items-center text-blue-600 font-semibold">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <div className="section-box p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Support Before Your Visit</h3>
              <p className="mt-3 text-slate-600">
                Bring your current prescription, lens history, and a short summary of the issues you are experiencing. This helps us move faster toward the right solution.
              </p>
            </div>

            <div className="section-box p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Need Direct Guidance?</h3>
              <p className="mt-3 text-slate-600">
                If you are unsure whether specialty lenses are appropriate for your case, contact the clinic and we will help you identify the right next step.
              </p>
              <Link
                to="/contact"
                className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700"
              >
                Contact Our Team
              </Link>
            </div>
          </div>

          <div className="section-box mt-8 p-6 md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Good to read before your visit</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3 text-sm text-slate-700">
              <div>• Note when your vision is most unstable or uncomfortable.</div>
              <div>• Bring old lens parameters, prescriptions, or surgical history if you have them.</div>
              <div>• Write down what you want to improve most: clarity, comfort, or wearing time.</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
