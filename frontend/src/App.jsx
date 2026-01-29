import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate,useLocation  } from  'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';

//Chatbot
import Chatbot from './components/Chatbot';

// Pages
import CountrySelectorPage from './pages/CountrySelectorPage';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import WishlistPage from './pages/WishlistPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminRegisterPage from './pages/admin/AdminRegisterPage';
import AdminSettings from './pages/admin/AdminSettings';

function ChatbotWrapper() {
  const location = useLocation();
  const hiddenPaths = [
    '/',
    '/login',
    '/signup',
    '/admin/login',
    '/admin/register',
  ];

  // Hide chatbot on login/signup/admin auth pages
  if (hiddenPaths.includes(location.pathname)) return null;

  return <Chatbot />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <Router>
          <ChatbotWrapper />
          <Routes>
            {/* Global Chatbot */}
            
            {/* Entry Point */}
            <Route path="/" element={<CountrySelectorPage />} />

            {/* Main Pages */}
            <Route path="/home" element={<HomePage />} />
            <Route path="/category/*" element={<CategoryPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />

            {/* Shopping */}
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />

            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* User */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/wishlist" element={<WishlistPage />} />

            {/* Admin Portal */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/register" element={<AdminRegisterPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}
