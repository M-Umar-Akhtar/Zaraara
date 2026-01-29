import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const getStoredToken = () => {
    try {
      return window.localStorage.getItem('accessToken');
    } catch (error) {
      return null;
    }
  };
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    priceRange: [0, 10000],
    sizes: [],
    colors: [],
    sortBy: 'latest'
  });
  const [authToken, setAuthTokenState] = useState(getStoredToken);

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const addToWishlist = (product) => {
    const exists = wishlist.find(item => item.id === product.id);
    if (!exists) {
      setWishlist([...wishlist, product]);
    }
  };

  const removeFromWishlist = (productId) => {
    setWishlist(wishlist.filter(item => item.id !== productId));
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  const setAuthToken = (token) => {
    const normalized = token || null;
    try {
      if (normalized) {
        window.localStorage.setItem('accessToken', normalized);
      } else {
        window.localStorage.removeItem('accessToken');
      }
    } catch (error) {
      console.warn('Unable to persist auth token', error);
    }
    setAuthTokenState(normalized);
  };

  const logout = () => {
    setUser(null);
    setAuthToken(null);
    setCart([]);
    setWishlist([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <AppContext.Provider value={{
      selectedCountry,
      setSelectedCountry,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      getCartTotal,
      getCartCount,
      clearCart,
      wishlist,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      user,
      setUser,
      authToken,
      setAuthToken,
      logout,
      searchTerm,
      setSearchTerm,
      filters,
      setFilters,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
