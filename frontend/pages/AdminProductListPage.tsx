import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Plus, Edit, Trash2, Search, PackageOpen } from 'lucide-react';
import { Product } from '../types';
import { useAppContext } from '../context/AppContext';
import { apiFetch } from '../lib/api';
import ConfirmModal from '../components/ConfirmModal';

const AdminProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { userInfo, showToast } = useAppContext();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await apiFetch<Product[]>('/api/products');
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [products, search]);

  const handleDeleteConfirmed = async () => {
    if (!userInfo?.token || !deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/products/${deleteTarget._id}`, {
        method: 'DELETE',
        token: userInfo.token,
      });
      setProducts((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      showToast(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete product', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="p-10 text-center"><Loader2 size={40} className="animate-spin inline-block text-brand-accent" /></div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Manage Products ({filteredProducts.length})</h1>
        <Link
          to="/admin/product/new/edit"
          className="inline-flex items-center justify-center px-4 py-2 bg-brand-dark text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add New Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or category..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-md">
          <PackageOpen className="mx-auto text-gray-300 w-16 h-16 mb-4" />
          <p className="text-gray-500 text-lg">
            {search ? 'No products match your search.' : 'No products yet. Add your first product!'}
          </p>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img src={product.imageUrl} alt={product.name} loading="lazy" className="w-12 h-12 object-cover rounded-md" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">৳{product.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.countInStock === 0
                        ? 'bg-red-100 text-red-700'
                        : product.countInStock < 10
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {product.countInStock === 0 ? 'Out of stock' : product.countInStock}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                    <Link to={`/admin/product/edit/${product._id}`} className="text-blue-600 hover:text-blue-800" aria-label={`Edit ${product.name}`}>
                      <Edit size={18} className="inline" />
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(product)}
                      className="text-red-600 hover:text-red-800"
                      aria-label={`Delete ${product.name}`}
                    >
                      <Trash2 size={18} className="inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete product?"
        message={`"${deleteTarget?.name ?? ''}" will be permanently removed from your store. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminProductListPage;
