import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useApp } from '../context/AppContext';
import fetchApi from '../utils/apiClient';

const INITIAL_FORM = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  addressLine2: '',
  city: '',
  state: '',
  zipCode: '',
  countryCode: 'PK',
  paymentMethod: 'cash',
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useApp();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const subtotal = getCartTotal();
  const shipping = subtotal >= 5000 ? 0 : 250;
  const total = subtotal + shipping;

  const orderItems = useMemo(
    () => cart.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      selectedColor: item.selectedColor,
      selectedSize: item.selectedSize,
    })),
    [cart]
  );

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (cart.length === 0) return;

    setIsProcessing(true);
    setStatus('loading');
    setError('');

    try {
      const payload = {
        customer: {
          name: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
        },
        shippingAddress: {
          line1: formData.address.trim(),
          line2: formData.addressLine2.trim() || undefined,
          city: formData.city.trim(),
          state: formData.state.trim() || undefined,
          postalCode: formData.zipCode.trim(),
          countryCode: (formData.countryCode || 'PK').trim().toUpperCase(),
        },
        items: orderItems,
      };

      const response = await fetchApi('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      clearCart();
      const orderNumber = response.order?.orderNumber;
      const emailAddress = formData.email.trim();
      const emailParam = emailAddress ? `?email=${encodeURIComponent(emailAddress)}` : '';
      if (orderNumber) {
        navigate(`/order-confirmation/${orderNumber}${emailParam}`);
        return;
      }

      setStatus('error');
      setError('Unable to read order confirmation');
    } catch (err) {
      setStatus('error');
      setError(err.message ?? 'Unable to place your order right now');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container py-8">
        <h1 className="text-3xl font-bold text-primary mb-6">Checkout</h1>
        {status === 'error' && error && (
          <div className="mb-6 rounded-lg border border-rose-100 bg-rose-50 px-6 py-4 text-sm font-semibold text-rose-600">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="border p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-primary mb-4">Personal Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                  />
                </div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg mt-4 focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>

              <div className="border p-6 rounded-lg shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-primary">Shipping Address</h2>
                <textarea
                  name="address"
                  placeholder="Street Address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows="2"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                />
                <input
                  type="text"
                  name="addressLine2"
                  placeholder="Apartment, suite, etc. (optional)"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                  />
                  <input
                    type="text"
                    name="state"
                    placeholder="State / Province"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="Postal Code"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                  />
                  <input
                    type="text"
                    name="countryCode"
                    placeholder="Country Code (e.g. PK)"
                    value={formData.countryCode}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                  />
                </div>
              </div>

              <div className="border p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-primary mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {['cash', 'card', 'bank'].map((method) => (
                    <label
                      key={method}
                      className={`flex items-center gap-3 cursor-pointer p-3 rounded-2xl border transition ${formData.paymentMethod === method ? 'border-secondary bg-secondary/10' : 'border-gray-200 hover:border-secondary hover:bg-gray-50'}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={formData.paymentMethod === method}
                        onChange={handleChange}
                        className="w-4 h-4"
                      />
                      <span className="font-semibold text-sm uppercase tracking-[0.3em]">
                        {method === 'cash' ? 'Cash on Delivery' : method === 'card' ? 'Credit / Debit Card' : 'Bank Transfer'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-secondary text-white py-3 rounded font-bold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {isProcessing ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-2xl p-6 shadow-md sticky top-24 space-y-6">
              <h2 className="text-xl font-bold text-primary">Order Review</h2>
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-slate-900">{item.name}</span>
                      <span className="text-secondary">Rs. {item.price.toLocaleString()}</span>
                    </div>
                    <p className="text-gray-600">Qty: {item.quantity}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-y border-gray-200 py-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Rs. {shipping.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold text-primary">
                <span>Total</span>
                <span>Rs. {total.toLocaleString()}</span>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded text-sm text-blue-700">
                <p className="font-semibold">Summary</p>
                <p className="text-xs text-blue-600">Orders above Rs. 5,000 ship for free.</p>
                <p className="text-xs text-blue-600">Estimated delivery: 5-7 business days.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
