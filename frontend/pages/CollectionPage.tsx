import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import { fetchProducts as fetchProductsApi } from '../data/products';
import { ArrowLeft, ArrowRight, SlidersHorizontal, X } from 'lucide-react';

// Category list
const CATEGORIES = ['All', 'Over Sized', 'Slim Fit'];

// Pagination settings
const PRODUCTS_PER_PAGE = 20;

const CollectionPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states (category can arrive via /collection?category=...)
  const urlCategory = searchParams.get('category');
  const [selectedCategory, setSelectedCategory] = useState(
    urlCategory && CATEGORIES.includes(urlCategory) ? urlCategory : 'All'
  );
  const [selectedColor, setSelectedColor] = useState('All');
  const [priceRange, setPriceRange] = useState(2000);
  const [sortBy, setSortBy] = useState('Recommended');

  // Pagination + mobile filter drawer
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Keep category in sync when navigating between tiles on the homepage
  useEffect(() => {
    if (urlCategory && CATEGORIES.includes(urlCategory)) {
      setSelectedCategory(urlCategory);
      setCurrentPage(1);
    }
  }, [urlCategory]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProductsApi();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Unique colors across all products
  const allColors = useMemo(() => {
    const colors = new Set<string>();
    products.forEach((product) => {
      product.colors?.forEach((color) => colors.add(color));
    });
    return ['All', ...Array.from(colors)];
  }, [products]);

  // Filter logic
  const filteredProducts = products
    .filter(
      (product) =>
        selectedCategory === 'All' ||
        (product.category && product.category.toLowerCase() === selectedCategory.toLowerCase())
    )
    .filter(
      (product) => selectedColor === 'All' || (product.colors && product.colors.includes(selectedColor))
    )
    .filter((product) => product.price <= priceRange);

  // Sort logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'Price: Low to High') return a.price - b.price;
    if (sortBy === 'Price: High to Low') return b.price - a.price;
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const productsForCurrentPage = sortedProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const activeFilterCount =
    (selectedCategory !== 'All' ? 1 : 0) + (selectedColor !== 'All' ? 1 : 0) + (priceRange < 2000 ? 1 : 0);

  // Rendered twice (mobile drawer + desktop sidebar), so ids/names get a
  // prefix to stay unique in the DOM.
  const filterPanel = (prefix: string) => (
    <>
      {/* Category Filter */}
      <div className="mb-6">
        <h3 className="font-display text-lg font-semibold mb-3">Category</h3>
        <div className="space-y-2">
          {CATEGORIES.map((category) => (
            <div key={category} className="flex items-center">
              <input
                type="radio"
                id={`${prefix}-${category}`}
                name={`${prefix}-category`}
                value={category}
                checked={selectedCategory === category}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-4 w-4 accent-brand-accent border-gray-300"
              />
              <label htmlFor={`${prefix}-${category}`} className="ml-3 text-md text-gray-700 cursor-pointer">
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Color Filter */}
      <div className="mb-6">
        <h3 className="font-display text-lg font-semibold mb-3">Color</h3>
        <select
          value={selectedColor}
          onChange={(e) => {
            setSelectedColor(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none bg-white"
        >
          {allColors.map((color) => (
            <option key={color} value={color}>{color}</option>
          ))}
        </select>
      </div>

      {/* Price Range Filter */}
      <div className="mb-6">
        <h3 className="font-display text-lg font-semibold mb-3">Price Range</h3>
        <input
          type="range"
          min="300"
          max="2000"
          step="50"
          value={priceRange}
          onChange={(e) => {
            setPriceRange(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-accent"
        />
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>৳300</span>
          <span className="font-semibold text-brand-dark">৳{priceRange}</span>
        </div>
      </div>

      {/* Sort By */}
      <div>
        <h3 className="font-display text-lg font-semibold mb-3">Sort by</h3>
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none bg-white"
        >
          <option>Recommended</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
        </select>
      </div>
    </>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }
  if (error) return <div className="p-20 text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      {/* Page header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
          {selectedCategory === 'All' ? 'The Collection' : selectedCategory}
        </h1>
        <p className="text-gray-500 mt-1">{sortedProducts.length} products</p>
      </div>

      {/* Mobile filter toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="lg:hidden mb-5 inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-full shadow-soft text-sm font-medium text-gray-800 active:scale-95 transition-transform"
      >
        {showFilters ? <X size={17} /> : <SlidersHorizontal size={17} />}
        {showFilters ? 'Hide Filters' : 'Filters & Sort'}
        {activeFilterCount > 0 && (
          <span className="bg-brand-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        {/* Mobile: collapsible panel / Desktop: sticky sidebar */}
        <AnimatePresence initial={false}>
          {showFilters && (
            <motion.aside
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="lg:hidden overflow-hidden"
            >
              <div className="bg-white p-6 rounded-2xl shadow-soft mb-2">{filterPanel('m')}</div>
            </motion.aside>
          )}
        </AnimatePresence>

        <aside className="hidden lg:block lg:col-span-1 bg-white p-6 rounded-2xl shadow-soft h-fit sticky top-32">
          <h2 className="font-display text-2xl font-bold mb-6">Filters</h2>
          {filterPanel('d')}
        </aside>

        {/* Product Grid */}
        <main className="lg:col-span-3">
          {productsForCurrentPage.length > 0 ? (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
                {productsForCurrentPage.map((product, i) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: (i % 4) * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-12">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                    className="px-4 py-2 bg-white border border-gray-300 rounded-full shadow-soft text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <ArrowLeft size={20} />
                  </button>

                  <span className="text-md font-medium text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                    className="px-4 py-2 bg-white border border-gray-300 rounded-full shadow-soft text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <ArrowRight size={20} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 text-xl py-20 bg-white rounded-2xl shadow-soft">
              No products match your criteria.
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CollectionPage;
