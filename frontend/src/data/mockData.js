export const COUNTRIES = [
  { id: 1, name: 'Pakistan', flag: '🇵🇰', code: 'PK' },
  { id: 2, name: 'United States', flag: '🇺🇸', code: 'US' },
  { id: 3, name: 'United Kingdom', flag: '🇬🇧', code: 'UK' },
  { id: 4, name: 'Saudi Arabia', flag: '🇸🇦', code: 'SA' },
  { id: 5, name: 'United Arab Emirates', flag: '🇦🇪', code: 'AE' },
  { id: 6, name: 'Canada', flag: '🇨🇦', code: 'CA' },
  { id: 7, name: 'Australia', flag: '🇦🇺', code: 'AU' },
];

export const CATEGORIES = [
  { id: 1, name: 'Women', slug: 'women', image: 'https://img.drz.lazcdn.com/static/pk/p/5a69504e25de75e90fdb49c82e7f3e2a.jpg_720x720q80.jpg' },
  { id: 2, name: 'Men', slug: 'men', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=500&fit=crop' },
  { id: 3, name: 'Kids', slug: 'kids', image: 'https://momyom.pk/cdn/shop/files/64257ce2e88c7.jpg?v=1739950514&width=460' },
  { id: 4, name: 'Accessories', slug: 'accessories', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' },
  { id: 5, name: 'Fragrances', slug: 'fragrances', image: 'https://pursuit.unimelb.edu.au/__data/assets/image/0020/102566/Fragrance-fallout_558a3e25-d800-476a-b1c8-fa02ed32602f.jpg' },
];

export const PRODUCTS = [
  // Women's Products
  { id: 1, name: 'Premium Lawn Suit', category: 'women', price: 4500, originalPrice: 5500, image: 'https://safwa.pk/cdn/shop/files/01_e345e1e5-d837-4c98-927b-8be54fe43bcf.jpg?v=1710653331&width=500', images: ['https://images.unsplash.com/phot-1590080876571-cd2d6be6c08d?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1595777707802-41d2b9e4dab7?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1595607774223-ef52624120d2?w=800&h=800&fit=crop'], sale: true, discount: 18, colors: ['Red', 'Blue', 'Green'], sizes: ['XS', 'S', 'M', 'L', 'XL'], fabric: 'Pure Cotton', description: 'Elegant lawn suit with traditional design' },
  { id: 2, name: 'Silk Kurti', category: 'women', price: 3200, originalPrice: 3800, image: 'https://varanga.in/cdn/shop/products/5_7470679c-4b3c-476a-9579-a28659a6b492.jpg?v=1671515711', images: ['https://varanga.in/cdn/shop/products/5_7470679c-4b3c-476a-9579-a28659a6b492.jpg?v=1671515711'], sale: true, discount: 16, colors: ['Purple', 'Gold', 'Black'], sizes: ['S', 'M', 'L', 'XL'], fabric: 'Pure Silk', description: 'Beautiful silk kurti perfect for special occasions' },
  { id: 3, name: 'Printed Dress', category: 'women', price: 2800, originalPrice: 3500, image: 'https://shoprex.com/images/srproducts/large/3-pcs-digital-printed-lawn-dress-with-printed-chiffon-dupatta-unstitched-drl-2200_48659.jpg', images: ['https://shoprex.com/images/srproducts/large/3-pcs-digital-printed-lawn-dress-with-printed-chiffon-dupatta-unstitched-drl-2200_48659.jpg'], sale: true, discount: 20, colors: ['Pink', 'White', 'Navy'], sizes: ['XS', 'S', 'M', 'L'], fabric: 'Cotton Blend', description: 'Modern printed dress for casual wear' },
  { id: 4, name: 'Luxury Dresses', category: 'women', price: 5500, originalPrice: 6500, image: 'https://saleemfabrics.pk/cdn/shop/products/Formal-Dress-Inayat-Luxury-Wedding-Fleur-D-2-available-at-Saleem-Fabrics-Traditions-875.jpg?v=1677135807', images: ['https://saleemfabrics.pk/cdn/shop/products/Formal-Dress-Inayat-Luxury-Wedding-Fleur-D-2-available-at-Saleem-Fabrics-Traditions-875.jpg?v=1677135807'], sale: false, discount: 0, colors: ['Maroon', 'Black', 'Gold'], sizes: ['XS', 'S', 'M', 'L', 'XL'], fabric: 'Premium Silk', description: 'Luxury evening dress collection' },
  
  // Men's Products
  { id: 5, name: 'Classic Kurta', category: 'men', price: 3500, originalPrice: 4200, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBc3aLpOsasyqMyCDy426VlQuud36LzhYl-Q&s', images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBc3aLpOsasyqMyCDy426VlQuud36LzhYl-Q&s'], sale: true, discount: 17, colors: ['White', 'Black', 'Cream'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], fabric: 'Cotton', description: 'Traditional kurta for all occasions' },
  { id: 6, name: 'Formal Shalwar', category: 'men', price: 2500, originalPrice: 3200, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=500&fit=crop', images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1618612176452-e3b5de1e5ecc?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=800&fit=crop'], sale: true, discount: 22, colors: ['Black', 'Navy', 'Gray'], sizes: ['28', '30', '32', '34', '36'], fabric: 'Cotton Twill', description: 'Perfect formal shalwar for business meetings' },
  { id: 7, name: 'Premium Suit', category: 'men', price: 8500, originalPrice: 10000, image: 'https://andreemilio.com/wp-content/uploads/2021/01/Premium-Fine-Cream-3-Piece-Suit.jpg', images: ['https://images.unsplash.com/photo-1591047990434-fe4fa88ee5e0?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1591033707802-1dc6021c6e03?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1594906566174-ff3890a63fc8?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=800&h=800&fit=crop'], sale: true, discount: 15, colors: ['Navy', 'Black', 'Gray'], sizes: ['S', 'M', 'L', 'XL'], fabric: 'Wool Blend', description: 'Sophisticated suit for executive wear' },
  { id: 8, name: 'Casual Shirt', category: 'men', price: 2000, originalPrice: 2500, image: 'https://engine.com.pk/cdn/shop/files/MC5046-LBL_3.jpg?v=1752485650', images: ['https://images.unsplash.com/photo-1596362051614-0f6a7924ee0d?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1618799676489-fdf400c5b5fa?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1594906566174-ff3890a63fc8?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1611003228941-98852ba62227?w=800&h=800&fit=crop'], sale: false, discount: 0, colors: ['White', 'Blue', 'Green', 'Red'], sizes: ['S', 'M', 'L', 'XL'], fabric: 'Oxford Cotton', description: 'Comfortable casual shirt for everyday wear' },
  
  // Kids' Products
  { id: 9, name: 'Kids Suit', category: 'kids', price: 2500, originalPrice: 3200, image: 'https://img4.dhresource.com/webp/m/0x0/f3/albu/km/t/22/42242032-40a3-43a6-8395-ff4fbc82bdaa.jpg', images: ['https://img4.dhresource.com/webp/m/0x0/f3/albu/km/t/22/42242032-40a3-43a6-8395-ff4fbc82bdaa.jpg', 'https://images.unsplash.com/photo-1503919545889-48854d7c5ce0?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1595767707802-04c73b0b8f7a?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1589153132136-cefdf8f56bd3?w=800&h=800&fit=crop'], sale: true, discount: 22, colors: ['Navy', 'Black', 'Gray'], sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'], fabric: 'Cotton Blend', description: 'Stylish suit for kids special occasions' },
  { id: 10, name: 'Kids Dress', category: 'kids', price: 1500, originalPrice: 2000, image: 'https://www.shopmodest.pk/cdn/shop/files/1_25.jpg?v=1751105727&width=600', images: ['https://www.shopmodest.pk/cdn/shop/files/1_25.jpg?v=1751105727&width=600', 'https://images.unsplash.com/photo-1595767707802-04c73b0b8f7a?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1589153132136-cefdf8f56bd3?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1503919545889-48854d7c5ce0?w=800&h=800&fit=crop'], sale: true, discount: 25, colors: ['Pink', 'White', 'Yellow'], sizes: ['2-3Y', '4-5Y', '6-7Y'], fabric: 'Cotton', description: 'Cute dress for kids birthday parties' },
  
  // Accessories
  { id: 11, name: 'Luxury Shawl', category: 'accessories', price: 3500, originalPrice: 4500, image: 'https://i.pinimg.com/736x/4d/fa/4d/4dfa4df5545e86b134b62c529f65dce3.jpg', images: ['https://i.pinimg.com/736x/4d/fa/4d/4dfa4df5545e86b134b62c529f65dce3.jpg', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1574804013541-3fb0c7eef032?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1630409387297-28ae9d60235f?w=800&h=800&fit=crop'], sale: true, discount: 22, colors: ['Red', 'Blue', 'Gold'], sizes: ['One Size'], fabric: 'Premium Wool', description: 'Elegant shawl for all seasons' },
  { id: 12, name: 'Designer Handbag', category: 'accessories', price: 5500, originalPrice: 6500, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=500&fit=crop', images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1550972335-20a2948e50e2?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1473093295203-cad00df16e50?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&h=800&fit=crop'], sale: false, discount: 0, colors: ['Black', 'Brown', 'Gold'], sizes: ['One Size'], fabric: 'Leather', description: 'Premium leather handbag' },
  { id: 13, name: 'Decorative Dupatta', category: 'accessories', price: 1200, originalPrice: 1500, image: 'https://i.pinimg.com/736x/75/b2/87/75b28710ccb6b810aed4a5ab21e9b190.jpg', images: ['https://i.pinimg.com/736x/75/b2/87/75b28710ccb6b810aed4a5ab21e9b190.jpg', 'https://images.unsplash.com/photo-1574804013541-3fb0c7eef032?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&h=800&fit=crop'], sale: true, discount: 20, colors: ['Maroon', 'Navy', 'Purple'], sizes: ['One Size'], fabric: 'Cotton-Silk Blend', description: 'Beautiful dupatta for traditional wear' },
  
  // Fragrances
  { id: 14, name: 'Perfume Collection', category: 'fragrances', price: 2500, originalPrice: 3200, image: 'https://cdn.shopify.com/s/files/1/0874/0097/2607/files/perfume_collection.jpg?v=1721460700', images: ['https://cdn.shopify.com/s/files/1/0874/0097/2607/files/perfume_collection.jpg?v=1721460700', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1560393464-5c69a73a0809?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1575233217185-e09d9ee60e36?w=800&h=800&fit=crop'], sale: true, discount: 22, colors: ['Premium Oud', 'Rose', 'Floral'], sizes: ['50ml', '100ml'], description: 'Luxurious perfume collection' },
  { id: 15, name: 'Fresh Fragrance', category: 'fragrances', price: 1800, originalPrice: 2200, image: 'https://cdn.shopify.com/s/files/1/0445/8342/0056/files/71SE_LNhT0L._SL1500_480x480.jpg?v=1712485692', images: ['https://cdn.shopify.com/s/files/1/0445/8342/0056/files/71SE_LNhT0L._SL1500_480x480.jpg?v=1712485692', 'https://images.unsplash.com/photo-1585736724256-40989d1b373f?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1575233217185-e09d9ee60e36?w=800&h=800&fit=crop'], sale: false, discount: 0, colors: ['Citrus', 'Lavender', 'Mint'], sizes: ['30ml', '60ml'], description: 'Fresh and energizing fragrance' },
];

export const PROMO_BANNERS = [
  {
    id: 1,
    title: 'Mega Sale',
    subtitle: 'Up to 50% off',
    image: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=1200&h=400&fit=crop',
    link: '/sale'
  },
  {
    id: 2,
    title: 'New Arrivals',
    subtitle: 'Latest Collections',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&h=400&fit=crop',
    link: '/new-arrivals'
  },
  {
    id: 3,
    title: 'Summer Collection',
    subtitle: 'Fresh & Breezy',
    image: 'https://images.unsplash.com/photo-1595607774223-ef52624120d2?w=1200&h=400&fit=crop',
    link: '/summer'
  }
];
