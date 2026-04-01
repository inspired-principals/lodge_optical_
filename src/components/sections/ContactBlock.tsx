import { useState, type ChangeEvent, type FormEvent } from 'react';
import { MapPin, Phone, Mail, Clock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

interface ContactContent {
  title: string;
  address: string;
  phone: string;
  email: string;
  hours: { days: string; time: string }[];
}

const initialFormState = {
  name: '',
  email: '',
  phone: '',
  message: '',
};

export function ContactBlock({ content }: { content: ContactContent }) {
  const [formData, setFormData] = useState(initialFormState);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [emailError, setEmailError] = useState('');

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));

    if (name === 'email') {
      setEmailError('');
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    if (!isValidEmail) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    setEmailError('');
    setStatus('submitting');

    try {
      await api.submitContactForm({
        ...formData,
        inquiryType: 'Contact Page',
      });
      setStatus('success');
      setFormData(initialFormState);
    } catch (error) {
      console.error('Contact request failed:', error);
      setStatus('error');
    }
  };

  return (
    <section className="py-24 md:py-32 mesh-bg relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
        
        <div className="space-y-8 p-10 md:p-12 glass-panel rounded-3xl">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight text-gradient drop-shadow-sm pb-1">{content.title}</h2>
          
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Location</h3>
              <p className="text-lg text-slate-800 font-bold">{content.address}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
              <Phone className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Phone</h3>
              <a href={`tel:${content.phone.replace(/[^\d]/g, '')}`} className="text-lg text-slate-800 font-bold hover:text-blue-600 transition-colors">
                {content.phone}
              </a>
            </div>
          </div>
          
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Email</h3>
              <a href={`mailto:${content.email}`} className="text-lg text-slate-800 font-bold hover:text-blue-600 transition-colors">
                {content.email}
              </a>
            </div>
          </div>
          
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="w-full">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Hours</h3>
              <div className="space-y-3">
                {content.hours.map((h, i) => (
                  <div key={i} className="flex justify-between items-center text-lg text-slate-700 pb-2 border-b border-slate-200/50 last:border-0 font-medium">
                    <span className="text-slate-500">{h.days}</span>
                    <span className="font-bold">{h.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-10 md:p-12 glass-panel rounded-3xl">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight text-gradient drop-shadow-sm pb-1 mb-8">Send a Message</h2>

          {status === 'success' && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">Thanks for reaching out. Your request has been sent and the clinic will follow up soon.</p>
            </div>
          )}

          {status === 'error' && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">Something went wrong while sending your request. Please try again or call the clinic directly.</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="contact-name" className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
              <input
                id="contact-name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-white/60 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 text-lg font-medium shadow-sm backdrop-blur-sm"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-5 py-4 bg-white/60 border ${emailError ? 'border-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 text-lg font-medium shadow-sm backdrop-blur-sm`}
                placeholder="you@example.com"
              />
              {emailError && <p className="mt-2 text-sm text-rose-600">{emailError}</p>}
            </div>
            <div>
              <label htmlFor="contact-phone" className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-white/60 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 text-lg font-medium shadow-sm backdrop-blur-sm"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label htmlFor="contact-message" className="block text-sm font-bold text-slate-700 mb-2">Message</label>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                required
                value={formData.message}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-white/60 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-lg font-medium shadow-sm backdrop-blur-sm"
                placeholder="How can we help?"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full py-4 mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg tracking-wider uppercase rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              <span className="flex items-center justify-center gap-2">
                {status === 'submitting' ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending Request...
                  </>
                ) : (
                  'Submit Request'
                )}
              </span>
            </button>
          </form>
        </div>

      </div>
    </section>
  );
}
