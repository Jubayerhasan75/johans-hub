
import React from 'react';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { HeartCrack } from 'lucide-react';

const FavoritesPage: React.FC = () => {
  const { favorites } = useAppContext();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh]">
      <h1 className="text-3xl font-bold text-center mb-10">Your Favorites</h1>
      {favorites.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {favorites.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <HeartCrack className="mx-auto text-gray-300 w-20 h-20 mb-4" />
          <p className="text-xl text-gray-500 mb-4">You haven't added any favorites yet.</p>
          <Link to="/collection">
             <button className="bg-brand-accent text-white font-semibold py-3 px-8 rounded-lg hover:bg-brand-accent-dark transition-colors duration-300">
                Start Exploring
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
