import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const ProtectedRoute: React.FC = () => {
  const { userInfo } = useAppContext();

  // If user is logged in, allow access to nested routes via <Outlet />
  // Otherwise, redirect them to the login page
  return userInfo ? <Outlet /> : <Navigate to="/login" replace />;
};

// --- ⛔️ Make sure this line exists! ---
export default ProtectedRoute;