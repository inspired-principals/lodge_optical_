export function SectionHeader({ title, subtitle, size = 'default' }: { title: string; subtitle?: string; size?: 'default' | 'sm' }) {
  const titleClasses = size === 'sm' ? 'text-3xl md:text-5xl' : 'text-4xl md:text-6xl';

  return (
    <div className="mb-10 relative z-10">
      <div className="section-box p-6 md:p-8 text-center md:text-left">
        <h2 className={`${titleClasses} font-extrabold text-gradient tracking-tight drop-shadow-sm pb-2`}>
          {title}
        </h2>
        {subtitle && (
          <p className="mt-4 max-w-3xl text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
