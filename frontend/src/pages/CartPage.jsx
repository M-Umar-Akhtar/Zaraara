import React from 'react';
import { Link } from 'react-router-dom';
import { X, Minus, Plus } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useApp } from '../context/AppContext';

export default function CartPage() {
  const { cart, removeFromCart, updateCartQuantity, getCartTotal } = useApp();
  const shipping = cart.length > 0 ? 500 : 0;
  const total = getCartTotal() + shipping;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container py-20 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-3xl font-bold text-primary mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add some amazing products to get started!</p>
          <Link
            to="/category/women"
            className="inline-block px-8 py-3 bg-secondary text-white rounded hover:bg-red-700 font-bold"
          >
            Continue Shopping
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
        <h1 className="text-3xl font-bold text-primary mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              {cart.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="flex gap-4 p-6 border-b last:border-b-0 hover:bg-white transition"
                >
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="font-bold text-primary mb-2">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{item.fabric}</p>
                    <div className="flex gap-4 text-sm">
                      <span>Color: <strong>{item.selectedColor}</strong></span>
                      <span>Size: <strong>{item.selectedSize}</strong></span>
                    </div>
                    <p className="text-lg font-bold text-secondary mt-2">
                      Rs. {item.price.toLocaleString()} x {item.quantity}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end gap-4">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-600 transition"
                    >
                      <X size={20} />
                    </button>
                    <div className="flex items-center gap-2 border border-gray-300 rounded">
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1 hover:bg-gray-200"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-3 py-1 font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 hover:bg-gray-200"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Link
                to="/category/women"
                className="text-secondary hover:text-red-700 font-semibold"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 rounded-lg sticky top-24">
              <h2 className="text-xl font-bold text-primary mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 pb-6 border-b">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.length} items)</span>
                  <span>Rs. {getCartTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Rs. {shipping}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Discount</span>
                  <span className="text-secondary">Rs. 0</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold text-primary mb-6">
                <span>Total</span>
                <span>Rs. {total.toLocaleString()}</span>
              </div>

              <Link
                to="/checkout"
                className="block w-full bg-secondary text-white py-3 rounded font-bold hover:bg-red-700 text-center transition mb-3"
              >
                Proceed to Checkout
              </Link>

              <button className="w-full border-2 border-primary text-primary py-3 rounded font-bold hover:bg-primary hover:text-white transition">
                Continue Shopping
              </button>

              {/* Promo Code */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-2">Have a promo code?</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <button className="px-4 py-2 bg-primary text-white rounded font-semibold hover:bg-gray-800">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
