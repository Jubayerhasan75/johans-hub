import React from 'react';

const ProductCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden">
    <div className="w-full h-96 bg-gray-200 animate-pulse" />
    <div className="p-4 space-y-3">
      <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
      <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4" />
    </div>
  </div>
);

export default ProductCardSkeleton;
