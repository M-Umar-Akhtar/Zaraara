import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { CATEGORIES, PRODUCTS, PROMO_BANNERS } from '../data/mockData';

export default function HomePage() {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [bestSellers] = useState(PRODUCTS.filter(p => p.sale).slice(0, 8));
  const [newArrivals] = useState(PRODUCTS.slice(0, 8));

  // Auto-advance banner
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % PROMO_BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrevBanner = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + PROMO_BANNERS.length) % PROMO_BANNERS.length);
  };

  const handleNextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % PROMO_BANNERS.length);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Carousel - Premium Look */}
        <div className="relative w-full h-96 md:h-[600px] overflow-hidden bg-black">
        {PROMO_BANNERS.map((banner, idx) => (
          <div
            key={banner.id}
            className={`absolute w-full h-full transition-opacity duration-1000 ${
              idx === currentBannerIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-8">
              <div className="text-white text-center max-w-3xl">
                <p className="text-sm md:text-base tracking-widest uppercase font-light text-gray-200 mb-4">{banner.subtitle}</p>
                <h2 className="text-5xl md:text-7xl font-light mb-8 tracking-tight">{banner.title}</h2>
                <Link to="/home" className="inline-block bg-black text-white px-10 py-4 text-sm tracking-widest uppercase font-semibold hover:bg-gray-900 transition">
                  Discover Collection
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Buttons - Minimal */}
        <button
          onClick={handlePrevBanner}
          className="absolute left-8 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition"
        >
          <ChevronLeft size={32} strokeWidth={1} />
        </button>
        <button
          onClick={handleNextBanner}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition"
        >
          <ChevronRight size={32} strokeWidth={1} />
        </button>

        {/* Indicators - Minimal Line Style */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex gap-4">
          {PROMO_BANNERS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentBannerIndex(idx)}
              className={`transition duration-300 ${
                idx === currentBannerIndex ? 'bg-white w-8 h-0.5' : 'bg-white/40 w-4 h-0.5 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex flex-col sm:flex-row items-center gap-3">
            <Link
              to="/login"
              className="px-8 py-3 rounded-full bg-white text-black font-semibold border border-black hover:bg-gray-100 transition"
            >
              User Login
            </Link>
            <Link
              to="/admin/login"
              className="px-8 py-3 rounded-full bg-transparent text-white font-semibold border border-white/60 hover:border-white transition"
            >
              Admin Login
            </Link>
          </div>
      </div>

      <div className="container">
        {/* Featured Categories - Premium Grid */}
        <section className="py-20 border-b border-gray-200">
          <div className="mb-16">
            <p className="text-sm tracking-widest uppercase font-light text-gray-600 mb-3">Collections</p>
            <h2 className="text-5xl md:text-6xl font-light tracking-tight text-black mb-4">
              Explore Our Categories
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="group relative overflow-hidden h-64 md:h-80 shadow-sm hover:shadow-md transition-all duration-500"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition flex items-end justify-start p-6">
                  <div>
                    <h3 className="text-2xl font-light text-white tracking-wide">{cat.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* New Arrivals - Premium Layout */}
        <section className="py-20 border-b border-gray-200">
          <div className="mb-16">
            <p className="text-sm tracking-widest uppercase font-light text-gray-600 mb-3">Latest</p>
            <h2 className="text-5xl md:text-6xl font-light tracking-tight text-black">
              New Arrivals
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {newArrivals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center">
            <Link
              to="/category/women"
              className="inline-block text-black text-sm tracking-widest uppercase font-semibold border border-black px-10 py-4 hover:bg-black hover:text-white transition duration-300"
            >
              View All
            </Link>
          </div>
        </section>

        {/* Best Sellers */}
        <section className="py-20 border-b border-gray-200">
          <div className="mb-16">
            <p className="text-sm tracking-widest uppercase font-light text-gray-600 mb-3">Most Loved</p>
            <h2 className="text-5xl md:text-6xl font-light tracking-tight text-black">
              Best Sellers
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {bestSellers.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center">
            <Link
              to="/category/men"
              className="inline-block text-black text-sm tracking-widest uppercase font-semibold border border-black px-10 py-4 hover:bg-black hover:text-white transition duration-300"
            >
              View All
            </Link>
          </div>
        </section>

        {/* Premium Offer Section */}
        <section className="py-20">
          <div className="bg-gray-100 px-12 md:px-20 py-16 md:py-24 text-center">
            <p className="text-sm tracking-widest uppercase font-light text-gray-600 mb-4">Exclusive Offer</p>
            <h2 className="text-5xl md:text-6xl font-light mb-6 tracking-tight text-black">
              Special Collection
            </h2>
            <p className="text-lg text-gray-700 mb-10 font-light max-w-2xl mx-auto">
              Discover our curated selection with exclusive discounts
            </p>
            <Link
              to="/category/women"
              className="inline-block bg-black text-white text-sm tracking-widest uppercase font-semibold px-12 py-4 hover:bg-gray-800 transition duration-300"
            >
              Shop Now
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { ChevronLeft, ChevronRight } from 'lucide-react';
// import Header from '../components/Header';
// import Footer from '../components/Footer';
// import ProductCard from '../components/ProductCard';
// import { CATEGORIES, PRODUCTS, PROMO_BANNERS } from '../data/mockData';

// export default function HomePage() {
//   const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

//   const newArrivals = PRODUCTS.slice(0, 8);
//   const bestSellers = PRODUCTS.filter(p => p.sale).slice(0, 8);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentBannerIndex(prev => (prev + 1) % PROMO_BANNERS.length);
//     }, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="min-h-screen bg-white">
//       <Header />

//       {/* ================= HERO SECTION ================= */}
//       <section className="relative h-[450px] md:h-[600px] overflow-hidden">
//         {PROMO_BANNERS.map((banner, index) => (
//           <div
//             key={banner.id}
//             className={`absolute inset-0 transition-opacity duration-1000 ${
//               index === currentBannerIndex ? 'opacity-100' : 'opacity-0'
//             }`}
//           >
//             <img
//               src={banner.image}
//               alt={banner.title}
//               className="w-full h-full object-cover"
//             />

//             <div className="absolute inset-0 bg-black/30 flex items-center">
//               <div className="max-w-7xl mx-auto px-6">
//                 <div className="max-w-xl text-white">
//                   <h1 className="text-4xl md:text-6xl font-semibold mb-4">
//                     New Arrivals
//                   </h1>
//                   <p className="text-lg mb-6">
//                     Shop the latest trends now
//                   </p>
//                   <Link
//                     to="/category/women"
//                     className="inline-block bg-red-600 px-8 py-3 text-white rounded hover:bg-red-700 transition"
//                   >
//                     Shop Now
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}

//         {/* Arrows */}
//         <button
//           onClick={() =>
//             setCurrentBannerIndex(
//               (currentBannerIndex - 1 + PROMO_BANNERS.length) %
//                 PROMO_BANNERS.length
//             )
//           }
//           className="absolute left-4 top-1/2 -translate-y-1/2 text-white"
//         >
//           <ChevronLeft size={32} />
//         </button>

//         <button
//           onClick={() =>
//             setCurrentBannerIndex(
//               (currentBannerIndex + 1) % PROMO_BANNERS.length
//             )
//           }
//           className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
//         >
//           <ChevronRight size={32} />
//         </button>
//       </section>

//       {/* ================= MAIN CONTAINER ================= */}
//       <div className="max-w-7xl mx-auto px-4">

//         {/* ================= CATEGORIES ================= */}
//         <section className="py-16">
//           <div className="flex justify-between items-center mb-8">
//             <h2 className="text-3xl font-semibold">
//               Explore Our Categories
//             </h2>
//             <Link className="text-red-600 font-medium text-sm">
//               View All
//             </Link>
//           </div>

//           <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
//             {CATEGORIES.map(cat => (
//               <Link
//                 key={cat.id}
//                 to={`/category/${cat.slug}`}
//                 className="border rounded-lg overflow-hidden hover:shadow-lg transition"
//               >
//                 <div className="relative">
//                   <img
//                     src={cat.image}
//                     alt={cat.name}
//                     className="h-64 w-full object-cover"
//                   />
//                   <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
//                     NEW
//                   </span>
//                 </div>
//                 <div className="p-4">
//                   <h3 className="font-medium">{cat.name}</h3>
//                   <p className="text-red-600 font-semibold mt-1">
//                     Rs. 3,450
//                   </p>
//                   <div className="text-yellow-400 text-sm">★★★★★</div>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         </section>

//         {/* ================= NEW ARRIVALS ================= */}
//         <section className="py-16 border-t">
//           <div className="flex justify-between items-center mb-8">
//             <h2 className="text-3xl font-semibold">New Arrivals</h2>
//             <Link
//               to="/category/women"
//               className="text-red-600 font-medium text-sm"
//             >
//               View All
//             </Link>
//           </div>

//           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//             {newArrivals.map(product => (
//               <ProductCard key={product.id} product={product} />
//             ))}
//           </div>
//         </section>

//         {/* ================= BEST SELLERS ================= */}
//         <section className="py-16 border-t">
//           <div className="flex justify-between items-center mb-8">
//             <h2 className="text-3xl font-semibold">Best Sellers</h2>
//             <Link
//               to="/category/men"
//               className="text-red-600 font-medium text-sm"
//             >
//               View All
//             </Link>
//           </div>

//           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//             {bestSellers.map(product => (
//               <ProductCard key={product.id} product={product} />
//             ))}
//           </div>
//         </section>
//       </div>

//       {/* ================= SPECIAL COLLECTION ================= */}
//       <section className="py-20">
//         <div
//           className="relative h-[400px] bg-cover bg-center"
//           style={{ backgroundImage: "url('/images/special-collection.jpg')" }}
//         >
//           <div className="absolute inset-0 bg-black/30 flex items-center justify-end px-12">
//             <div className="text-white max-w-md">
//               <h2 className="text-4xl font-semibold mb-4">
//                 Special Collection
//               </h2>
//               <Link
//                 to="/category/women"
//                 className="inline-block bg-white text-black px-6 py-3 hover:bg-gray-200 transition"
//               >
//                 Shop Now
//               </Link>
//             </div>
//           </div>
//         </div>
//       </section>

//       <Footer />
//     </div>
//   );
// }
