import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Sparkles, X } from 'lucide-react';
import { navigationMenu, quickLinks } from '../data/navigationData';

export default function MobileNavigation({ isOpen, onClose }) {
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [expandedSubcategories, setExpandedSubcategories] = useState([]);

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleSubcategory = (subcategoryId) => {
    setExpandedSubcategories((prev) =>
      prev.includes(subcategoryId)
        ? prev.filter((id) => id !== subcategoryId)
        : [...prev, subcategoryId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-y-0 left-0 w-80 bg-white shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary to-secondary text-white p-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Quick Links */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-2 gap-2">
            {quickLinks.map((link) => (
              <Link
                key={link.slug}
                to={`/${link.slug}`}
                onClick={onClose}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-lg transition ${
                  link.highlight
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{link.icon}</span>
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Navigation Categories */}
        <div className="p-4 space-y-2">
          {navigationMenu.map((category) => (
            <div key={category.id} className="border border-slate-200 rounded-xl overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className={`w-full flex items-center justify-between p-4 font-semibold text-left transition ${
                  category.premium
                    ? 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-900'
                    : category.featured
                    ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-900'
                    : 'bg-slate-50 text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  {category.premium && <Sparkles size={18} className="text-amber-600" />}
                  <span>{category.name}</span>
                  {category.premium && (
                    <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                      PREMIUM
                    </span>
                  )}
                  {category.featured && (
                    <span className="bg-secondary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                      NEW
                    </span>
                  )}
                </div>
                {category.subcategories && category.subcategories.length > 0 && (
                  <ChevronDown
                    size={20}
                    className={`transition-transform ${
                      expandedCategories.includes(category.id) ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </button>

              {/* Subcategories */}
              {category.subcategories &&
                category.subcategories.length > 0 &&
                expandedCategories.includes(category.id) && (
                  <div className="bg-white">
                    {category.subcategories.map((subcat) => (
                      <div key={subcat.id} className="border-t border-slate-100">
                        {/* Subcategory Header */}
                        <button
                          onClick={() => toggleSubcategory(subcat.id)}
                          className="w-full flex items-center justify-between p-3 pl-6 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                        >
                          <span>{subcat.name}</span>
                          {subcat.items && subcat.items.length > 0 && (
                            <ChevronRight
                              size={16}
                              className={`transition-transform ${
                                expandedSubcategories.includes(subcat.id) ? 'rotate-90' : ''
                              }`}
                            />
                          )}
                        </button>

                        {/* Items */}
                        {subcat.items &&
                          subcat.items.length > 0 &&
                          expandedSubcategories.includes(subcat.id) && (
                            <ul className="bg-slate-50 py-2">
                              {subcat.items.map((item) => (
                                <li key={item.slug}>
                                  <Link
                                    to={`/category/${category.slug}/${subcat.slug}/${item.slug}`}
                                    onClick={onClose}
                                    className="block px-6 pl-10 py-2 text-sm text-slate-600 hover:text-secondary hover:bg-white transition"
                                  >
                                    {item.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                      </div>
                    ))}

                    {/* View All Link */}
                    <Link
                      to={`/category/${category.slug}`}
                      onClick={onClose}
                      className="block p-3 pl-6 text-sm font-semibold text-secondary hover:bg-secondary hover:text-white transition"
                    >
                      View All {category.name} →
                    </Link>
                  </div>
                )}

              {/* Direct Link for categories without subcategories */}
              {(!category.subcategories || category.subcategories.length === 0) && (
                <Link
                  to={`/category/${category.slug}`}
                  onClick={onClose}
                  className="block p-3 text-sm text-center text-secondary hover:bg-secondary hover:text-white transition"
                >
                  View All →
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <p className="text-xs text-slate-500 text-center">
            © 2024 ZARAARA Fashion. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
