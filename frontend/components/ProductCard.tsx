import React from 'react';
import { Product } from '../types';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isFavorite, addToFavorites, removeFromFavorites } = useAppContext();
  const favorite = isFavorite(product._id);

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (favorite) {
      removeFromFavorites(product._id);
    } else {
      addToFavorites(product);
    }
  };

  // "0 Price" Bug Fix Logic
  const showDiscount = product.originalPrice && product.originalPrice > product.price;

  const outOfStock = product.countInStock === 0;

  return (
    <div className="bg-white rounded-2xl shadow-soft overflow-hidden transition-shadow duration-300 hover:shadow-lift group">
      <Link to={`/product/${product._id}`} className="block">

        <div className="relative overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="w-full h-56 sm:h-72 md:h-80 lg:h-96 object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          <button
            onClick={handleFavoriteToggle}
            aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md text-gray-500 hover:text-red-500 transition-all hover:scale-110 active:scale-95"
          >
            <Heart size={20} fill={favorite ? 'currentColor' : 'none'} className={favorite ? 'text-red-500' : ''} />
          </button>

          {showDiscount && !outOfStock && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-md">
              SALE
            </div>
          )}
          {outOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white/95 text-gray-800 text-sm font-semibold px-4 py-1.5 rounded-full">
                Out of Stock
              </span>
            </div>
          )}
        </div>
        
        <div className="p-3.5 sm:p-4">
          <h3 className="font-display text-base sm:text-lg font-semibold text-gray-800 truncate group-hover:text-brand-accent transition-colors">{product.name}</h3>
          <p className="text-xs sm:text-sm text-gray-500 mb-2">{product.category}</p>

          <div className="flex items-baseline space-x-2">
            <p className="text-lg sm:text-xl font-bold text-brand-dark">৳{product.price}</p>

            {showDiscount && (
              <p className="text-sm sm:text-md text-gray-400 line-through">৳{product.originalPrice}</p>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;