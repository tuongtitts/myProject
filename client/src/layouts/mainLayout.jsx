
import React from 'react';
import Header from '../components/Header/header';
import Footer from '../components/Footer/footer';

function MainLayout({ children }) {
  return (
    <div className="app">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

export default MainLayout;
