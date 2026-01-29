import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProductCard({ product }) {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useApp();
  const inWishlist = isInWishlist(product.id);
  const discountedPrice = product.sale 
    ? product.price 
    : product.originalPrice;

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 group">
      {/* Image Container */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 h-72 group">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-500"
          />
        </Link>

        {/* Sale Badge */}
        {product.sale && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-secondary to-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
            🔥 -{product.discount}% OFF
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-4 right-4 bg-white rounded-full p-3 hover:bg-gray-100 transition shadow-lg hover:shadow-xl"
        >
          <Heart
            size={22}
            className={inWishlist ? 'fill-secondary text-secondary' : 'text-gray-400'}
          />
        </button>

        {/* Quick Add Button */}
        <button
          onClick={() => addToCart(product)}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-secondary to-red-600 text-white py-3 flex items-center justify-center gap-2 hover:from-red-700 hover:to-red-800 transition transform translate-y-full group-hover:translate-y-0 font-semibold text-lg"
        >
          <ShoppingCart size={20} />
          Add to Cart
        </button>
      </div>

      {/* Product Info */}
      <div className="p-5">
        <Link to={`/product/${product.id}`} className="block hover:text-secondary transition">
          <h3 className="font-bold text-base md:text-lg text-primary line-clamp-2">{product.name}</h3>
        </Link>

        {/* Price */}
        <div className="mt-3 flex items-center gap-3">
          <span className="text-2xl font-bold bg-gradient-to-r from-secondary to-red-600 bg-clip-text text-transparent">
            Rs. {discountedPrice.toLocaleString()}
          </span>
          {product.sale && (
            <span className="text-sm text-gray-500 line-through font-medium">
              Rs. {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Fabric Info */}
        <p className="text-xs text-gray-600 mt-2 font-medium">📦 {product.fabric}</p>

        {/* Colors */}
        <div className="flex gap-2 mt-4">
          {product.colors.slice(0, 3).map((color, idx) => (
            <div
              key={idx}
              className="w-5 h-5 rounded-full border-3 border-gray-300 hover:border-secondary transition shadow-sm"
              style={{
                backgroundColor: color.toLowerCase() === 'red' ? '#c41e3a' :
                  color.toLowerCase() === 'blue' ? '#0066cc' :
                  color.toLowerCase() === 'green' ? '#228b22' :
                  color.toLowerCase() === 'black' ? '#000' :
                  color.toLowerCase() === 'white' ? '#fff' :
                  color.toLowerCase() === 'gold' ? '#ffd700' :
                  color.toLowerCase() === 'purple' ? '#800080' :
                  color.toLowerCase() === 'pink' ? '#ffc0cb' :
                  color.toLowerCase() === 'navy' ? '#001f3f' :
                  color.toLowerCase() === 'gray' ? '#808080' :
                  color.toLowerCase() === 'maroon' ? '#800000' :
                  color.toLowerCase() === 'cream' ? '#fffdd0' : '#ddd'
              }}
              title={color}
            />
          ))}
          {product.colors.length > 3 && (
            <div className="text-xs text-gray-600 flex items-center font-semibold">
              +{product.colors.length - 3} more
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
