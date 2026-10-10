
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { PartyPopper } from 'lucide-react';

const ThankYouPage: React.FC = () => {
  const location = useLocation();
  // The real MongoDB order ID passed from the checkout page
  const orderId: string | null = location.state?.orderId ?? null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 flex items-center justify-center min-h-[60vh]">
      <div className="bg-white p-10 rounded-lg shadow-xl text-center max-w-lg">
        <PartyPopper className="mx-auto text-brand-accent w-16 h-16 mb-6"/>
        <h1 className="text-2xl font-bold mb-2">Thank you for your purchase!</h1>
        <p className="text-lg text-gray-600 mb-6">May Allah bless you.</p>
        {orderId && (
          <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Your Order ID is:</p>
              <p className="text-xl font-mono font-semibold text-brand-dark tracking-wider break-all">{orderId}</p>
              <Link to={`/order/${orderId}`} className="inline-block mt-2 text-sm font-medium text-brand-accent hover:text-brand-accent-dark">
                View order details →
              </Link>
          </div>
        )}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/" className="w-full sm:w-auto bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors">
                Return to Home
            </Link>
            <Link to="/collection" className="w-full sm:w-auto bg-brand-dark text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors">
                Continue Shopping
            </Link>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
