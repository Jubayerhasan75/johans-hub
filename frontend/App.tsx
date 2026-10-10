import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ToastContainer from './components/ToastContainer';
import HomePage from './pages/HomePage';
import CollectionPage from './pages/CollectionPage';
import ProductDetailPage from './pages/ProductDetailPage';
import FavoritesPage from './pages/FavoritesPage';
import CheckoutPage from './pages/CheckoutPage';
import ThankYouPage from './pages/ThankYouPage';
import { AppProvider } from './context/AppContext';

// Admin Imports
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminRoute from './components/AdminRoute';
import AdminProductListPage from './pages/AdminProductListPage';
import AdminProductEditPage from './pages/AdminProductEditPage';
import AdminOrderListPage from './pages/AdminOrderListPage';
import AdminOrderDetailPage from './pages/AdminOrderDetailPage';
import AdminAppearancePage from './pages/AdminAppearancePage';

// Auth Imports
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';

// Reset scroll position on route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const ComingSoon: React.FC<{ title: string }> = ({ title }) => (
  <div className="p-16 text-center min-h-[40vh] flex flex-col items-center justify-center">
    <h2 className="text-2xl font-bold mb-2">{title}</h2>
    <p className="text-gray-500">This page is coming soon. Stay tuned!</p>
  </div>
);

const NotFound: React.FC = () => (
  <div className="p-16 text-center min-h-[50vh] flex flex-col items-center justify-center">
    <h1 className="text-6xl font-bold text-brand-accent mb-4">404</h1>
    <p className="text-xl text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
    <Link to="/" className="bg-brand-dark text-white font-semibold py-3 px-8 rounded-lg hover:bg-gray-700 transition-colors">
      Back to Home
    </Link>
  </div>
);

function App() {
  return (
    <AppProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen bg-stone-50">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* --- Public User Routes --- */}
              <Route path="/" element={<HomePage />} />
              <Route path="/collection" element={<CollectionPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/thankyou" element={<ThankYouPage />} />
              <Route path="/offers" element={<ComingSoon title="Offers" />} />
              <Route path="/contact" element={<ComingSoon title="Contact" />} />

              {/* --- Auth Routes --- */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/admin/login" element={<LoginPage />} />

              {/* --- Protected User Routes --- */}
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<ProfilePage />} />
                {/* Both users and admins can view an order's details */}
                <Route path="/order/:id" element={<AdminOrderDetailPage />} />
              </Route>

              {/* --- Protected Admin Routes --- */}
              <Route element={<AdminRoute />}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/products" element={<AdminProductListPage />} />
                <Route path="/admin/product/edit/:id" element={<AdminProductEditPage />} />
                <Route path="/admin/product/new/edit" element={<AdminProductEditPage />} />
                <Route path="/admin/orders" element={<AdminOrderListPage />} />
                <Route path="/admin/order/:id" element={<AdminOrderDetailPage />} />
                <Route path="/admin/appearance" element={<AdminAppearancePage />} />
                <Route path="/admin/users" element={<ComingSoon title="Admin Users" />} />
              </Route>

              {/* --- 404 --- */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
