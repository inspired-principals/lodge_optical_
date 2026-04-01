import { SectionHeader } from '../patterns/SectionHeader';
import { Link } from 'react-router-dom';

interface EducationContent {
  title: string;
  sections: {
    heading: string;
    text: string;
  }[];
}

export function EducationBlock({ content }: { content: EducationContent }) {
  return (
    <section className="py-16 md:py-24 bg-white border-y border-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title={content.title} />
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {content.sections.map((section, index) => (
            <div key={index} className="flex flex-col">
               <h3 className="text-xl font-bold text-slate-900 mb-3">{section.heading}</h3>
               <p className="text-lg text-slate-600 leading-relaxed font-light">
                 {section.text.split(/(\[.*\]\(.*\))/).map((part, i) => {
                   const match = part.match(/\[(.*)\]\((.*)\)/);
                   if (match) {
                     return <Link key={i} to={match[2]} className="text-blue-600 font-bold hover:underline">{match[1]}</Link>;
                   }
                   return part;
                 })}
               </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
