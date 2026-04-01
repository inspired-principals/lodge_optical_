import { SectionHeader } from '../patterns/SectionHeader';
import { ConditionCard } from '../patterns/ConditionCard';

interface ConditionData {
  title: string;
  description: string;
}

interface ConditionsProps {
  content: {
    sectionTitle: string;
    leadIn: string;
    conditions: ConditionData[];
  };
}

export function ConditionsSection({ content }: ConditionsProps) {
  return (
    <section className="section-padding bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title={content.sectionTitle} subtitle={content.leadIn} />
        
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          {content.conditions.map((condition, index) => (
            <ConditionCard 
              key={index}
              title={condition.title}
              description={condition.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
