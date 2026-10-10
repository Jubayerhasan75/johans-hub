import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, BadgeCheck, ArrowRight } from 'lucide-react';
import HeroSlider from '../components/HeroSlider';
import Marquee from '../components/Marquee';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import { fetchProducts } from '../data/products';
import {
  fetchSiteSettings,
  resolveHeroSlides,
  resolveCategoryTiles,
  DEFAULT_HERO_SLIDES,
  DEFAULT_CATEGORY_TILES,
  HeroSlide,
  CategoryTile,
} from '../data/homeContent';
import { Product } from '../types';

const TRUST_BADGES = [
  { icon: Truck, title: 'Fast Delivery', text: 'All over Bangladesh' },
  { icon: ShieldCheck, title: 'Secure Checkout', text: 'Cash on delivery & bKash/Nagad' },
  { icon: BadgeCheck, title: 'Premium Quality', text: '100% export-quality cotton' },
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const sectionReveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: EASE },
} as const;

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Admin-managed banner images (fall back to built-in defaults)
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(DEFAULT_HERO_SLIDES);
  const [categoryTiles, setCategoryTiles] = useState<CategoryTile[]>(DEFAULT_CATEGORY_TILES);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    fetchSiteSettings().then((settings) => {
      setHeroSlides(resolveHeroSlides(settings.heroImages));
      setCategoryTiles(resolveCategoryTiles(settings.categoryImages));
    });
  }, []);

  const featuredProducts = products.slice(0, 8);

  return (
    <div>
      {/* Hero slider with moving images + animated text */}
      <HeroSlider slides={heroSlides} />

      {/* Scrolling announcement marquee */}
      <Marquee />

      {/* Trust badges */}
      <section className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {TRUST_BADGES.map(({ icon: Icon, title, text }, i) => (
            <motion.div
              key={title}
              className="flex items-center gap-4 justify-center sm:justify-start lg:justify-center"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className="p-3 rounded-2xl bg-brand-cream text-brand-accent shrink-0">
                <Icon size={26} />
              </div>
              <div>
                <p className="font-display font-semibold text-gray-900">{title}</p>
                <p className="text-sm text-gray-500">{text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Category tiles */}
      <section className="py-14 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...sectionReveal} className="flex items-end justify-between mb-8 sm:mb-10">
            <div>
              <p className="text-brand-accent font-semibold tracking-[0.2em] uppercase text-xs mb-2">Curated for you</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">Shop by Style</h2>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
            {categoryTiles.map((tile, i) => (
              <motion.div
                key={tile.name}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              >
                <Link
                  to={tile.link}
                  className="group relative block h-72 sm:h-96 rounded-2xl overflow-hidden shadow-soft"
                >
                  <img
                    src={tile.image}
                    alt={tile.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6 sm:p-8 text-white">
                    <h3 className="font-display text-2xl sm:text-3xl font-bold mb-1">{tile.name}</h3>
                    <p className="text-white/75 text-sm sm:text-base mb-3">{tile.tagline}</p>
                    <span className="inline-flex items-center gap-2 text-brand-accent font-semibold text-sm sm:text-base">
                      Shop now
                      <ArrowRight size={18} className="transition-transform group-hover:translate-x-1.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="pb-16 sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...sectionReveal} className="flex items-end justify-between mb-8 sm:mb-10">
            <div>
              <p className="text-brand-accent font-semibold tracking-[0.2em] uppercase text-xs mb-2">Fresh drops</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">Main Collection</h2>
            </div>
            <Link
              to="/collection"
              className="hidden sm:inline-flex items-center gap-2 text-brand-dark font-semibold hover:text-brand-accent transition-colors"
            >
              View all <ArrowRight size={18} />
            </Link>
          </motion.div>

          {error ? (
            <div className="text-center text-red-500 py-10">{error}</div>
          ) : loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center text-gray-500 py-10">No products available yet. Check back soon!</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.map((product, i) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: (i % 4) * 0.07 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-10 sm:mt-14 sm:hidden">
            <Link to="/collection">
              <button className="w-full bg-brand-dark text-white font-semibold py-3.5 px-8 rounded-full hover:bg-brand-ink transition-colors duration-300">
                View All Products
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Brand statement band */}
      <section className="bg-brand-dark text-white py-16 sm:py-24 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <motion.p {...sectionReveal} className="text-brand-accent font-semibold tracking-[0.25em] uppercase text-xs mb-4">
            Johan'S Hub
          </motion.p>
          <motion.h2 {...sectionReveal} className="font-display text-3xl sm:text-5xl font-bold leading-tight mb-6">
            Comfort, simplicity, and class — in every thread.
          </motion.h2>
          <motion.div {...sectionReveal}>
            <Link to="/collection">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="bg-brand-accent text-white font-semibold py-3.5 px-10 rounded-full text-lg hover:bg-brand-accent-dark transition-colors shadow-lift"
              >
                Start Shopping
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
