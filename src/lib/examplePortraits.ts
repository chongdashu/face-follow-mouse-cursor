/**
 * Curated list of example portrait images for the upload component
 * Includes local image and open-source portraits from Unsplash
 */

export interface ExamplePortrait {
  /** Display name for the portrait */
  name: string
  /** Image URL (local path or external URL) */
  url: string
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
    source: 'local',
    license: 'Local image'
  },
  {
    name: 'Portrait by Joseph Gonzalez',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80&fit=crop',
    photographer: 'Joseph Gonzalez',
    source: 'unsplash',
    license: 'Unsplash License (free to use)',
    sourceUrl: 'https://unsplash.com/photos/iFgRcqHznqg'
  },
  {
    name: 'Portrait by Lianhao Qu',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80&fit=crop',
    photographer: 'Lianhao Qu',
    source: 'unsplash',
    license: 'Unsplash License (free to use)',
    sourceUrl: 'https://unsplash.com/photos/dSh4HD3fXbs'
  },
  {
    name: 'Portrait by Matheus Ferrero',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80&fit=crop',
    photographer: 'Matheus Ferrero',
    source: 'unsplash',
    license: 'Unsplash License (free to use)',
    sourceUrl: 'https://unsplash.com/photos/uJ8LNVCBjFQ'
  }
]

