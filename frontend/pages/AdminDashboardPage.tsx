import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Package, Users, Banknote, Clock, Image as ImageIcon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { apiFetch } from '../lib/api';
import { Order, Product } from '../types';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalProducts: number;
}

const AdminDashboardPage: React.FC = () => {
  const { userInfo, logoutUser } = useAppContext();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    if (!userInfo?.token) return;
    const loadStats = async () => {
      try {
        const [orders, products] = await Promise.all([
          apiFetch<Order[]>('/api/orders', { token: userInfo.token }),
          apiFetch<Product[]>('/api/products'),
        ]);
        setStats({
          totalOrders: orders.length,
          pendingOrders: orders.filter((o) => !o.isDelivered).length,
          totalRevenue: orders.filter((o) => o.isPaid).reduce((sum, o) => sum + o.totalPrice, 0),
          totalProducts: products.length,
        });
      } catch (err) {
        setStatsError(err instanceof Error ? err.message : 'Failed to load stats');
      }
    };
    loadStats();
  }, [userInfo]);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const statCards = stats
    ? [
        { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-500 bg-blue-50' },
        { label: 'Pending Delivery', value: stats.pendingOrders, icon: Clock, color: 'text-amber-500 bg-amber-50' },
        { label: 'Revenue (Paid)', value: `৳${stats.totalRevenue.toLocaleString()}`, icon: Banknote, color: 'text-emerald-500 bg-emerald-50' },
        { label: 'Products', value: stats.totalProducts, icon: Package, color: 'text-purple-500 bg-purple-50' },
      ]
    : [];

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          {userInfo && (
            <p className="text-gray-500 mt-1">
              Welcome back, <span className="font-semibold text-gray-700">{userInfo.name}</span>
            </p>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Summary cards */}
      {statsError ? (
        <div className="text-red-500 bg-red-50 p-4 rounded-lg mb-8">{statsError}</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats
            ? statCards.map(({ label, value, icon: Icon, color }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.07 }}
                  className="bg-white rounded-xl shadow-md p-5 flex items-center gap-4"
                >
                  <div className={`p-3 rounded-full ${color}`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                  </div>
                </motion.div>
              ))
            : Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-5 h-[92px] animate-pulse" />
              ))}
        </div>
      )}

      {/* Navigation cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <NavLink
          to="/admin/products"
          className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          <Package size={48} className="text-brand-accent mb-4" />
          <h2 className="text-2xl font-semibold">Manage Products</h2>
          <p className="text-gray-600">View, create, edit, and delete products</p>
        </NavLink>

        <NavLink
          to="/admin/orders"
          className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          <ShoppingBag size={48} className="text-blue-500 mb-4" />
          <h2 className="text-2xl font-semibold">Manage Orders</h2>
          <p className="text-gray-600">View and process customer orders</p>
        </NavLink>

        <NavLink
          to="/admin/appearance"
          className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          <ImageIcon size={48} className="text-rose-500 mb-4" />
          <h2 className="text-2xl font-semibold">Homepage Images</h2>
          <p className="text-gray-600">Change the hero & category banner photos</p>
        </NavLink>

        <NavLink
          to="/admin/users"
          className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          <Users size={48} className="text-green-500 mb-4" />
          <h2 className="text-2xl font-semibold">Manage Users</h2>
          <p className="text-gray-600">View and manage users</p>
        </NavLink>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
