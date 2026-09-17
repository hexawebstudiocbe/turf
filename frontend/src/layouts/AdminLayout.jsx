import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#070a12] text-slate-100">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Admin View Area */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto max-w-7xl">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
