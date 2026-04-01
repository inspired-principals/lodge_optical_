import { useMemo, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  Bot,
  CalendarDays,
  ExternalLink,
  Info,
  Loader2,
  PhoneCall,
  Send,
  Sparkles,
  X
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import consultationImage from '../images/premium_clinical_consultation.png';
import topographyMap from '../images/corneal_topography_map.png';
import supportImage from '../images/pexels-shkrabaanthony-6749697.jpg';
import careImage from '../images/pexels-tima-miroshnichenko-6608260.jpg';
import { api } from '../services/api';
import { sendMessage } from '../services/geminiService';

type ChatMessage = {
  role: 'assistant' | 'user';
  text: string;
};

type RequestType = 'Assessment Request' | 'Callback Request';

type DetailKey = 'assessment' | 'triage' | 'keratoconus' | 'dryEye' | 'postSurgical' | 'services' | 'contact';

const quickPrompts = [
  'Book an assessment',
  'Request a callback',
  'Explain digital triage',
  'Help with keratoconus'
];

const detailCards: Record<DetailKey, { title: string; image: string; description: string; bullets: string[]; ctaLabel: string; ctaLink: string }> = {
  assessment: {
    title: 'Book a Clinical Assessment',
    image: consultationImage,
    description: 'A clinical assessment is where we review your vision history, current symptoms, prior fits, and whether specialty lenses are the right next step.',
    bullets: [
      'Bring your current prescription and any past lens details if possible',
      'We review comfort, clarity, stability, and wearing time goals',
      'If specialty care is appropriate, next steps are outlined clearly'
    ],
    ctaLabel: 'Go to Contact',
    ctaLink: '/contact'
  },
  triage: {
    title: 'Digital Triage Overview',
    image: topographyMap,
    description: 'Digital triage is a pre-evaluation tool that helps the clinic understand symptoms, visual performance, and case complexity before your visit.',
    bullets: [
      'It is not a diagnosis',
      'It helps prepare for a more focused in-person assessment',
      'It can flag when specialty evaluation is worth pursuing'
    ],
    ctaLabel: 'Start Triage',
    ctaLink: '/triage'
  },
  keratoconus: {
    title: 'Keratoconus Support',
    image: topographyMap,
    description: 'Keratoconus often causes fluctuating, distorted, or unstable vision that needs a more exact clinical strategy than routine correction can deliver.',
    bullets: [
      'Custom scleral and RGP lenses can vault corneal irregularity',
      'Advanced mapping helps create a more stable optical surface',
      'Long-term monitoring matters as the cornea changes over time'
    ],
    ctaLabel: 'Explore Keratoconus Care',
    ctaLink: '/keratoconus'
  },
  dryEye: {
    title: 'Dry Eye Management',
    image: supportImage,
    description: 'For severe dry eye, specialty lenses can create a fluid reservoir that protects the eye and supports steadier comfort throughout the day.',
    bullets: [
      'Useful when drops alone are not enough',
      'May improve both comfort and consistency of vision',
      'Best results usually come from structured follow-up care'
    ],
    ctaLabel: 'Explore Dry Eye Care',
    ctaLink: '/dry-eye'
  },
  postSurgical: {
    title: 'Post-Surgical Rehabilitation',
    image: careImage,
    description: 'After LASIK, PRK, RK, or corneal transplant procedures, the eye can require a more precise rehabilitation plan to restore comfort and predictability.',
    bullets: [
      'Useful for unstable or distorted vision after surgery',
      'Precision fitting can help restore predictability and comfort',
      'The goal is functional long-term stability, not short-term guessing'
    ],
    ctaLabel: 'Explore Post-Surgical Care',
    ctaLink: '/post-surgical'
  },
  services: {
    title: 'Specialty Services',
    image: careImage,
    description: 'The clinic focuses on custom scleral lenses, RGP fitting, post-surgical recovery work, and dry eye support for challenging cases.',
    bullets: [
      'Custom scleral lens design',
      'Rigid gas permeable lens fitting',
      'Post-surgical refitting and rehabilitation'
    ],
    ctaLabel: 'View Services',
    ctaLink: '/services'
  },
  contact: {
    title: 'Contact & Callback Support',
    image: consultationImage,
    description: 'If you want help quickly, the assistant can collect your details and submit a request for an assessment or callback through the existing inquiry flow.',
    bullets: [
      'Request an assessment',
      'Arrange a callback',
      'Pre-fill the contact and inquiry forms'
    ],
    ctaLabel: 'Open Contact Page',
    ctaLink: '/contact'
  }
};

function buildLocalReply(message: string) {
  const text = message.toLowerCase();

  if (/callback|call me|call back|phone call/.test(text)) {
    return {
      text: 'Absolutely — I can help arrange a callback. Fill the short request form below and I will submit it through the site inquiry flow.',
      detailKey: 'contact' as DetailKey,
      requestType: 'Callback Request' as RequestType
    };
  }

  if (/book|appointment|assessment|consult/.test(text)) {
    return {
      text: 'I can help with that. Share your details below and I will send an assessment request through the site.',
      detailKey: 'assessment' as DetailKey,
      requestType: 'Assessment Request' as RequestType
    };
  }

  if (/triage|pre-evaluation|scan/.test(text)) {
    return {
      text: 'Digital triage is a guided pre-evaluation that helps the clinic understand your symptoms and case complexity before your visit.',
      detailKey: 'triage' as DetailKey
    };
  }

  if (/keratoconus|pmd|irregular cornea/.test(text)) {
    return {
      text: 'Keratoconus and related corneal irregularities often need custom scleral or RGP designs built around the actual shape of the cornea.',
      detailKey: 'keratoconus' as DetailKey
    };
  }

  if (/dry eye|dryness|irritation/.test(text)) {
    return {
      text: 'For severe dry eye, specialty lenses can create a fluid reservoir that supports comfort and more stable day-to-day vision.',
      detailKey: 'dryEye' as DetailKey
    };
  }

  if (/lasik|prk|rk|post-surgical|transplant/.test(text)) {
    return {
      text: 'Post-surgical corneas often need more precise rehabilitation than standard soft lenses can provide.',
      detailKey: 'postSurgical' as DetailKey
    };
  }

  if (/service|scleral|rgp|lens|astigmatism/.test(text)) {
    return {
      text: 'Core services here include custom scleral lenses, rigid gas permeable fitting, post-surgical recovery care, and advanced dry eye support.',
      detailKey: 'services' as DetailKey
    };
  }

  if (/contact|email|phone|location|hours/.test(text)) {
    return {
      text: 'You can use this assistant to request an assessment or callback, or go directly to the contact page for a full inquiry form.',
      detailKey: 'contact' as DetailKey
    };
  }

  if (/help|what can you do/.test(text)) {
    return {
      text: 'I can answer questions about services, keratoconus, dry eye, post-surgical issues, digital triage, and I can also submit appointment or callback requests for you.',
      detailKey: 'services' as DetailKey
    };
  }

  return { text: '', useAI: true };
}

export default function SiteAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Welcome — I can help with services, triage, keratoconus, dry eye, and the next best step for an assessment or callback.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [detailKey, setDetailKey] = useState<DetailKey | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestType, setRequestType] = useState<RequestType>('Assessment Request');
  const [requestStatus, setRequestStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [requestForm, setRequestForm] = useState({
    name: '',
    email: '',
    phone: '',
    preferredTime: '',
    notes: ''
  });

  const navigate = useNavigate();
  const location = useLocation();

  const activeCard = useMemo(() => (detailKey ? detailCards[detailKey] : null), [detailKey]);

  const handleAssistantReply = async (messageText: string) => {
    const localReply = buildLocalReply(messageText);

    if (localReply.detailKey) {
      setDetailKey(localReply.detailKey);
    }

    if (localReply.requestType) {
      setRequestType(localReply.requestType);
      setShowRequestForm(true);
    }

    if (localReply.useAI) {
      setIsThinking(true);
      try {
        const reply = await sendMessage(messageText);
        setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
      } finally {
        setIsThinking(false);
      }
      return;
    }

    setMessages((prev) => [...prev, { role: 'assistant', text: localReply.text }]);
  };

  const handleSend = async (preset?: string) => {
    const messageText = (preset ?? input).trim();
    if (!messageText) return;

    setMessages((prev) => [...prev, { role: 'user', text: messageText }]);
    setInput('');
    await handleAssistantReply(messageText);
  };

  const handleRequestSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRequestStatus('submitting');

    const payload = {
      name: requestForm.name,
      email: requestForm.email,
      phone: requestForm.phone,
      inquiryType: requestType,
      message: [
        requestType,
        requestForm.preferredTime ? `Preferred time: ${requestForm.preferredTime}` : '',
        requestForm.notes
      ]
        .filter(Boolean)
        .join(' • ')
    };

    try {
      await api.submitContactForm(payload);
      localStorage.setItem('lodge_assistant_prefill', JSON.stringify({
        name: requestForm.name,
        email: requestForm.email,
        phone: requestForm.phone,
        message: payload.message,
        inquiryType: requestType,
        openPanel: true
      }));

      window.dispatchEvent(
        new CustomEvent('lodge-assistant-prefill', {
          detail: {
            name: requestForm.name,
            email: requestForm.email,
            phone: requestForm.phone,
            message: payload.message,
            inquiryType: requestType,
            openPanel: true
          }
        })
      );

      setRequestStatus('success');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text:
            requestType === 'Callback Request'
              ? 'Your callback request has been sent through the site inquiry flow.'
              : 'Your assessment request has been sent through the site inquiry flow.'
        }
      ]);
    } catch {
      setRequestStatus('error');
      setMessages((prev) => [...prev, { role: 'assistant', text: 'I ran into a problem sending that request. Please try the contact page directly.' }]);
    }
  };

  return (
    <>
      <div className="fixed bottom-4 right-3 z-[140] flex flex-col items-end gap-3 sm:bottom-5 sm:right-5">
        {!isOpen && (
          <div className="rounded-full bg-slate-950/90 px-4 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-md">
            Need help choosing the right next step?
          </div>
        )}

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_20px_40px_rgba(37,99,235,0.4)] transition hover:scale-105"
          aria-label="Open site assistant"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            className="fixed bottom-20 right-2 z-[140] w-[min(380px,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] overflow-hidden rounded-[2rem] border-2 border-slate-900/80 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.26)] sm:bottom-24 sm:right-5"
          >
            <div className="hero-gradient p-5 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-200">Site-wide assistant</p>
                  <h3 className="mt-1 text-xl font-bold">Lodge Optical Guide</h3>
                  <p className="mt-1 text-sm text-slate-300">Answers questions, surfaces relevant info, and can request appointments or callbacks.</p>
                </div>
                <Sparkles className="h-5 w-5 text-blue-200" />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-white/15"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[52vh] space-y-3 overflow-y-auto bg-slate-100 p-4 border-y border-slate-300">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm font-medium leading-6 border ${
                      message.role === 'user'
                        ? 'bg-blue-700 text-white border-blue-900 shadow-md'
                        : 'bg-white text-slate-950 border-slate-300 shadow-sm ring-1 ring-slate-200'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm ring-1 ring-slate-200">
                    <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
                  </div>
                </div>
              )}

              {showRequestForm && (
                <form onSubmit={handleRequestSubmit} className="section-box p-4 space-y-3 border-2 border-blue-200">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700">{requestType}</p>
                    <p className="mt-1 text-sm text-slate-600">Share a few details and I’ll send the request through the site.</p>
                  </div>
                  <input
                    value={requestForm.name}
                    onChange={(e) => setRequestForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Full name"
                    required
                    className="input-premium"
                  />
                  <input
                    value={requestForm.email}
                    onChange={(e) => setRequestForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="Email"
                    type="email"
                    required
                    className="input-premium"
                  />
                  <input
                    value={requestForm.phone}
                    onChange={(e) => setRequestForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="Phone"
                    className="input-premium"
                  />
                  <input
                    value={requestForm.preferredTime}
                    onChange={(e) => setRequestForm((prev) => ({ ...prev, preferredTime: e.target.value }))}
                    placeholder="Preferred time for contact"
                    className="input-premium"
                  />
                  <textarea
                    value={requestForm.notes}
                    onChange={(e) => setRequestForm((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Short note about your vision concerns"
                    rows={3}
                    className="input-premium resize-none"
                  />
                  <button
                    type="submit"
                    disabled={requestStatus === 'submitting'}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-70"
                  >
                    {requestStatus === 'submitting' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send request'}
                  </button>
                  {requestStatus === 'success' && <p className="text-xs font-medium text-emerald-700">Request sent successfully.</p>}
                  {requestStatus === 'error' && <p className="text-xs font-medium text-rose-700">Unable to send. Please try again.</p>}
                </form>
              )}
            </div>

            <div className="border-t border-slate-200 bg-white p-3">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                  placeholder={`Ask about ${location.pathname === '/triage' ? 'triage or next steps' : 'services, dry eye, booking...'}`}
                  className="flex-1 rounded-xl border-2 border-slate-400 bg-white px-3 py-2.5 text-sm font-medium text-slate-950 placeholder:text-slate-500 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                />
                <button
                  onClick={() => void handleSend()}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                <button
                  onClick={() => {
                    setRequestType('Assessment Request');
                    setShowRequestForm(true);
                    setDetailKey('assessment');
                  }}
                  className="inline-flex items-center gap-1 hover:text-blue-700"
                >
                  <CalendarDays className="h-3.5 w-3.5" /> Request assessment
                </button>
                <button
                  onClick={() => {
                    setRequestType('Callback Request');
                    setShowRequestForm(true);
                    setDetailKey('contact');
                  }}
                  className="inline-flex items-center gap-1 hover:text-blue-700"
                >
                  <PhoneCall className="h-3.5 w-3.5" /> Request callback
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/60 p-4"
            onClick={() => setDetailKey(null)}
          >
            <motion.div
              initial={{ y: 18, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 18, scale: 0.98 }}
              onClick={(event) => event.stopPropagation()}
              className="section-box w-full max-w-xl overflow-hidden"
            >
              <img src={activeCard.image} alt={activeCard.title} className="h-52 w-full object-cover" />
              <div className="p-6 md:p-7">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700">Detailed info</p>
                    <h3 className="mt-2 text-2xl font-bold text-slate-900">{activeCard.title}</h3>
                  </div>
                  <button onClick={() => setDetailKey(null)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <p className="mt-4 text-slate-600">{activeCard.description}</p>
                <ul className="mt-5 space-y-2 text-sm text-slate-700">
                  {activeCard.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2">
                      <Info className="mt-0.5 h-4 w-4 text-blue-600" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => {
                      navigate(activeCard.ctaLink);
                      setDetailKey(null);
                    }}
                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700"
                  >
                    {activeCard.ctaLabel} <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setRequestType('Assessment Request');
                      setShowRequestForm(true);
                      setDetailKey(null);
                      setIsOpen(true);
                    }}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Ask the assistant
                  </button>
                </div>

                <div className="mt-5 text-xs text-slate-500">
                  Want more help? This assistant can also pre-fill inquiry forms and send callback requests.
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
