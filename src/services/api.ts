/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Dev API for Lodge Optical
// Simulates a backend service for fetching dynamic content

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  imageUrl: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const mockBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'How to Choose the Right Frames for Your Face Shape',
    excerpt: 'Finding the perfect pair of glasses is all about balance and proportion. Learn which frames suit your unique features.',
    content: 'Full content here...',
    date: '2026-03-15',
    author: 'Dr. Sarah Jenkins',
    imageUrl: 'https://picsum.photos/seed/blog1/800/600',
  },
  {
    id: '2',
    title: 'Understanding Blue Light and Digital Eye Strain',
    excerpt: 'In our digital world, protecting your eyes from screen time is more important than ever. Discover our blue light solutions.',
    content: 'Full content here...',
    date: '2026-03-02',
    author: 'Dr. Mark Lodge',
    imageUrl: 'https://picsum.photos/seed/blog2/800/600',
  },
  {
    id: '3',
    title: 'Summer Eye Care: Protecting Your Vision from UV Rays',
    excerpt: 'Sunglasses are more than just a fashion statement. Learn why UV protection is critical for long-term eye health.',
    content: 'Full content here...',
    date: '2026-02-20',
    author: 'Dr. Sarah Jenkins',
    imageUrl: 'https://picsum.photos/seed/blog3/800/600',
  },
];

const mockServices: Service[] = [
  {
    id: 'eye-exams',
    title: 'Comprehensive Eye Exams',
    description: 'Thorough assessments of your visual acuity and overall eye health using state-of-the-art diagnostic equipment.',
    icon: 'Eye',
  },
  {
    id: 'contact-lenses',
    title: 'Contact Lens Fitting',
    description: 'Expert fittings for all types of contact lenses, including astigmatism, multifocal, and specialty lenses.',
    icon: 'ScanFace',
  },
  {
    id: 'designer-eyewear',
    title: 'Designer Eyewear',
    description: 'A curated collection of premium frames from the world\'s top fashion houses and independent designers.',
    icon: 'Glasses',
  },
  {
    id: 'pediatric',
    title: 'Pediatric Eye Care',
    description: 'Gentle, comprehensive vision care tailored specifically for children\'s developing eyes.',
    icon: 'Baby',
  },
  {
    id: 'emergency',
    title: 'Emergency Eye Care',
    description: 'Immediate attention for eye infections, injuries, sudden vision loss, or foreign bodies.',
    icon: 'Stethoscope',
  },
  {
    id: 'dry-eye',
    title: 'Dry Eye Treatment',
    description: 'Advanced diagnostics and personalized treatment plans for chronic dry eye syndrome.',
    icon: 'Droplets',
  }
];

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  getBlogPosts: async (): Promise<BlogPost[]> => {
    await delay(800);
    return mockBlogPosts;
  },
  getServices: async (): Promise<Service[]> => {
    await delay(600);
    return mockServices;
  },
  submitContactForm: async (data: any): Promise<{ success: boolean; message: string }> => {
    await delay(1000);
    console.log('Form submitted to Dev API:', data);
    return { success: true, message: 'Thank you for your inquiry. We will contact you shortly.' };
  },

  // HARDENED MAGIC LINK FLOW (V1)
  requestMagicLink: async (email: string): Promise<{ success: boolean; debug_url: string }> => {
    await delay(1200);
    // 1. Generate Split Token (ID.SECRET)
    const id = btoa(Math.random().toString(36).substring(7)); // Mock UUID
    const secret = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    
    const token = `${id}.${secret}`;
    
    // 2. URL Fragment Leakage Protection (# instead of ?)
    const url = `${window.location.origin}/auth/verify#token=${token}`;
    
    console.log(`%c[🔒 SECURE DISPATCH] %cSent to ${email}`, "color: #3b82f6; font-weight: bold", "color: #94a3b8");
    console.log(`[Fragment URL]: ${url}`);
    
    // Simulate server-side hashing & storage
    // localStorage.setItem(`ml_${id}`, hash(secret)); 
    
    return { success: true, debug_url: url };
  },

  verifyMagicLink: async (token: string): Promise<{ success: boolean; role: string }> => {
    await delay(1500);
    try {
      const [id, secret] = token.split('.');
      if (!id || !secret) throw new Error('Malformed Token');
      
      // Simulate ID lookup & Secret Hash verification
      console.log(`[Auth Audit] Verifying Token ID: ${id}`);
      
      // Rotate Session on success (Mock)
      return { success: true, role: 'patient' };
    } catch (e) {
      console.error('[Auth Failure] Magic Link invalid or malformed.');
      return { success: false, role: 'none' };
    }
  },

  // Simulated Retention/Cleanup Job (Cron emulation)
  performTokenCleanup: async () => {
    console.log('[Maintenance] Evicting expired security identifiers...');
    // In real env, delete from DB where expiresAt < now
    return { evictedTokens: Math.floor(Math.random() * 10) };
  }
};
