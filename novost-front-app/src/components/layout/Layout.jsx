import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './Layout.css';

// Componente contenedor principal que envuelve toda la aplicación con Header y Footer

const Layout = () => {
  return (
    <div className="app-layout">
      <Header />

      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;