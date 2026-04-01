import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Clock, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import clinicConsultation from '../images/premium_clinical_consultation.png';
import { api } from '../services/api';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    challenges: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const applyPrefill = (detail?: { name?: string; email?: string; phone?: string; message?: string }) => {
      if (!detail) return;
      setFormData((prev) => ({
        ...prev,
        name: detail.name ?? prev.name,
        email: detail.email ?? prev.email,
        phone: detail.phone ?? prev.phone,
        challenges: detail.message ?? prev.challenges,
      }));
    };

    const stored = localStorage.getItem('lodge_assistant_prefill');
    if (stored) {
      try {
        applyPrefill(JSON.parse(stored));
      } catch {
        // ignore malformed saved assistant payload
      }
    }

    const handler = ((event: Event) => {
      applyPrefill((event as CustomEvent<any>).detail);
    }) as EventListener;

    window.addEventListener('lodge-assistant-prefill', handler);
    return () => window.removeEventListener('lodge-assistant-prefill', handler);
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage('');

    try {
      const response = await api.submitContactForm(formData);
      setStatusMessage(response.message);
      setFormData({ name: '', email: '', phone: '', challenges: '' });
    } catch {
      setStatusMessage('Something went wrong. Please call the clinic and we will help you directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white pt-24">
      <section className="hero-gradient py-16 text-white md:py-20">
        <div className="container mx-auto max-w-5xl px-6 text-center">
          <div className="deep-panel p-8 md:p-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold md:text-5xl"
            >
              Book Your Clinical Assessment
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mx-auto mt-4 max-w-3xl text-lg text-slate-300"
            >
              Tell us what has been difficult — blur, dryness, post-surgical changes, or an unsuccessful past fit — and we will guide you toward the right next step.
            </motion.p>
            <p className="mt-4 text-sm uppercase tracking-[0.18em] text-slate-400">Clear next steps • no guesswork • focused specialty care</p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <form onSubmit={handleSubmit} className="grid gap-6 section-box p-8">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Let us understand your case</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">Share your situation</h2>
                <p className="mt-2 text-slate-600">The more detail you provide, the more focused the first conversation can be.</p>
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                required
                className="rounded-lg border border-gray-300 p-4 focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                className="rounded-lg border border-gray-300 p-4 focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                className="rounded-lg border border-gray-300 p-4 focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                name="challenges"
                value={formData.challenges}
                onChange={handleChange}
                placeholder="Describe your vision challenges"
                rows={4}
                className="rounded-lg border border-gray-300 p-4 focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Submitting...' : 'Request My Assessment'}
              </button>

              {statusMessage && (
                <p className="text-sm font-medium text-slate-700" aria-live="polite">
                  {statusMessage}
                </p>
              )}
            </form>

            <div className="section-box overflow-hidden">
              <img
                src={clinicConsultation}
                alt="Clinical consultation appointment"
                className="h-56 w-full object-cover"
              />
              <div className="p-6">
                <h2 className="text-2xl font-bold text-slate-900">What to Expect</h2>
                <p className="mt-3 text-slate-600">
                  Your first conversation is practical and welcoming. We review your history, current challenges, and whether a specialty assessment is the right move.
                </p>

                <div className="mt-6 space-y-4 text-sm text-slate-700">
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-4 w-4 text-blue-600" />
                    <a href="tel:2049967880" className="hover:text-blue-700">(204) 996-7880</a>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-4 w-4 text-blue-600" />
                    <a href="mailto:clinical@lodgeoptical.com" className="hover:text-blue-700">clinical@lodgeoptical.com</a>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-blue-600" />
                    <span>123 Vision Way, Suite 100, Winnipeg, MB</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-4 w-4 text-blue-600" />
                    <span>Mon–Fri: 9:00 AM – 6:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="section-box p-5">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              <p className="mt-3 text-sm text-slate-700">Bring your current prescription and any past lens details if available.</p>
            </div>
            <div className="section-box p-5">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              <p className="mt-3 text-sm text-slate-700">Expect a structured assessment focused on comfort, clarity, and long-term wearability.</p>
            </div>
            <div className="section-box p-5">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              <p className="mt-3 text-sm text-slate-700">If specialty lenses are appropriate, we will outline the next clinical steps clearly.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
