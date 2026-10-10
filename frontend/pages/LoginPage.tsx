import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { apiFetch } from '../lib/api';
import { UserInfo } from '../types';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo, loginUser } = useAppContext();

  // --- ⛔️ Redirect Logic (লুপ এড়ানোর জন্য) ---
  useEffect(() => {
    // যদি userInfo লোড হয় এবং ইউজার লগইন করা থাকে
    if (userInfo) {
      // Honor ?redirect=... (e.g. /checkout) before role-based defaults
      const redirectParam = new URLSearchParams(location.search).get('redirect');
      if (redirectParam && !userInfo.isAdmin) {
        navigate(redirectParam, { replace: true });
      } else if (userInfo.isAdmin) {
        // অ্যাডমিন হলে ড্যাশবোর্ডে পাঠাও
        navigate('/admin/dashboard', { replace: true });
      } else {
        // সাধারণ ইউজার হলে হোমপেজে পাঠাও
        navigate('/', { replace: true });
      }
    }
    // যদি userInfo null হয় (লগআউট), তাহলে এই পেজেই থাকো, কিছু করো না।
  }, [userInfo, navigate, location.search]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<UserInfo>('/api/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // --- ⛔️ শুধু loginUser কল করা হবে ---
      // স্টেট আপডেট করো। useEffect নিজে থেকেই রিডাইরেক্ট করবে।
      loginUser(data);
      setLoading(false);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const isAdminLoginPath = location.pathname === '/admin/login';

  // যদি ইউজার লগইন করা থাকে, রিডাইরেক্ট হওয়ার আগ পর্যন্ত লোডার দেখাও
  if (userInfo) {
      return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="animate-spin h-8 w-8 text-brand-accent"/></div>;
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
             {isAdminLoginPath ? 'Admin Sign In' : 'Sign in to your account'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
           {error && <div className="text-red-600 bg-red-100 p-3 rounded-md">{error}</div>}
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-brand-accent focus:border-brand-accent focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password"className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-brand-accent focus:border-brand-accent focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>
          <div className="h-6"> {/* খালি জায়গা ताकि register লিঙ্ক না থাকলে ফর্ম না লাফায় */}
            {!isAdminLoginPath && (
              <div className="text-sm text-center">
                  <Link to="/register" className="font-medium text-brand-accent hover:text-brand-accent-dark">
                  Don't have an account? Register
                  </Link>
              </div>
            )}
           </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-dark hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;