import { motion } from 'motion/react';
import HeroSection from '../components/sections/HeroSection';
import { WhoThisIsFor } from '../components/sections/WhoThisIsFor';
import { ImageFeature } from '../components/sections/ImageFeature';
import { ProcessSection } from '../components/sections/ProcessSection';
import { EducationBlock } from '../components/sections/EducationBlock';
import { WhyUsSection } from '../components/sections/WhyUsSection';
import { FAQBlock } from '../components/sections/FAQBlock';
import { CTASection } from '../components/sections/CTASection';

import {
  dryEyeHero,
  dryEyeWho,
  dryEyeProcess,
  dryEyeEducation,
  dryEyeWhyUs,
  dryEyeSpecialtyFitting,
  dryEyeFAQ,
  dryEyeCTA
} from '../content/dryEyeContent';

export default function DryEye() {
  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="flex flex-col min-h-screen"
    >
      <HeroSection content={dryEyeHero} />
      <WhoThisIsFor content={dryEyeWho} />
      <ImageFeature content={dryEyeSpecialtyFitting} />
      <ProcessSection content={dryEyeProcess} />
      <EducationBlock content={dryEyeEducation} />
      <WhyUsSection content={dryEyeWhyUs} />
      <FAQBlock content={dryEyeFAQ} condition="dry-eye" />
      <CTASection content={dryEyeCTA} />
    </motion.main>
  );
}
