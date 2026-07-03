import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider } from './context/ToastContext';

import Header from './components/Header';
import Footer from './components/Footer';
import SidebarDrawer from './components/SidebarDrawer';
import ProtectedRoute from './components/ProtectedRoute';
import MobileBottomNav from './components/MobileBottomNav';

import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Shop from './pages/Shop';
import Accessories from './pages/Accessories';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Account from './pages/Account';
import LoginRegister from './pages/LoginRegister';
import ForgotPassword from './pages/ForgotPassword';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminAddProduct from './pages/AdminAddProduct';
import AdminEditProduct from './pages/AdminEditProduct';
import AdminRoute from './components/AdminRoute';
import PolicyPage from './pages/PolicyPage';

import './index.css'; // global style.css style sheets

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <SettingsProvider>
            <CartProvider>
              <WishlistProvider>
                <div className="app-container">
                  <Header toggleSidebar={() => setSidebarOpen(true)} />
                
                <SidebarDrawer 
                  isOpen={sidebarOpen} 
                  onClose={() => setSidebarOpen(false)} 
                />
                
                <main style={{ minHeight: '80vh' }}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/accessories" element={<Accessories />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/policies/:policyType" element={<PolicyPage />} />
                    
                    {/* Protected Account View Dashboard */}
                    <Route path="/account" element={
                      <ProtectedRoute>
                        <Account />
                      </ProtectedRoute>
                    } />
                    
                    {/* Auth Credentials Pages */}
                    <Route path="/login" element={<LoginRegister />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />

                    {/* Admin Workspace Suite */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin/dashboard" element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    } />
                    <Route path="/admin/products/add" element={
                      <AdminRoute>
                        <AdminAddProduct />
                      </AdminRoute>
                    } />
                    <Route path="/admin/products/edit/:id" element={
                      <AdminRoute>
                        <AdminEditProduct />
                      </AdminRoute>
                    } />
                  </Routes>
                </main>

                <Footer />
                <MobileBottomNav />
              </div>
            </WishlistProvider>
          </CartProvider>
        </SettingsProvider>
      </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
