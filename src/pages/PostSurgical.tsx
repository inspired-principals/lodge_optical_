import HeroSection from '../components/sections/HeroSection';
import { WhoThisIsFor } from '../components/sections/WhoThisIsFor';
import { ProcessSection } from '../components/sections/ProcessSection';
import { EducationBlock } from '../components/sections/EducationBlock';
import { WhyUsSection } from '../components/sections/WhyUsSection';
import { FAQBlock } from '../components/sections/FAQBlock';
import { CTASection } from '../components/sections/CTASection';

import {
  postSurgicalHero,
  postSurgicalWho,
  postSurgicalProcess,
  postSurgicalEducation,
  postSurgicalWhyUs,
  postSurgicalFAQ,
  postSurgicalCTA
} from '../content/postSurgicalContent';

export default function PostSurgical() {
  return (
    <main className="flex flex-col min-h-screen">
      <HeroSection content={postSurgicalHero} />
      <WhoThisIsFor content={postSurgicalWho} />
      <ProcessSection content={postSurgicalProcess} />
      <EducationBlock content={postSurgicalEducation} />
      <WhyUsSection content={postSurgicalWhyUs} />
      <FAQBlock content={postSurgicalFAQ} condition="post-surgical" />
      <CTASection content={postSurgicalCTA} />
    </main>
  );
}
