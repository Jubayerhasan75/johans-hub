import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { Order } from '../types';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { apiFetch } from '../lib/api';

const ProfilePage: React.FC = () => {
  const { userInfo, logoutUser } = useAppContext();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    if (userInfo.isAdmin) {
      navigate('/admin/dashboard');
      return;
    }

    const fetchMyOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<Order[]>('/api/orders/myorders', { token: userInfo.token });
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [userInfo, navigate]);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  if (loading || !userInfo) {
    return <div className="p-10 text-center"><Loader2 size={40} className="animate-spin text-brand-accent" /></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        
        {/* Column 1: Profile Info */}
        <div className="md:col-span-1">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6">Your Profile</h1>
          <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <div className="break-words"> 
              <label className="block text-sm font-medium text-gray-500">Name</label>
              <p className="text-lg font-semibold">{userInfo.name}</p>
            </div>
            <div className="break-words">
              <label className="block text-sm font-medium text-gray-500">Email</label>
              <p className="text-lg font-semibold">{userInfo.email}</p>
            </div>
            <div className="pt-4">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Column 2: Order History */}
        <div className="md:col-span-2">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">Order History</h2>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md space-y-6">
            {loading ? (
              <div className="text-center"><Loader2 size={32} className="animate-spin" /></div>
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : orders.length === 0 ? (
              // ⛔️ Ei message-ti ekhon shudhu order na thaklei dekhabe
              <div className="text-center text-gray-500 py-8">You have not placed any orders yet.</div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <Link key={order._id} to={`/order/${order._id}`} className="block border border-gray-200 rounded-lg p-4 transition-colors hover:bg-gray-50">
                    <div>
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
                        <span className="font-semibold text-gray-800 text-sm sm:text-base">Order ID: ...{order._id.substring(18)}</span>
                        <span className="text-xs sm:text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="mb-2">
                        {order.isDelivered ? (
                          <span className="flex items-center text-green-600 text-sm">
                            <CheckCircle size={16} className="mr-1" /> Delivered
                          </span>
                        ) : (
                          <span className="flex items-center text-yellow-600 text-sm">
                            <XCircle size={16} className="mr-1" /> Pending
                          </span>
                        )}
                      </div>
                      <div className="text-right font-bold mt-2">
                        Total: ৳{order.totalPrice}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;