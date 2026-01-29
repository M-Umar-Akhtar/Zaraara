import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, LogOut, MapPin, ClipboardList, CheckCircle, Loader2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useApp } from '../context/AppContext';
import { fetchApi } from '../utils/apiClient';

const statusOrder = { PLACED: 1, PACKING: 2, SHIPPED: 3, DELIVERED: 4, CANCELLED: 5 };
const timeline = [
  { key: 'PLACED', label: 'Order Confirmed' },
  { key: 'PACKING', label: 'Order Packed' },
  { key: 'SHIPPED', label: 'Shipped' },
  { key: 'DELIVERED', label: 'Delivered' },
];

export default function ProfilePage() {
  const { user, wishlist, logout } = useApp();
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setOrdersError('');
      setOrdersLoading(false);
      return;
    }

    setOrdersLoading(true);
    setOrdersError('');
    let isMounted = true;

    fetchApi('/me/orders')
      .then((payload) => {
        if (!isMounted) return;
        setOrders(payload.orders ?? []);
      })
      .catch((error) => {
        if (!isMounted) return;
        setOrdersError(error.message);
      })
      .finally(() => {
        if (!isMounted) return;
        setOrdersLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const savedAddresses = useMemo(() => {
    const seen = new Map();
    orders.forEach((order) => {
      const key = `${order.shipLine1}|${order.shipPostal}|${order.shipCountryCode}`;
      if (!seen.has(key)) {
        seen.set(key, {
          id: order.id,
          line1: order.shipLine1,
          line2: order.shipLine2,
          city: order.shipCity,
          state: order.shipState,
          postal: order.shipPostal,
          country: order.shipCountryCode,
        });
      }
    });
    return Array.from(seen.values()).slice(0, 3);
  }, [orders]);

  const formatDate = (value) => new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const formatCurrency = (value) => `Rs. ${value.toLocaleString()}`;

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container py-20 text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">Please log in first</h2>
          <Link
            to="/login"
            className="inline-block px-6 py-2 bg-secondary text-white rounded hover:bg-red-700"
          >
            Go to Login
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container py-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="text-center mb-6 pb-6 border-b">
                <div className="w-16 h-16 mx-auto bg-secondary rounded-full flex items-center justify-center text-white text-xl font-bold mb-3">
                  {user.name.charAt(0)}
                </div>
                <h2 className="text-lg font-bold text-primary">{user.name}</h2>
                <p className="text-gray-600 text-sm">{user.email}</p>
              </div>

              <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full text-left px-4 py-2 rounded transition ${
                      activeTab === 'profile'
                        ? 'bg-secondary text-white'
                        : 'text-primary hover:bg-gray-200'
                    }`}
                  >
                    My Profile
                  </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full text-left px-4 py-2 rounded transition flex items-center gap-2 ${
                    activeTab === 'orders'
                      ? 'bg-secondary text-white'
                      : 'text-primary hover:bg-gray-200'
                  }`}
                >
                  <ClipboardList size={18} />
                  Orders
                </button>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full text-left px-4 py-2 rounded transition flex items-center gap-2 ${
                    activeTab === 'addresses'
                      ? 'bg-secondary text-white'
                      : 'text-primary hover:bg-gray-200'
                  }`}
                >
                  <MapPin size={18} />
                  Addresses
                </button>
                <button
                  onClick={() => setActiveTab('wishlist')}
                  className={`w-full text-left px-4 py-2 rounded transition flex items-center gap-2 ${
                    activeTab === 'wishlist'
                      ? 'bg-secondary text-white'
                      : 'text-primary hover:bg-gray-200'
                  }`}
                >
                  <Heart size={18} />
                  Wishlist ({wishlist.length})
                </button>
                <button
                  onClick={() => {
                    logout();
                    window.location.href = '/';
                  }}
                  className="w-full text-left px-4 py-2 rounded transition text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-gray-50 p-8 rounded-lg">
                <h2 className="text-2xl font-bold text-primary mb-6">My Profile</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={user.name}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">Email</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">Phone</label>
                    <input
                      type="tel"
                      placeholder="+92 300 1234567"
                      className="w-full px-4 py-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">Date of Birth</label>
                    <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded" />
                  </div>
                </div>
                <button className="mt-6 px-6 py-2 bg-secondary text-white rounded hover:bg-red-700 font-semibold">
                  Save Changes
                </button>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-gray-50 p-8 rounded-lg">
                <h2 className="text-2xl font-bold text-primary mb-6">Order History</h2>
                {ordersLoading ? (
                  <div className="text-center py-12 text-gray-500">Loading orders...</div>
                ) : ordersError ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {ordersError}
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order.id} className="bg-white p-4 rounded-lg border shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <p className="font-bold text-primary">Order #{order.orderNumber}</p>
                            <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="text-sm text-gray-500">{order.items.length} items</p>
                            <p className="text-lg font-semibold text-secondary">{formatCurrency(order.total)}</p>
                            <div className="flex items-center justify-end gap-2 text-sm font-semibold">
                              <span className={`text-sm font-semibold ${order.status === 'DELIVERED' ? 'text-green-600' : 'text-blue-600'}`}>
                                {order.status}
                              </span>
                              {order.status === 'SHIPPED' && (
                                <Loader2 className="text-blue-500 animate-spin" size={16} />
                              )}
                              {order.status === 'DELIVERED' && (
                                <CheckCircle className="text-green-500" size={16} />
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 text-sm text-gray-600 space-y-1">
                          <p className="font-semibold text-gray-800">Shipping Address</p>
                          <p>
                            {order.shipLine1}{order.shipLine2 ? `, ${order.shipLine2}` : ''}
                          </p>
                          <p>{`${order.shipCity}${order.shipState ? `, ${order.shipState}` : ''} • ${order.shipCountryCode}`}</p>
                        </div>
                        <div className="mt-6 space-y-2">
                          <p className="text-sm font-semibold text-gray-600">Order Status</p>
                          <div className="grid grid-cols-2 gap-2">
                            {timeline.map((step) => {
                              const stepActive = statusOrder[step.key] <= (statusOrder[order.status] ?? 0);
                              return (
                                <div
                                  key={step.key}
                                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${stepActive ? 'border-secondary bg-secondary/10 text-secondary' : 'border-gray-200 bg-white text-gray-500'}`}
                                >
                                  <p>{step.label}</p>
                                  <p className="text-xs tracking-[0.2em] mt-1">
                                    {stepActive ? '✓' : '•'}
                                  </p>
                                </div>
                              );
                            })}
                          </div>

                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No orders yet</p>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="bg-gray-50 p-8 rounded-lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-primary">Saved Addresses</h2>
                  <button className="px-4 py-2 bg-secondary text-white rounded hover:bg-red-700 font-semibold">
                    Add Address
                  </button>
                </div>
                {savedAddresses.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {savedAddresses.map((address) => (
                      <div key={address.id} className="bg-white p-4 rounded-lg border">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-primary">Shipping Address</h3>
                          <button className="text-gray-400 hover:text-secondary">✕</button>
                        </div>
                        <p className="text-sm text-gray-600">
                          {address.line1}{address.line2 ? `, ${address.line2}` : ''}
                        </p>
                        <p className="text-sm text-gray-600">
                          {address.city}{address.state ? `, ${address.state}` : ''} • {address.postal} • {address.country}
                        </p>
                        <button className="mt-3 text-secondary hover:text-red-700 text-sm font-semibold">
                          Edit
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No saved addresses yet</p>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="bg-gray-50 p-8 rounded-lg">
                <h2 className="text-2xl font-bold text-primary mb-6">My Wishlist ({wishlist.length})</h2>
                {wishlist.length > 0 ? (
                  <div className="grid md:grid-cols-3 gap-4">
                    {wishlist.map(item => (
                      <div key={item.id} className="bg-white rounded-lg overflow-hidden border">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-3">
                          <h3 className="font-bold text-primary text-sm">{item.name}</h3>
                          <p className="text-secondary font-bold text-sm mt-2">
                            Rs. {item.price.toLocaleString()}
                          </p>
                          <button className="w-full mt-3 px-3 py-2 bg-secondary text-white rounded text-sm hover:bg-red-700">
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Your wishlist is empty</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
