/**
 * Category filters shown across the site. `match` decides which channels
 * belong — a channel matches when its `category` OR one of its `tags`
 * equals the category name.
 */
export const categories = [
  { slug: 'all', name: 'All', bn: 'সব', icon: 'grid' },
  { slug: 'news', name: 'News', bn: 'সংবাদ', icon: 'news' },
  { slug: 'sports', name: 'Sports', bn: 'খেলা', icon: 'trophy' },
  { slug: 'entertainment', name: 'Entertainment', bn: 'বিনোদন', icon: 'sparkles' },
  { slug: 'bangla', name: 'Bangla', bn: 'বাংলা', icon: 'flag' },
  { slug: 'international', name: 'International', bn: 'আন্তর্জাতিক', icon: 'globe' },
  { slug: 'kids', name: 'Kids', bn: 'শিশু', icon: 'smile' },
  { slug: 'religious', name: 'Religious', bn: 'ধর্মীয়', icon: 'moon' },
]

export const getCategory = (slug) => categories.find((c) => c.slug === slug)
