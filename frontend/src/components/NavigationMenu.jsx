import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import { navigationMenu, quickLinks } from '../data/navigationData';

export default function NavigationMenu() {
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeSubMenu, setActiveSubMenu] = useState(null);

  return (
    <nav className="hidden lg:block border-t border-slate-200 bg-white">
      <div className="container">
        <div className="flex items-center justify-between">
          {/* Main Navigation */}
          <div className="flex items-center gap-2">
            {navigationMenu.map((category) => (
              <div
                key={category.id}
                className="relative group"
                onMouseEnter={() => setActiveMenu(category.id)}
                onMouseLeave={() => {
                  setActiveMenu(null);
                  setActiveSubMenu(null);
                }}
              >
                {/* Main Category Link */}
                <Link
                  to={`/category/${category.slug}`}
                  className={`flex items-center gap-2 px-4 py-4 text-sm font-semibold transition-all hover:text-secondary relative ${
                    category.premium
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800'
                      : category.featured
                      ? 'text-secondary'
                      : 'text-slate-700'
                  }`}
                >
                  {category.premium && <Sparkles size={16} className="text-amber-600" />}
                  {category.name}
                  {category.subcategories && category.subcategories.length > 0 && (
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        activeMenu === category.id ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                  {category.premium && (
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      PREMIUM
                    </span>
                  )}
                  {category.featured && (
                    <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                      NEW
                    </span>
                  )}
                </Link>

                {/* Mega Menu Dropdown */}
                {category.subcategories && category.subcategories.length > 0 && (
                  <div
                    className={`absolute left-0 top-full w-screen max-w-6xl bg-white border border-slate-200 shadow-2xl rounded-b-2xl overflow-hidden transition-all duration-300 ${
                      activeMenu === category.id
                        ? 'opacity-100 visible translate-y-0'
                        : 'opacity-0 invisible -translate-y-4 pointer-events-none'
                    }`}
                  >
                    <div className="p-8">
                      {/* Category Header */}
                      <div className="mb-6 pb-4 border-b border-slate-200">
                        <h3 className="text-2xl font-bold text-slate-900 mb-1">
                          {category.name} Collection
                        </h3>
                        {category.description && (
                          <p className="text-sm text-slate-500">{category.description}</p>
                        )}
                      </div>

                      {/* Subcategories Grid */}
                      <div className="grid grid-cols-4 gap-6">
                        {category.subcategories.map((subcat) => (
                          <div key={subcat.id} className="space-y-3">
                            {/* Subcategory Title */}
                            <Link
                              to={`/category/${category.slug}/${subcat.slug}`}
                              className="flex items-center gap-2 text-base font-bold text-slate-900 hover:text-secondary transition group"
                            >
                              {subcat.name}
                              <ChevronRight
                                size={16}
                                className="opacity-0 group-hover:opacity-100 transition"
                              />
                            </Link>

                            {/* Items List */}
                            {subcat.items && (
                              <ul className="space-y-2">
                                {subcat.items.map((item) => (
                                  <li key={item.slug}>
                                    <Link
                                      to={`/category/${category.slug}/${subcat.slug}/${item.slug}`}
                                      className="text-sm text-slate-600 hover:text-secondary hover:pl-2 transition-all block"
                                    >
                                      {item.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Featured Banner */}
                      <div className="mt-8 p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-lg text-slate-900 mb-1">
                              Shop {category.name} Collection
                            </h4>
                            <p className="text-sm text-slate-600">
                              Discover the latest trends and exclusive designs
                            </p>
                          </div>
                          <Link
                            to={`/category/${category.slug}`}
                            className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold hover:shadow-lg transition"
                          >
                            View All
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-2">
            {quickLinks.map((link) => (
              <Link
                key={link.slug}
                to={`/${link.slug}`}
                className={`flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-lg transition ${
                  link.highlight
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg'
                    : 'text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{link.icon}</span>
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
