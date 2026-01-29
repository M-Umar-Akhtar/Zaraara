import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { COUNTRIES } from '../data/mockData';

export default function CountrySelectorPage() {
  const navigate = useNavigate();
  const { setSelectedCountry } = useApp();

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-gray-900 flex items-center justify-center">
      <div className="w-full">
        {/* Hero Section */}
        <div className="text-center text-white mb-12 px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            FASHION WEBSITE
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-2">
            Premium Fashion for Every Moment
          </p>
          <p className="text-gray-400">
            Select your country/region to continue shopping
          </p>
        </div>

        {/* Country Selection Grid */}
        <div className="container px-4 mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {COUNTRIES.map(country => (
              <button
                key={country.id}
                onClick={() => handleCountrySelect(country)}
                className="group bg-white hover:bg-secondary text-primary hover:text-white p-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <div className="text-5xl mb-3">{country.flag}</div>
                <h3 className="text-lg font-bold mb-2">{country.name}</h3>
                <p className="text-sm text-gray-600 group-hover:text-white/80">
                  Select to shop
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-3 gap-8 text-white text-center">
            <div>
              <div className="text-3xl mb-2">🚚</div>
              <h4 className="font-bold mb-2">Fast Delivery</h4>
              <p className="text-gray-300 text-sm">Quick and reliable shipping worldwide</p>
            </div>
            <div>
              <div className="text-3xl mb-2">💳</div>
              <h4 className="font-bold mb-2">Secure Payment</h4>
              <p className="text-gray-300 text-sm">Multiple payment options available</p>
            </div>
            <div>
              <div className="text-3xl mb-2">✨</div>
              <h4 className="font-bold mb-2">Premium Quality</h4>
              <p className="text-gray-300 text-sm">Best fabrics and craftsmanship</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
