/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  LEGENT TV — CHANNEL LIST
 * ─────────────────────────────────────────────────────────────────────────────
 *  This is the only file you need to edit to add, change or remove channels.
 *  Copy one block, change the values, save — the site updates everywhere
 *  (home, grids, categories, search, guide, player).
 *
 *  Tip: open /admin on your site to fill a form and copy a ready-made block.
 *
 *  Fields
 *  ──────
 *  id              unique, url-safe slug → used in /watch/<id>  (required)
 *  name            display name                                  (required)
 *  nameBn          Bengali name (optional)
 *  logo            image URL or path inside /public (e.g. /logos/ntv.svg)
 *  category        one of: News, Sports, Entertainment, Kids, Religious, Music
 *  tags            extra filters, e.g. ["Bangla"] or ["International"]
 *  description     one or two short sentences
 *  streamUrl       .m3u8 (HLS) or .mp4 URL. Leave "" to show "Channel Offline"
 *  isLive          true = LIVE badge; false = shown as offline
 *  featured        true = eligible for the big hero slot on the home page
 *  currentProgram  { title, start: "HH:MM", end: "HH:MM" }   (24h, Dhaka time)
 *  nextProgram     { title, start: "HH:MM", end: "HH:MM" }
 *  schedule        optional full-day list [{ start: "HH:MM", title }]. When
 *                  present, current/next are worked out automatically.
 *
 *  ⚠️  Only use streams you own or are authorised to rebroadcast.
 *  The URLs below are PUBLIC TEST STREAMS (Mux, Apple, Akamai, Unified
 *  Streaming, Google samples) so the player can be demonstrated. Replace each
 *  one with the official, licensed stream for that channel.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Public, freely-usable test streams for demonstration only.
const DEMO = {
  akamaiLive: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
  muxBunny: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  appleBipbop:
    'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8',
  tearsOfSteel:
    'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
  mp4Sample: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
}

const newsDay = [
  { start: '06:00', title: 'Shuprobhat Bangladesh' },
  { start: '08:00', title: 'Morning Headlines' },
  { start: '10:00', title: 'Market Watch' },
  { start: '12:00', title: 'Midday News' },
  { start: '14:00', title: 'District Report' },
  { start: '16:00', title: 'Sports Round-up' },
  { start: '18:00', title: 'Evening Bulletin' },
  { start: '20:00', title: 'Prime Time News' },
  { start: '21:00', title: 'Current Affairs' },
  { start: '22:30', title: 'News Update' },
  { start: '23:30', title: 'Late Night Talk' },
  { start: '01:00', title: 'Overnight News Loop' },
]

const channels = [
  {
    id: 'legent-tv',
    name: 'Legent TV',
    nameBn: 'লিজেন্ট টিভি',
    logo: '/logos/legent-tv.svg',
    category: 'Entertainment',
    tags: ['Bangla'],
    description:
      'Our flagship channel — curated drama, music and live studio shows around the clock.',
    streamUrl: DEMO.akamaiLive,
    isLive: true,
    featured: true,
    currentProgram: { title: 'Rater Adda Live', start: '21:00', end: '22:30' },
    nextProgram: { title: 'Golper Shohor', start: '22:30', end: '23:30' },
  },
  {
    id: 'somoy-tv',
    name: 'Somoy TV',
    nameBn: 'সময় টিভি',
    logo: '/logos/somoy-tv.svg',
    category: 'News',
    tags: ['Bangla'],
    description: '24-hour Bangla news with breaking updates, talk shows and field reports.',
    streamUrl: DEMO.muxBunny,
    isLive: true,
    featured: true,
    schedule: newsDay,
  },
  {
    id: 'jamuna-tv',
    name: 'Jamuna TV',
    nameBn: 'যমুনা টিভি',
    logo: '/logos/jamuna-tv.svg',
    category: 'News',
    tags: ['Bangla'],
    description: 'News, investigations and current affairs from across Bangladesh.',
    streamUrl: DEMO.appleBipbop,
    isLive: true,
    featured: true,
    schedule: newsDay.map((s, i) => (i % 3 === 1 ? { ...s, title: 'Jamuna Investigation' } : s)),
  },
  {
    id: 'atn-bangla',
    name: 'ATN Bangla',
    nameBn: 'এটিএন বাংলা',
    logo: '/logos/atn-bangla.svg',
    category: 'Entertainment',
    tags: ['Bangla'],
    description: 'Drama serials, films, music and news for the whole family.',
    streamUrl: DEMO.tearsOfSteel,
    isLive: true,
    currentProgram: { title: 'Prime Time Drama', start: '21:00', end: '22:00' },
    nextProgram: { title: 'ATN Music Hour', start: '22:00', end: '23:00' },
  },
  {
    id: 'channel-i',
    name: 'Channel i',
    nameBn: 'চ্যানেল আই',
    logo: '/logos/channel-i.svg',
    category: 'Entertainment',
    tags: ['Bangla'],
    description: 'Agriculture, culture, talk shows and celebrated Bangla programming.',
    streamUrl: DEMO.muxBunny,
    isLive: true,
    currentProgram: { title: 'Hridoye Mati O Manush', start: '20:30', end: '21:30' },
    nextProgram: { title: 'Tritiyo Matra', start: '21:30', end: '22:30' },
  },
  {
    id: 'ntv',
    name: 'NTV',
    nameBn: 'এনটিভি',
    logo: '/logos/ntv.svg',
    category: 'Entertainment',
    tags: ['Bangla'],
    description: 'Popular drama, reality shows and the evening news bulletin.',
    streamUrl: DEMO.appleBipbop,
    isLive: true,
    currentProgram: { title: 'Evening Drama Serial', start: '21:00', end: '21:45' },
    nextProgram: { title: 'NTV News', start: '22:00', end: '22:30' },
  },
  {
    id: 'rtv',
    name: 'RTV',
    nameBn: 'আরটিভি',
    logo: '/logos/rtv.svg',
    category: 'Entertainment',
    tags: ['Bangla'],
    description: 'Comedy, music specials and weekend blockbusters.',
    streamUrl: DEMO.tearsOfSteel,
    isLive: true,
    currentProgram: { title: 'Weekend Comedy', start: '21:00', end: '22:00' },
    nextProgram: { title: 'Music Station', start: '22:00', end: '23:00' },
  },
  {
    id: 'independent-tv',
    name: 'Independent TV',
    nameBn: 'ইনডিপেনডেন্ট টিভি',
    logo: '/logos/independent-tv.svg',
    category: 'News',
    tags: ['Bangla'],
    description: 'Round-the-clock headlines, business news and political debate.',
    streamUrl: DEMO.akamaiLive,
    isLive: true,
    schedule: newsDay.map((s, i) => (i === 8 ? { ...s, title: 'Ajker Bangladesh' } : s)),
  },
  {
    id: 'ekattor-tv',
    name: 'Ekattor TV',
    nameBn: 'একাত্তর টিভি',
    logo: '/logos/ekattor-tv.svg',
    category: 'News',
    tags: ['Bangla'],
    description: 'News and analysis with nightly talk shows on national issues.',
    streamUrl: DEMO.muxBunny,
    isLive: true,
    schedule: newsDay.map((s, i) => (i === 9 ? { ...s, title: 'Ekattor Journal' } : s)),
  },
  {
    id: 'news24',
    name: 'News24',
    nameBn: 'নিউজ২৪',
    logo: '/logos/news24.svg',
    category: 'News',
    tags: ['Bangla'],
    description: 'Hourly bulletins, live coverage and in-depth special reports.',
    streamUrl: DEMO.appleBipbop,
    isLive: true,
    schedule: newsDay,
  },
  {
    id: 'btv',
    name: 'BTV',
    nameBn: 'বিটিভি',
    logo: '/logos/btv.svg',
    category: 'Entertainment',
    tags: ['Bangla'],
    description: 'The national broadcaster — news, culture, education and classic dramas.',
    streamUrl: DEMO.mp4Sample,
    isLive: true,
    currentProgram: { title: 'Ityadi (Rerun)', start: '20:00', end: '21:30' },
    nextProgram: { title: 'Rater Khobor', start: '22:00', end: '22:30' },
  },
  {
    id: 'gtv',
    name: 'GTV',
    nameBn: 'জিটিভি',
    logo: '/logos/gtv.svg',
    category: 'Sports',
    tags: ['Bangla'],
    description: 'Cricket, football and entertainment programming.',
    streamUrl: '',
    isLive: false,
    currentProgram: { title: 'Off air', start: '00:00', end: '23:59' },
    nextProgram: { title: 'Cricket Pre-match Show', start: '14:00', end: '15:00' },
  },
  {
    id: 't-sports',
    name: 'T Sports',
    nameBn: 'টি স্পোর্টস',
    logo: '/logos/t-sports.svg',
    category: 'Sports',
    tags: ['Bangla'],
    description: 'Live cricket, football, kabaddi and sports talk.',
    streamUrl: DEMO.tearsOfSteel,
    isLive: true,
    featured: true,
    currentProgram: { title: 'Live Cricket: Dhaka vs Sylhet', start: '18:30', end: '22:30' },
    nextProgram: { title: 'Post-match Analysis', start: '22:30', end: '23:15' },
  },
  {
    id: 'world-news',
    name: 'World News Desk',
    logo: '/logos/world-news.svg',
    category: 'News',
    tags: ['International'],
    description: 'International headlines in English from bureaus around the world.',
    streamUrl: DEMO.akamaiLive,
    isLive: true,
    currentProgram: { title: 'Global Briefing', start: '21:00', end: '22:00' },
    nextProgram: { title: 'Asia Tonight', start: '22:00', end: '23:00' },
  },
  {
    id: 'kids-zone',
    name: 'Kids Zone',
    nameBn: 'কিডস জোন',
    logo: '/logos/kids-zone.svg',
    category: 'Kids',
    tags: ['Bangla'],
    description: 'Cartoons, rhymes and learning shows for young viewers.',
    streamUrl: DEMO.muxBunny,
    isLive: true,
    currentProgram: { title: 'Cartoon Carnival', start: '20:00', end: '22:00' },
    nextProgram: { title: 'Bedtime Stories', start: '22:00', end: '22:30' },
  },
  {
    id: 'deen-tv',
    name: 'Deen TV',
    nameBn: 'দ্বীন টিভি',
    logo: '/logos/deen-tv.svg',
    category: 'Religious',
    tags: ['Bangla'],
    description: 'Recitation, lectures and live prayer broadcasts.',
    streamUrl: DEMO.appleBipbop,
    isLive: true,
    currentProgram: { title: 'Quran Tilawat', start: '21:00', end: '22:00' },
    nextProgram: { title: 'Islamic Q&A', start: '22:00', end: '23:00' },
  },
]

export default channels
