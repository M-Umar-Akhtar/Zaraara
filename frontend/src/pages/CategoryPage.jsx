import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown, X } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { fetchApi, buildApiUrl } from '../utils/apiClient';

const SORT_TO_API = {
  latest: 'latest',
  'price-low': 'price_asc',
  'price-high': 'price_desc',
  newest: 'latest',
};

export default function CategoryPage() {
  const location = useLocation();
  const categoryPath = location.pathname.replace('/category/', '');
  const pathSegments = categoryPath.split('/').filter(Boolean);
  const mainCategory = pathSegments[0] || undefined;
  const displayName = pathSegments.join(' / ') || 'All Products';
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sortBy, setSortBy] = useState('latest');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    const apiSort = SORT_TO_API[sortBy] ?? 'latest';
    const url = buildApiUrl('/products', {
      category: mainCategory,
      sort: apiSort,
    });

    fetchApi(url)
      .then((data) => {
        if (!isMounted) return;
        setProducts(data.items ?? []);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [mainCategory, sortBy]);

  const filteredProducts = useMemo(() => {
    const minPrice = Math.min(priceRange[0], priceRange[1]);
    const maxPrice = Math.max(priceRange[0], priceRange[1]);

    return products.filter((product) => {
      if (product.price < minPrice || product.price > maxPrice) {
        return false;
      }

      const colorMatch =
        selectedColors.length === 0 || product.colors.some((color) => selectedColors.includes(color));
      const sizeMatch =
        selectedSizes.length === 0 || product.sizes.some((size) => selectedSizes.includes(size));
      return colorMatch && sizeMatch;
    });
  }, [products, priceRange, selectedColors, selectedSizes]);

  const allColors = useMemo(() => [...new Set(products.flatMap((product) => product.colors))], [products]);
  const allSizes = useMemo(() => [...new Set(products.flatMap((product) => product.sizes))], [products]);

  const toggleColor = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const toggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const clearFilters = () => {
    setPriceRange([0, 10000]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSortBy('latest');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary capitalize">
            {displayName}
          </h1>
          <span className="text-gray-600">
            {filteredProducts.length} Products
          </span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="flex gap-8">
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Filters</h3>
                {(selectedColors.length > 0 || selectedSizes.length > 0 || priceRange[0] !== 0 || priceRange[1] !== 10000) && (
                  <button
                    onClick={clearFilters}
                    className="text-secondary hover:text-red-700 text-sm font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="mb-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  Price <ChevronDown size={16} />
                </h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-600">
                    Rs. {priceRange[0]} - Rs. {priceRange[1]}
                  </p>
                </div>
              </div>

              {allColors.length > 0 && (
                <div className="mb-6 pb-6 border-b">
                  <h4 className="font-semibold mb-4">Colors</h4>
                  <div className="space-y-2">
                    {allColors.map((color) => (
                      <label key={color} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedColors.includes(color)}
                          onChange={() => toggleColor(color)}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm">{color}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {allSizes.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-4">Sizes</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {allSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`py-2 px-3 border rounded text-sm font-medium transition ${
                          selectedSizes.includes(size)
                            ? 'bg-primary text-white border-primary'
                            : 'border-gray-300 text-primary hover:border-primary'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row gap-4 mb-8 items-start sm:items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden px-4 py-2 border border-primary text-primary rounded hover:bg-primary hover:text-white transition"
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded text-primary"
              >
                <option value="latest">Latest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            {showFilters && (
              <div className="lg:hidden bg-gray-50 p-4 rounded-lg mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2 text-sm">Price Range</h4>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-600 mt-2">Rs. {priceRange[0]} - Rs. {priceRange[1]}</p>
                </div>

                {allColors.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2 text-sm">Colors</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {allColors.map((color) => (
                        <label key={color} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedColors.includes(color)}
                            onChange={() => toggleColor(color)}
                            className="w-3 h-3 rounded"
                          />
                          <span className="text-xs">{color}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {allSizes.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Sizes</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {allSizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => toggleSize(size)}
                          className={`py-1 px-2 border rounded text-xs font-medium transition ${
                            selectedSizes.includes(size)
                              ? 'bg-primary text-white border-primary'
                              : 'border-gray-300 text-primary'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading products...</div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found matching your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
