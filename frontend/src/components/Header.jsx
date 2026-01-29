import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, Heart, ShoppingBag, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import NavigationMenu from './NavigationMenu';
import MobileNavigation from './MobileNavigation';
import './Header.css';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getCartCount, user, selectedCountry } = useApp();

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-md">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white text-sm py-2.5 px-4 text-center font-medium">
          {selectedCountry ? (
            `🌍 Shipping to: ${selectedCountry.name}`
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>🎉 Welcome to ZARAARA Fashion</span>
              <span className="hidden md:inline">|</span>
              <span className="hidden md:inline">Free Shipping on Orders Over Rs. 3,000</span>
            </span>
          )}
        </div>

        {/* Main Header */}
        <div className="border-b border-slate-200">
          <div className="container py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Mobile Menu Button */}
              <button
                className="lg:hidden text-primary p-2 hover:bg-slate-100 rounded-lg transition"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu size={24} />
              </button>

              {/* Logo */}
              <Link
                to="/home"
                className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hover:opacity-80 transition"
              >
                <span className="flex items-center gap-2">
                  <span className="text-3xl">👜</span>
                  <span className="hidden sm:inline">ZARAARA</span>
                </span>
              </Link>

              {/* Search Bar - Desktop */}
              <div className="hidden md:flex flex-1 max-w-xl mx-8">
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Search for products, brands, or categories..."
                    className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition pr-10"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-secondary transition">
                    <Search size={20} />
                  </button>
                </div>
              </div>

              {/* Desktop Navigation Icons */}
              <div className="flex items-center gap-4">
                {/* Search Icon - Mobile */}
                <button className="md:hidden text-primary p-2 hover:bg-slate-100 rounded-lg transition">
                  <Search size={22} />
                </button>

                {/* Wishlist */}
                <Link
                  to="/wishlist"
                  className="relative text-primary hover:text-secondary p-2 hover:bg-slate-100 rounded-lg transition group hidden sm:block"
                >
                  <Heart size={22} className="group-hover:fill-secondary transition" />
                  <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    0
                  </span>
                </Link>

                {/* User Account */}
                <Link
                  to={user ? '/profile' : '/login'}
                  className="text-primary hover:text-secondary p-2 hover:bg-slate-100 rounded-lg transition hidden sm:block"
                >
                  <User size={22} />
                </Link>

                {/* Shopping Cart */}
                <Link
                  to="/cart"
                  className="relative text-primary hover:text-secondary p-2 hover:bg-slate-100 rounded-lg transition group"
                >
                  <ShoppingBag size={22} className="group-hover:fill-secondary/20 transition" />
                  {getCartCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                      {getCartCount()}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Search Bar - Mobile */}
            <div className="md:hidden mt-4">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition pr-10"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-secondary transition">
                  <Search size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Menu */}
        <NavigationMenu />
      </header>

      {/* Mobile Navigation Sidebar */}
      <MobileNavigation isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
}
