import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { MainLayout } from './layouts/MainLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Pages
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetails } from './pages/ProductDetails'; // Importar nueva página
import { FortniteShop } from './pages/FortniteShop';
import { Checkout } from './pages/Checkout';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { PaymentFailure } from './pages/PaymentFailure';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Profile } from './pages/Profile';
import { Dashboard } from './pages/admin/Dashboard';
import { Products } from './pages/admin/Products';
import { Orders } from './pages/admin/Orders';
import { Users } from './pages/admin/Users';
import { Settings } from './pages/admin/Settings';
import { ProductForm } from './pages/admin/ProductForm';
import { FeaturedOrder } from './pages/admin/FeaturedOrder';
import { Coupons } from './pages/admin/Coupons';
import { DigitalKeys } from './pages/admin/DigitalKeys';
import { HeroSlides } from './pages/admin/HeroSlides';
import { Currencies } from './pages/admin/Currencies';
import { FortnitePrices } from './pages/admin/FortnitePrices';
import { EmailAccounts } from './pages/admin/EmailAccounts';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <CartProvider>
          <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="product/:id" element={<ProductDetails />} /> {/* Nueva Ruta */}
            <Route path="fortnite" element={<FortniteShop />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="payment/success" element={<PaymentSuccess />} />
            <Route path="payment/failure" element={<PaymentFailure />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Rutas de Auth (sin MainLayout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Rutas Admin (Protegidas) */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id/edit" element={<ProductForm />} />
            <Route path="products/featured-order" element={<FeaturedOrder />} />
            <Route path="orders" element={<Orders />} />
            <Route path="users" element={<Users />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="digital-keys" element={<DigitalKeys />} />
            <Route path="hero-slides" element={<HeroSlides />} />
            <Route path="currencies" element={<Currencies />} />
            <Route path="fortnite-prices" element={<FortnitePrices />} />
            <Route path="email-accounts" element={<EmailAccounts />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </BrowserRouter>
        </CartProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;
