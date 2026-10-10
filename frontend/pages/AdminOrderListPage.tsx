import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Order } from '../types';
import { useAppContext } from '../context/AppContext';
import { apiFetch } from '../lib/api';

const AdminOrderListPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { userInfo } = useAppContext(); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userInfo || !userInfo.token) {
        navigate('/login');
        return;
      }
      try {
        setLoading(true);
        const data = await apiFetch<Order[]>('/api/orders', { token: userInfo.token });
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [userInfo, navigate]);

  if (loading) return <div className="p-10 text-center"><Loader2 size={40} className="animate-spin" /></div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Manage Orders ({orders.length})</h1>
      
      {orders.length === 0 ? (
        <div className="text-center text-gray-500 text-xl py-10">
          No orders found.
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivered</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">...{order._id.substring(18)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.customerInfo.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">৳{order.totalPrice}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {order.isDelivered ? (
                      <span className="flex items-center text-green-600">
                        <CheckCircle size={16} className="mr-1" /> Yes
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600">
                        <XCircle size={16} className="mr-1" /> No
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link to={`/admin/order/${order._id}`} className="text-blue-600 hover:text-blue-800">
                      <Eye size={18} className="inline mr-1" /> Details
                    </Link>
                    {/* Delete button ekhane add kora jete pare, kintu details page-e rakha-i bhalo */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrderListPage;