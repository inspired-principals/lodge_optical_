import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { SectionHeader } from '../patterns/SectionHeader';
import { trackEvent } from '../../utils/events';

interface FAQ {
  q: string;
  a: string;
}

interface FAQContent {
  title: string;
  items: FAQ[];
}

export function FAQBlock({ content, condition }: { content: FAQContent; condition: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number, q: string) => {
    const isOpening = openIndex !== index;
    setOpenIndex(isOpening ? index : null);
    
    if (isOpening) {
      trackEvent('faq_expanded', { condition, question: q });
    }
  };

  return (
    <section className="py-16 md:py-24 bg-slate-50 border-y border-slate-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title={content.title} />
        <div className="mt-8 space-y-4">
          {content.items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md">
                <button 
                  onClick={() => toggleFAQ(index, item.q)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                >
                  <span className="text-lg font-bold text-slate-800 pr-4">{item.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-slate-600 text-lg leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
