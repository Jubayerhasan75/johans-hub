import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Product } from '../types';
import { Loader2, Heart, ShoppingBag } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { fetchProductById } from '../data/products';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, isFavorite, addToFavorites, removeFromFavorites, showToast } = useAppContext();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  
  const favorite = product ? isFavorite(product._id) : false;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await fetchProductById(id);
        setProduct(data);
        if (data.sizes && data.sizes.length > 0) setSelectedSize(data.sizes[0]);
        if (data.colors && data.colors.length > 0) setSelectedColor(data.colors[0]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);
  
  const validateSelection = (): boolean => {
    if (product) {
      if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        showToast('Please select a size.', 'error');
        return false;
      }
      if (product.colors && product.colors.length > 0 && !selectedColor) {
        showToast('Please select a color.', 'error');
        return false;
      }
    }
    return true;
  };

  const handleAddToCart = () => {
    if (product && validateSelection()) {
      const size = (product.sizes && product.sizes.length > 0) ? selectedSize : 'One Size';
      const color = (product.colors && product.colors.length > 0) ? selectedColor : 'Default';
      addToCart(product, size, color);
      showToast(`${product.name} added to cart!`);
    }
  };

  const handleOrderNow = () => {
    if (product && validateSelection()) {
      const size = (product.sizes && product.sizes.length > 0) ? selectedSize : 'One Size';
      const color = (product.colors && product.colors.length > 0) ? selectedColor : 'Default';
      addToCart(product, size, color);
      navigate('/checkout');
    }
  };

  const handleFavoriteToggle = () => {
    if (product) {
      if (favorite) {
        removeFromFavorites(product._id);
      } else {
        addToFavorites(product);
      }
    }
  };

  // --- ⛔️ Shothik "0 Price" Bug Fix (Notun Logic) ---
  const showDiscount = product && product.originalPrice && product.originalPrice > product.price;

  if (loading) return <div className="p-20 text-center"><Loader2 size={48} className="animate-spin text-brand-accent" /></div>;
  if (error) return <div className="p-20 text-center text-red-500">{error}</div>;
  if (!product) return <div className="p-20 text-center text-gray-500">Product not found.</div>;

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-start">
        {/* Image: sticky only on md+ so mobile scrolls naturally */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45 }}
          className="bg-white p-3 sm:p-4 rounded-2xl shadow-soft md:sticky md:top-32 overflow-hidden"
        >
          <img src={product.imageUrl} alt={product.name} className="w-full h-auto object-cover rounded-xl" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="space-y-5 sm:space-y-6"
        >
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">{product.name}</h1>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold text-brand-dark">৳{product.price}</p>
              
              {/* Notun Logic Use */}
              {showDiscount && (
                <p className="text-2xl text-gray-400 line-through">৳{product.originalPrice}</p>
              )}
            </div>
            {/* Notun Logic Use */}
            {showDiscount && (
              <span className="text-sm font-semibold bg-red-100 text-red-600 px-3 py-1 rounded-full">
                {Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}% OFF
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4 text-gray-600">
            <span className={product.countInStock > 0 ? 'text-green-600' : 'text-red-600'}>
              {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <p className="text-gray-700 leading-relaxed">{product.description}</p>

          {/* Size Options */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <label className="block text-md font-medium text-gray-700 mb-2">Size</label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-md border text-sm
                                ${selectedSize === size 
                                  ? 'bg-brand-dark text-white border-brand-dark' 
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Options */}
          {product.colors && product.colors.length > 0 && (
             <div>
              <label className="block text-md font-medium text-gray-700 mb-2">Color</label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-md border text-sm
                                ${selectedColor === color 
                                  ? 'bg-brand-dark text-white border-brand-dark' 
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
            <button
              onClick={handleAddToCart}
              disabled={product.countInStock === 0}
              className="flex-1 px-6 py-3.5 bg-white text-gray-800 border border-gray-300 font-semibold rounded-full shadow-soft hover:border-brand-accent hover:text-brand-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              Add to Cart
            </button>
            <button
              onClick={handleOrderNow}
              disabled={product.countInStock === 0}
              className="flex-1 px-6 py-3.5 bg-brand-dark text-white font-semibold rounded-full shadow-lift hover:bg-brand-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <ShoppingBag size={20} />
              Order Now
            </button>
            <button
              onClick={handleFavoriteToggle}
              aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
              className={`px-5 py-3.5 border rounded-full shadow-soft transition-all active:scale-95 flex items-center justify-center
                          ${favorite ? 'text-red-500 bg-red-50 border-red-200' : 'text-gray-600 bg-white border-gray-300 hover:bg-gray-50'}`}
            >
              <Heart size={22} fill={favorite ? 'currentColor' : 'none'} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetailPage;