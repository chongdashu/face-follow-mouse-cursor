/**
 * Curated list of example portrait images for the upload component
 * Includes local image and open-source portraits from Unsplash
 */

export interface ExamplePortrait {
  /** Display name for the portrait */
  name: string
  /** Image URL (local path or external URL) */
  url: string
  /** Pre-computed stable hash for consistent caching across browsers */
  stableHash: string
  /** Photographer/attribution name */
  photographer?: string
  /** Source platform */
  source: 'local' | 'unsplash' | 'pexels'
  /** License information */
  license: string
  /** Link to original source (optional) */
  sourceUrl?: string
}

/**
 * List of example portraits available for quick selection
 * All images are free to use and allow hotlinking
 */
export const EXAMPLE_PORTRAITS: ExamplePortrait[] = [
  {
    name: 'AI Oriented Profile',
    url: '/aioriented-profile.png',
    stableHash: '1f2e38fad93937b5e4c0738bea2bf8e3bfee38a1d79795380fa439bde2520d1b',
    source: 'local',
    license: 'Local image'
  },
  {
    name: 'Portrait by Joseph Gonzalez',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80&fit=crop&ar=1:1',
    stableHash: '53133f4bd1b13578379cc40a7999b285adae6ae6b155495ccd33c4f0efdca7e1',
    photographer: 'Joseph Gonzalez',
    source: 'unsplash',
    license: 'Unsplash License (free to use)',
    sourceUrl: 'https://unsplash.com/photos/iFgRcqHznqg'
  },
  {
    name: 'Portrait by Lianhao Qu',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80&fit=crop&ar=1:1',
    stableHash: '583425892cdb27c0b87cc45a85ef18d3e3618d3db3bdac5bfb0f395919af3bc4',
    photographer: 'Lianhao Qu',
    source: 'unsplash',
    license: 'Unsplash License (free to use)',
    sourceUrl: 'https://unsplash.com/photos/dSh4HD3fXbs'
  },
  {
    name: 'Portrait by Matheus Ferrero',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80&fit=crop&ar=1:1',
    stableHash: 'c612ab4c505dd2481158b7776d71fdc6612d9a8f16c988d14d869e55f5ad0ca2',
    photographer: 'Matheus Ferrero',
    source: 'unsplash',
    license: 'Unsplash License (free to use)',
    sourceUrl: 'https://unsplash.com/photos/uJ8LNVCBjFQ'
  }
]

