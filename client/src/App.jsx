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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("STYLORA ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '80px 20px', textAlign: 'center', backgroundColor: '#ffffff', color: '#111', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px', color: '#000' }}>STYLEORA Store</h2>
          <p style={{ fontSize: '14px', color: '#666666', marginBottom: '24px', maxWidth: '400px', lineHeight: '1.6' }}>Updating application state and clearing cached assets. Please click below to refresh the site.</p>
          <button 
            onClick={() => { localStorage.clear(); window.location.href = '/'; }}
            style={{ padding: '12px 28px', backgroundColor: '#000000', color: '#ffffff', border: 'none', borderRadius: '4px', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
          >
            Reset Cache & Load Store
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

import { useLocation } from 'react-router-dom';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="app-container">
      {!isAdminRoute && <Header toggleSidebar={() => setSidebarOpen(true)} />}
    
      {!isAdminRoute && (
        <SidebarDrawer 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
      )}
      
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

      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <MobileBottomNav />}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ToastProvider>
          <AuthProvider>
            <SettingsProvider>
              <CartProvider>
                <WishlistProvider>
                  <AppContent />
                </WishlistProvider>
              </CartProvider>
            </SettingsProvider>
          </AuthProvider>
        </ToastProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
