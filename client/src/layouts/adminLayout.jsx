import React from 'react';
import Header from '../components/Header/header';
import Footer from '../components/Footer/footer';
import AdminSidebar from '../pages/admin/adminSidebar';

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <Header />
      <div className="admin-body">
        <AdminSidebar />
        <main className="admin-main">{children}</main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLayout;
