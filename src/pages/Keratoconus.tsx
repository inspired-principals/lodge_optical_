import HeroSection from '../components/sections/HeroSection';
import { WhoThisIsFor } from '../components/sections/WhoThisIsFor';
import { ProcessSection } from '../components/sections/ProcessSection';
import { EducationBlock } from '../components/sections/EducationBlock';
import { WhyUsSection } from '../components/sections/WhyUsSection';
import { FAQBlock } from '../components/sections/FAQBlock';
import { CTASection } from '../components/sections/CTASection';

import {
  keratoconusHero,
  keratoconusWho,
  keratoconusProcess,
  keratoconusEducation,
  keratoconusWhyUs,
  keratoconusFAQ,
  keratoconusCTA
} from '../content/keratoconusContent';

export default function Keratoconus() {
  return (
    <main className="flex flex-col min-h-screen">
      <HeroSection content={keratoconusHero} />
      <WhoThisIsFor content={keratoconusWho} />
      <ProcessSection content={keratoconusProcess} />
      <EducationBlock content={keratoconusEducation} />
      <WhyUsSection content={keratoconusWhyUs} />
      <FAQBlock content={keratoconusFAQ} condition="keratoconus" />
      <CTASection content={keratoconusCTA} />
    </main>
  );
}
