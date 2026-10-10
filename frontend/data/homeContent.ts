import homeImg from '../assets/home.png';
import { apiFetch } from '../lib/api';

export interface HeroSlide {
  image: string;
  kicker: string;
  title: string;
  subtitle: string;
  cta: string;
  link: string;
}

export interface CategoryTile {
  name: string;
  tagline: string;
  image: string;
  link: string;
}

// Built-in defaults. The admin "Appearance" page can override only the
// `image` of each slide/tile; everything else stays as designed here.
export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    image: homeImg,
    kicker: 'New Season • New Drops',
    title: 'Up to 70% OFF on Premium T-Shirts',
    subtitle: 'Export-quality cotton, starting from ৳300 only.',
    cta: 'Shop Now',
    link: '/collection',
  },
  {
    image: '/images/cream.jpg',
    kicker: 'The Oversized Edit',
    title: 'Relaxed Fits. Sharp Looks.',
    subtitle: 'Streetwear-ready oversized tees built for comfort.',
    cta: 'Explore Oversized',
    link: '/collection?category=Over%20Sized',
  },
  {
    image: '/images/jetblack.jpg',
    kicker: 'The Slim Fit Edit',
    title: 'Tailored Close. Worn Anywhere.',
    subtitle: 'Clean slim-fit silhouettes for everyday wear.',
    cta: 'Explore Slim Fit',
    link: '/collection?category=Slim%20Fit',
  },
];

export const DEFAULT_CATEGORY_TILES: CategoryTile[] = [
  {
    name: 'Over Sized',
    tagline: 'Relaxed, street-ready fits',
    image: '/images/cream.jpg',
    link: '/collection?category=Over%20Sized',
  },
  {
    name: 'Slim Fit',
    tagline: 'Clean, tailored silhouettes',
    image: '/images/jetblack.jpg',
    link: '/collection?category=Slim%20Fit',
  },
];

export interface SiteSettings {
  heroImages: string[];
  categoryImages: string[];
}

/** Reads admin-managed banner images. Returns empty arrays on failure. */
export const fetchSiteSettings = async (): Promise<SiteSettings> => {
  try {
    return await apiFetch<SiteSettings>('/api/settings');
  } catch {
    return { heroImages: [], categoryImages: [] };
  }
};

// Merge: an override image (non-empty string) wins, otherwise keep the default.
export const resolveHeroSlides = (overrides: string[] = []): HeroSlide[] =>
  DEFAULT_HERO_SLIDES.map((slide, i) => ({
    ...slide,
    image: overrides[i] && overrides[i].trim() ? overrides[i] : slide.image,
  }));

export const resolveCategoryTiles = (overrides: string[] = []): CategoryTile[] =>
  DEFAULT_CATEGORY_TILES.map((tile, i) => ({
    ...tile,
    image: overrides[i] && overrides[i].trim() ? overrides[i] : tile.image,
  }));
