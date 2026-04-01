import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const siteSystemInstruction = `You are the site-wide assistant for Lodge Optical. The practice specializes in complex contact lens fitting, scleral lenses, rigid gas permeable lenses, post-surgical rehabilitation, dry eye support, and digital triage. Keep answers concise, warm, and grounded in what the site actually offers. Encourage users to request an assessment or callback when appropriate. Do not claim to diagnose or provide medical certainty.`;

function getFallbackReply(message: string) {
  const text = message.toLowerCase();

  if (/appointment|book|assessment|consult/.test(text)) {
    return 'You can request a clinical assessment directly through the site, and the assistant can also help submit a callback or appointment request.';
  }

  if (/callback|call me|call back|phone/.test(text)) {
    return 'Yes — callback requests can be sent through the site inquiry flow. Share your contact details and preferred time.';
  }

  if (/triage|pre-evaluation|scan/.test(text)) {
    return 'Digital triage is a pre-evaluation tool that helps the clinic understand symptoms and case complexity before an in-person visit.';
  }

  if (/keratoconus|irregular cornea|pmd/.test(text)) {
    return 'Lodge Optical focuses on custom scleral and RGP lens strategies for keratoconus and other irregular corneal conditions.';
  }

  if (/dry eye|dryness|irritation/.test(text)) {
    return 'For severe dry eye, specialty lens care can support hydration, comfort, and more stable day-to-day vision.';
  }

  if (/post-surgical|lasik|prk|rk|transplant/.test(text)) {
    return 'Post-surgical rehabilitation is one of the site’s core services, especially when standard lenses no longer provide stable vision.';
  }

  if (/service|scleral|rgp|lens/.test(text)) {
    return 'Core services include custom scleral lenses, rigid gas permeable lenses, post-surgical rehabilitation, and severe dry eye support.';
  }

  return 'I can help with services, digital triage, keratoconus, dry eye, post-surgical issues, appointments, and callback requests.';
}

export async function sendMessage(message: string) {
  const fallback = getFallbackReply(message);

  if (!ai) {
    return fallback;
  }

  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: siteSystemInstruction,
      },
    });

    const response = await chat.sendMessage({ message });
    return response.text || fallback;
  } catch {
    return fallback;
  }
}
