import { Link } from 'react-router-dom';

interface HeroContent {
  headline: string;
  subheadline: string;
  cta?: string;
  link?: string;
  backgroundImage?: string;
}

interface HeroSectionProps {
  content?: HeroContent;
}

export default function HeroSection({ content }: HeroSectionProps = {}) {
  const defaultContent = {
    headline: 'When standard contact lenses fail, this is where you come next.',
    subheadline:
      "Specialty scleral and rigid lenses designed for complex corneas, post-surgical eyes, and severe dry eye — built for patients who have already been told 'nothing else will work.'",
    cta: 'Start Digital Triage',
    link: '/triage'
  };

  const heroContent = content || defaultContent;

  return (
    <section className="max-w-6xl mx-auto px-6 py-16 md:px-24 md:py-20">
      <div className="deep-panel p-8 md:p-10 lg:p-12 text-left text-white">
        <span className="luminous-chip">Clinical-grade specialty care</span>
        <h1 className="mt-5 text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold md:font-bold leading-tight">
          {heroContent.headline}
        </h1>
        <p className="mt-4 max-w-2xl text-lg md:text-xl leading-relaxed text-slate-200">
          {heroContent.subheadline}
        </p>

        <div className="mb-3 mt-7 flex flex-col gap-3 md:mb-4 sm:flex-row sm:items-center">
          {heroContent.cta && heroContent.link && (
            <Link to={heroContent.link} className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700">
              {heroContent.cta}
            </Link>
          )}
          <span className="text-xs md:text-sm uppercase tracking-[0.2em] text-slate-300">
            Hard-to-fit • post-surgical • severe dry eye
          </span>
        </div>

        <div className="soft-divider mt-6" />
        <p className="mt-4 text-sm md:text-base text-slate-300">
          A structured assessment to determine if specialty lenses are appropriate for your case.
        </p>
      </div>
    </section>
  );
}
