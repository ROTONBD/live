/**
 * Site-wide branding. Change the name / logo text here, or set VITE_SITE_NAME
 * in Netlify environment variables to override without touching code.
 */
const env = import.meta.env

export const site = {
  name: env.VITE_SITE_NAME || 'Legent TV',
  // Text shown in the header logo mark. Split so "LIVE" can be accented.
  logoAccent: 'LIVE',
  logoText: 'TV',
  // Set to an image path (e.g. '/brand/logo.svg') to replace the text logo.
  logoImage: '',
  tagline: 'বাংলা ও আন্তর্জাতিক লাইভ টিভি — anywhere, any screen.',
  description:
    'Watch live Bangla news, sports and entertainment channels in one fast, ad-light player. Free, mobile-first and built for every screen.',
  url: (env.VITE_SITE_URL || 'https://legenttv.netlify.app').replace(/\/$/, ''),
  contactEmail: env.VITE_CONTACT_EMAIL || 'hello@legenttv.example',
  channelsUrl: env.VITE_CHANNELS_URL || '',
  timeZone: 'Asia/Dhaka',
}
