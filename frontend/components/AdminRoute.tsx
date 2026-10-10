import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const AdminRoute: React.FC = () => {
  // --- ⛔️ মূল ফিক্স: adminUserInfo এর বদলে userInfo ব্যবহার করা ---
  const { userInfo } = useAppContext();

  // ১. ইউজার কি লগইন করা আছে?
  // ২. ইউজার কি অ্যাডমিন?
  if (userInfo && userInfo.isAdmin) {
    // যদি দুটিই 'হ্যাঁ' হয়, তাহলে তাকে ড্যাশবোর্ড পেজগুলো (<Outlet />) দেখাও
    return <Outlet />;
  } else {
    // যদি না হয়, তাকে অ্যাডমিন লগইন পেজে পাঠাও
    return <Navigate to="/admin/login" replace />;
  }
};

export default AdminRoute;