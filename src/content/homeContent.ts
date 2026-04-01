import homeVideo from '../images/Video Project 8.mp4';
import featureImage from '../images/pexels-shkrabaanthony-6749774.jpg';
import diabeticEyeImage from '../images/New folder/Blue Modern  Minimal Diabetic Eye Disease Month Instagram Post - Made with PosterMyWall.jpg';
import worldSightDayImage from '../images/New folder/Illustrative World Sight Day Template  Instagram Post - Made with PosterMyWall (1).jpg';
import clinicConsultation from '../images/premium_clinical_consultation.png';
import topographyMap from '../images/corneal_topography_map.png';

export const heroContent = {
  headline: "Still Struggling With Contact Lenses No One Else Can Get Right?",
  subheadline: "Keratoconus. Dry eye. Post-surgical complications. If you've been told \"you're a difficult fit\"… you're exactly who we specialize in.",
  mechanism: "When vision refuses to settle with standard care, we stop forcing your eyes to adapt—and start building the solution around how your eyes actually behave.",
  outcomes: [
    "Vision that stays stable",
    "Comfort that lasts all day",
    "A fit designed specifically for your eyes"
  ],
  cta: "Start Your Eye Rescue Assessment",
  ctaSecondary: "Why Contacts Keep Failing",
  link: "/triage",
  linkSecondary: "/faq",
  backgroundImage: homeVideo
};

export const imageFeatureContent = {
  title: "Precision Engineered for Your Eyes",
  subtitle: "Not all vision challenges can be fixed over the counter.",
  description: "When standard soft lenses and glasses fail to provide clear, comfortable vision, specialty lenses are the required medical response. We design custom scleral and rigid gas permeable (RGP) lenses that vault over corneal irregularities, providing a perfectly smooth optical surface. This is vision restoration at the highest clinical level.",
  imageSrc: clinicConsultation,
  imageAlt: "Advanced Clinical Consultation",
  imagePosition: 'right' as const,
  bullets: [
    "Vaults over corneal irregularities (Keratoconus)",
    "Provides a constant tear reservoir for Severe Dry Eye",
    "Restores visual acuity after RK, LASIK, or transplants"
  ]
};

export const specialtyOutreachContent = {
  sectionTitle: "Specialty Community & Awareness",
  initiatives: [
    {
      title: "Diabetic Eye Disease Awareness",
      description: "Managing the ocular complications of diabetes requires meticulous, ongoing surveillance. We coordinate with your primary care team to protect your retinal health and visual stability.",
      image: diabeticEyeImage
    },
    {
      title: "World Sight Day Initiatives",
      description: "Advocating for universal access to specialized eye care. We believe clinical-grade vision solutions should be accessible to everyone facing complex corneal challenges.",
      image: worldSightDayImage
    }
  ]
};

export const highTechDiagnostics = {
  title: "Clinical-Grade Topography",
  description: "Our precision starts with data. By mapping thousands of points across your corneal surface, we eliminate the guesswork from the fitting process.",
  imageSrc: topographyMap,
  imageAlt: "Digital Corneal Topography"
};

export const whoThisIsForContent = {
  sectionTitle: "Specialized Care for Complex Prescriptions",
  leadIn: "Standard lenses work for standard eyes. If you’ve experienced discomfort, fluctuating vision, or been told you are a 'hard-to-fit' patient, you are exactly who we designed our clinic for.",
  indicators: [
    "High Astigmatism & Presbyopia",
    "Keratoconus & Corneal Irregularities",
    "Post-Surgical Vision Correction",
    "Chronic Dry Eye Syndrome",
    "History of Contact Lens Intolerance"
  ]
};

export const conditionsContent = {
  sectionTitle: "Conditions We Manage",
  leadIn: "We engineer customized optical solutions for conditions requiring advanced clinical management.",
  conditions: [
    {
      title: "Keratoconus",
      description: "Precision-mapped scleral and custom rigid lenses to bypass corneal irregularities and restore sharp vision."
    },
    {
      title: "Post-Surgical Vision",
      description: "Specialized rehabilitation for eyes after LASIK, PRK, or corneal transplants."
    },
    {
      title: "Severe Dry Eye",
      description: "Scleral lenses that bathe the eye continually in fluid, offering relief when conventional drops fail."
    },
    {
      title: "High & Complex Prescriptions",
      description: "Custom gas permeable and hybrid lenses for patients outside the range of standard soft lenses."
    }
  ]
};

export const processContent = {
  sectionTitle: "A Precision-Driven Approach to Your Vision",
  leadIn: "Every eye requires its own highly specific solution. That’s why we follow a rigorous, individualized protocol rather than a standard fitting.",
  steps: [
    {
      title: "Diagnostic Evaluation",
      description: "We begin with an in-depth analysis of your ocular health, visual demands, and past experiences to establish a clear baseline."
    },
    {
      title: "Targeted Lens Design",
      description: "Driven by your diagnostic data, we engineer or select lenses specifically suited to the unique topography of your eyes."
    },
    {
      title: "Structured Refinement",
      description: "We evaluate the initial fit on-eye with critical precision, making calculated adjustments to secure optimal comfort and clarity."
    },
    {
      title: "Ongoing Management",
      description: "True visual success is a continuous process. We strategically monitor your progress and refine your care as your needs evolve."
    }
  ],
  closingLine: "Our objective is never just a successful fit—it’s long-term visual dependability."
};

export const whyUsContent = {
  title: "Why Patients Trust Our Approach",
  intro: "For patients with complex eyes, the difference is in how carefully the process is handled.",
  pillars: [
    {
      title: "Focused Experience",
      description: "We work extensively with patients who have complex vision needs, including those who have struggled with contact lenses in the past."
    },
    {
      title: "Advanced Technology",
      description: "We use specialized diagnostic tools to better understand your eyes and guide more accurate, effective lens fittings."
    },
    {
      title: "Personalized Care",
      description: "Every fitting is tailored to the individual. We take the time to adjust, refine, and ensure the best possible outcome."
    },
    {
      title: "Ongoing Support",
      description: "Our care continues beyond the initial fitting, with follow-up and adjustments to support long-term comfort and vision."
    }
  ],
  closing: "Our goal is to provide solutions that are not only effective—but sustainable over time."
};

export const ctaContent = {
  headline: "Ready for a specialized approach to your vision?",
  subheadline: "Complete our digital triage to see if you are a candidate for specialty contact lens solutions.",
  primaryButtonText: "Begin Digital Triage",
  buttonLink: "/triage",
  supportText: "Takes less than 5 minutes"
};

export const decisionEnginePreview = {
  title: "Which Eye Challenge Fits You?",
  description: "Select the scenario that matches your vision challenges and see a tailored solution—no guesswork, no generic advice.",
  options: [
    {
      label: "Keratoconus",
      subtext: "Glasses or standard lenses can’t give you stable vision? Our custom lenses and ongoing care stabilize irregular corneas for clear, reliable sight.",
      href: "/keratoconus"
    },
    {
      label: "Post-Surgical",
      subtext: "Vision feels unpredictable after surgery? We provide precision lens fittings and long-term monitoring to restore clarity and comfort.",
      href: "/post-surgical"
    },
    {
      label: "Dry Eye",
      subtext: "Persistent dryness or irritation interfering with vision? Our tailored treatments and lenses keep your eyes comfortable and your vision sharp.",
      href: "/dry-eye"
    }
  ]
};
