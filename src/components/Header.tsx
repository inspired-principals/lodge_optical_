import { useState, useEffect } from 'react';
import { Phone, Mail, Menu, X, CreditCard, User, Settings2, Type, SunMoon, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';

const AccessibilityController = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(100);
  const [brightness, setBrightness] = useState(100);
  
  useEffect(() => {
    const baseFontSize = (scale / 100) * 16;
    document.documentElement.style.fontSize = `${baseFontSize}px`;
    
    if (brightness < 50) {
      const brightnessAdjust = (brightness / 50) * 100;
      document.documentElement.style.filter = `invert(1) hue-rotate(180deg) brightness(${brightnessAdjust}%) contrast(110%)`;
    } else {
      const brightnessAdjust = ((brightness - 50) / 50) * 100 + 50;
      document.documentElement.style.filter = `brightness(${brightnessAdjust}%)`;
    }
  }, [scale, brightness]);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-slate-100 transition-colors text-primary-blue"
        aria-label="Accessibility Settings"
        title="Visual Settings"
      >
        <Settings2 size={20} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 top-full mt-4 w-72 bg-white shadow-2xl rounded-2xl border border-slate-200 p-6 z-[200]"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-6">
              <h4 className="font-bold text-slate-800 uppercase tracking-widest text-xs">Accessibility Options</h4>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 rounded p-1 transition-all"><X size={16}/></button>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Type size={16}/> Text Size</span>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{scale}%</span>
                </div>
                <input 
                  type="range" min="100" max="150" step="5"
                  value={scale} 
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-slate-700 flex items-center gap-2"><SunMoon size={16}/> Brightness</span>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{brightness}%</span>
                </div>
                <input 
                  type="range" min="20" max="100" step="5"
                  value={brightness} 
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
                />
                <p className="text-[10.5px] font-medium text-slate-500 mt-3 leading-tight border-l-2 border-blue-500 pl-2">
                  Dropping below 50% automatically engages High-Contrast Dark Mode.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Header() {
  const location = useLocation();
  const [isSticky, setIsSticky] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownOpen && !(event.target as Element).closest('.dropdown-container')) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { 
      name: 'Specialties', 
      href: '#',
      dropdown: [
        { name: 'Keratoconus', href: '/keratoconus' },
        { name: 'Post-Surgical', href: '/post-surgical' },
        { name: 'Dry Eye', href: '/dry-eye' },
      ]
    },
    { name: 'Resources', href: '/info' },
    { name: 'FAQ', href: '/faq' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActivePath = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const UserProfileButton = () => (
    <Link
      to="/auth"
      className="rounded-full border border-slate-200 bg-white p-2 text-primary-blue transition-colors hover:bg-slate-100"
      aria-label="Secure Portal Access"
      title="Patient / Provider Portal"
    >
      <User size={20} />
    </Link>
  );

  return (
    <header
      id="myHeader"
      className={`fixed top-0 left-0 right-0 z-[100] bg-transparent transition-all duration-300 ${
        isSticky
          ? 'h-[60px] md:h-[68px] border-b border-slate-200/70 bg-white/88 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl'
          : 'h-[68px] md:h-[82px]'
      }`}
      style={{ padding: 0 }}
    >
      <div className="mx-auto flex h-full max-w-[1320px] items-center justify-between px-4 md:px-6">
        <Link
          to="/"
          className={`flex items-center gap-3 font-bold text-primary-blue transition-all duration-300 ${isSticky ? 'scale-[0.98] text-base md:text-lg' : 'text-lg md:text-xl'}`}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-blue via-secondary-blue to-slate-800 text-[10px] text-white ring-1 ring-amber-300/35">LO</div>
          <span className="leading-none">LODGE OPTICAL</span>
        </Link>

        <ul className="hidden lg:flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/85 px-2 py-2 text-sm shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          {navLinks.map((link) => {
            const isActive = link.dropdown 
              ? link.dropdown.some(item => isActivePath(item.href))
              : isActivePath(link.href);
            const isDropdownOpen = dropdownOpen === link.name;

            return (
              <li key={link.name} className="relative dropdown-container">
                {link.dropdown ? (
                  <button
                    onClick={() => setDropdownOpen(isDropdownOpen ? null : link.name)}
                    className={`group relative flex items-center gap-1.5 overflow-hidden rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition-all duration-300 ${
                      isActive
                        ? 'text-white shadow-[0_12px_24px_rgba(30,64,175,0.28)]'
                        : 'text-slate-700 hover:-translate-y-0.5 hover:bg-amber-50 hover:text-amber-600 hover:shadow-[0_0_0_1px_rgba(234,179,8,0.26),0_12px_24px_rgba(234,179,8,0.12)]'
                    }`}
                  >
                    {isActive ? (
                      <motion.span
                        layoutId="desktop-nav-pill"
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-blue to-sky-600"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    ) : (
                      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-100/80 via-white to-amber-50/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    )}
                    <span className="relative z-10">{link.name}</span>
                    <ChevronDown size={10} className={`relative z-10 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <Link
                    to={link.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`group relative flex items-center gap-1.5 overflow-hidden rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition-all duration-300 ${
                      isActive
                        ? 'text-white shadow-[0_12px_24px_rgba(30,64,175,0.28)]'
                        : 'text-slate-700 hover:-translate-y-0.5 hover:bg-amber-50 hover:text-amber-600 hover:shadow-[0_0_0_1px_rgba(234,179,8,0.26),0_12px_24px_rgba(234,179,8,0.12)]'
                    }`}
                  >
                    {isActive ? (
                      <motion.span
                        layoutId="desktop-nav-pill"
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-blue to-sky-600"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    ) : (
                      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-100/80 via-white to-amber-50/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    )}
                    <span className="relative z-10">{link.name}</span>
                  </Link>
                )}

                {/* Dropdown Menu */}
                {link.dropdown && isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-xl border border-slate-200/80 shadow-[0_20px_40px_rgba(15,23,42,0.15)] py-2 z-50"
                  >
                    {link.dropdown.map((item) => {
                      const itemIsActive = isActivePath(item.href);
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setDropdownOpen(null)}
                          className={`block px-4 py-2 text-sm font-medium transition-colors ${
                            itemIsActive
                              ? 'text-primary-blue bg-blue-50'
                              : 'text-slate-700 hover:text-primary-blue hover:bg-slate-50'
                          }`}
                        >
                          {item.name}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </li>
            );
          })}
        </ul>

        <div className="hidden lg:flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/85 px-2 py-2 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <a
            href="mailto:clinical@lodgeoptical.com"
            className="hidden xl:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600 transition-colors hover:text-primary-blue"
          >
            <Mail size={13} />
            <span>Clinical Support</span>
          </a>
          <AccessibilityController />
          <UserProfileButton />
          <Link
            to="/contact"
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-blue to-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(30,64,175,0.24)]"
          >
            <Phone size={15} />
            <span>BOOK CONSULTATION</span>
          </Link>
        </div>

        <button
          className="lg:hidden flex items-center justify-center w-10 h-10 text-primary-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[110] bg-slate-950/55 backdrop-blur-sm lg:hidden"
              aria-label="Close navigation menu"
            />

            <motion.div
              initial={{ opacity: 0, x: 36 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 36 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed right-0 top-[64px] bottom-0 z-[120] flex w-[min(88vw,360px)] flex-col border-l border-slate-200 bg-white/95 px-4 py-5 shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl lg:hidden"
            >
              <div className="mb-4 text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary-blue">Navigation</p>
                <p className="mt-1 text-xs text-slate-500">Choose a page to continue</p>
              </div>

              <ul className="flex flex-col items-end text-right">
                {navLinks.map((link) => {
                  const isActive = link.dropdown 
                    ? link.dropdown.some(item => isActivePath(item.href))
                    : isActivePath(link.href);

                  return (
                    <li key={link.name} className="w-full border-t border-slate-100 first:border-t-0">
                      {link.dropdown ? (
                        <div className="w-full">
                          <button
                            onClick={() => setDropdownOpen(dropdownOpen === link.name ? null : link.name)}
                            className={`flex items-center justify-end gap-2 px-3 py-3 text-sm font-semibold uppercase tracking-[0.22em] transition-colors w-full ${
                              isActive ? 'text-primary-blue' : 'text-slate-700 hover:bg-slate-50 hover:text-primary-blue'
                            }`}
                          >
                            <span>{link.name}</span>
                            <ChevronDown size={12} className={`transition-transform duration-200 ${dropdownOpen === link.name ? 'rotate-180' : ''}`} />
                          </button>
                          
                          {dropdownOpen === link.name && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-1 space-y-1"
                            >
                              {link.dropdown.map((item) => {
                                const itemIsActive = isActivePath(item.href);
                                return (
                                  <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => {
                                      setIsMobileMenuOpen(false);
                                      setDropdownOpen(null);
                                    }}
                                    className={`block px-6 py-2 text-sm font-medium transition-colors ${
                                      itemIsActive
                                        ? 'text-primary-blue bg-blue-50'
                                        : 'text-slate-600 hover:text-primary-blue hover:bg-slate-50'
                                    }`}
                                  >
                                    {item.name}
                                  </Link>
                                );
                              })}
                            </motion.div>
                          )}
                        </div>
                      ) : (
                        <Link
                          to={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center justify-end gap-2 px-3 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-slate-700 transition-colors hover:bg-slate-50 hover:text-primary-blue"
                        >
                          <span>{link.name}</span>
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="mt-auto space-y-3 pt-5">
                <div className="flex items-center justify-end gap-2">
                  <AccessibilityController />
                  <UserProfileButton />
                </div>

                <Link
                  to="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-xl bg-primary-blue px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white"
                >
                  Book Consultation
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
