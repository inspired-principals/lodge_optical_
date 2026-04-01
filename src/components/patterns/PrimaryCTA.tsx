import { Link } from 'react-router-dom';
import { trackEvent } from '../../utils/events';

export function PrimaryCTA({ text, link }: { text: string; link: string }) {
  return (
    <Link 
      to={link}
      onClick={() => trackEvent('cta_clicked', { action: text, destination: link })}
      className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold tracking-widest uppercase text-white transition-all duration-300 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-[0_0_40px_rgba(37,99,235,0.3)] hover:shadow-[0_0_60px_rgba(37,99,235,0.5)] hover:-translate-y-1 overflow-hidden"
    >
      <span className="relative z-10">{text}</span>
      <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
    </Link>
  );
}
