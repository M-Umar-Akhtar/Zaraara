import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { useApp } from '../context/AppContext';
import { Heart } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, addToCart } = useApp();

  const handleMoveToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product.id);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container py-8">
        <h1 className="text-3xl font-bold text-primary mb-8">My Wishlist</h1>

        {wishlist.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-primary mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8">Start adding items to your wishlist to save your favorites!</p>
            <Link
              to="/category/women"
              className="inline-block px-8 py-3 bg-secondary text-white rounded hover:bg-red-700 font-bold"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {wishlist.map(product => (
                <div key={product.id} className="relative">
                  <ProductCard product={product} />
                  <button
                    onClick={() => handleMoveToCart(product)}
                    className="absolute bottom-16 left-4 right-4 bg-primary text-white py-2 rounded font-semibold hover:bg-secondary transition"
                  >
                    Move to Cart
                  </button>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link
                to="/category/women"
                className="inline-block px-8 py-3 border-2 border-primary text-primary rounded hover:bg-primary hover:text-white font-bold transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
