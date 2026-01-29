import React, { useEffect, useState } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useApp } from '../context/AppContext';
import fetchApi, { buildApiUrl } from '../utils/apiClient';

const formatPrice = (value) => (typeof value === 'number' ? value.toLocaleString('en-PK') : '0');

export default function ProductDetailPage() {
  const { id } = useParams();
  const {
    addToCart,
    addToWishlist,
    removeFromWishlist,
    isInWishlist
  } = useApp();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [related, setRelated] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      if (!id) return;
      setStatus('loading');
      setError('');
      try {
        const response = await fetchApi(`/products/${id}`);
        const fetched = response.product;
        if (!fetched) {
          throw new Error('Product not found');
        }
        if (!isMounted) return;
        setProduct(fetched);
        const gallery = fetched.images?.length
          ? fetched.images
          : (fetched.image ? [fetched.image] : []);
        setActiveImage(gallery[0] ?? '');
        setSelectedColor(fetched.colors?.[0] ?? '');
        setSelectedSize(fetched.sizes?.[0] ?? '');

        if (fetched.categorySlug) {
          try {
            const url = buildApiUrl('/products', {
              category: fetched.categorySlug,
              limit: 4
            });
            const relatedResponse = await fetchApi(url);
            if (!isMounted) return;
            const nextItems = (relatedResponse.items ?? []).filter((item) => item.id !== fetched.id);
            setRelated(nextItems);
          } catch (relatedError) {
            if (isMounted) {
              setRelated([]);
            }
          }
        } else {
          setRelated([]);
        }

        setStatus('success');
      } catch (err) {
        if (!isMounted) return;
        setError(err.message ?? 'Unable to load this product');
        setStatus('error');
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const wishlistActive = product ? isInWishlist(product.id) : false;

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      ...product,
      selectedColor,
      selectedSize
    });
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    if (wishlistActive) {
      removeFromWishlist(product.id);
      return;
    }
    addToWishlist(product);
  };

  const gallery = product?.images?.length
    ? product.images
    : (product?.image ? [product.image] : []);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-6xl space-y-10 px-4">
        {status === 'loading' && (
          <div className="rounded-3xl bg-white/80 p-10 text-center text-lg font-semibold text-gray-600 shadow">
            Loading product...
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-3xl bg-rose-50 p-8 text-center text-lg font-semibold text-rose-600 shadow">
            {error}
          </div>
        )}

        {product && (
          <div className="space-y-10 rounded-[32px] bg-white p-6 shadow-xl shadow-slate-300/40 lg:p-10">
            <div className="flex flex-col gap-1 text-sm text-slate-500">
              <Link
                to={`/category/${product.categorySlug ?? ''}`}
                className="font-semibold uppercase tracking-[0.3em] text-secondary hover:text-secondary/80"
              >
                Back to {product.categorySlug ?? 'catalog'}
              </Link>
              <p className="text-xs text-slate-400">#{product.id}</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
              <div className="space-y-6">
                <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100">
                  {activeImage ? (
                    <img
                      src={activeImage}
                      alt={product.name}
                      className="h-96 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-96 items-center justify-center text-lg font-semibold text-slate-400">
                      Image unavailable
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {gallery.map((src) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setActiveImage(src)}
                      className={`overflow-hidden rounded-2xl border transition ${activeImage === src ? 'border-secondary shadow-lg' : 'border-slate-200'}`}
                    >
                      <img
                        src={src}
                        alt={product.name}
                        className="h-20 w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Limited Drop</p>
                  <h1 className="text-3xl font-black text-slate-900 lg:text-4xl">
                    {product.name}
                  </h1>
                </div>

                <div className="flex items-baseline gap-4">
                  <span className="text-3xl font-black text-secondary">
                    Rs. {formatPrice(product.price)}
                  </span>
                  {product.sale && product.originalPrice && (
                    <span className="text-sm font-semibold text-slate-500 line-through">
                      Rs. {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>

                <p className="text-sm leading-relaxed text-slate-600">
                  {product.description ?? 'A stylish addition to your wardrobe, crafted for everyday comfort.'}
                </p>

                <div className="space-y-4">
                  {product.colors?.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
                        Select Color
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {product.colors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setSelectedColor(color)}
                            className={`rounded-full border px-4 py-1 text-xs font-semibold transition ${selectedColor === color ? 'border-secondary bg-secondary/10 text-secondary' : 'border-slate-200 bg-white text-slate-600'}`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {product.sizes?.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
                        Choose Size
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedSize(size)}
                            className={`rounded-2xl border px-4 py-1 text-xs font-semibold transition ${selectedSize === size ? 'border-secondary bg-secondary/10 text-secondary' : 'border-slate-200 bg-white text-slate-600'}`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-secondary to-red-600 px-8 py-3 text-sm font-bold uppercase tracking-[0.25em] text-white shadow-lg shadow-secondary/60 transition hover:scale-[1.01]"
                  >
                    <ShoppingCart size={18} />
                    Add to Cart
                  </button>
                  <button
                    type="button"
                    onClick={handleWishlistToggle}
                    className="flex items-center gap-2 rounded-2xl border border-slate-200 px-6 py-2 text-sm font-semibold text-slate-600 transition hover:border-secondary"
                  >
                    <Heart
                      size={18}
                      className={wishlistActive ? 'text-secondary' : 'text-slate-400'}
                    />
                    {wishlistActive ? 'Remove from wishlist' : 'Save for later'}
                  </button>
                </div>

                <div className="grid gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-900">Fabric:</span> {product.fabric ?? 'Premium material'}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Ships from:</span> Pakistan
                  </p>
                  {product.sale && product.discount > 0 && product.originalPrice && (
                    <p className="text-xs uppercase tracking-[0.25em] text-secondary">
                      Save Rs. {formatPrice(product.originalPrice - product.price)} ({product.discount}% off)
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {related.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">You might also like</h2>
              <Link
                to="/"
                className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500 hover:text-secondary"
              >
                Explore more
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

