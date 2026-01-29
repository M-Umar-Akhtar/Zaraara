// Navigation menu structure with all categories and subcategories
export const navigationMenu = [
  {
    id: 'new-arrivals',
    name: 'New Arrivals',
    slug: 'new-arrivals',
    featured: true,
    subcategories: []
  },
  {
    id: 'women',
    name: 'Women',
    slug: 'women',
    subcategories: [
      {
        id: 'women-stitched',
        name: 'Stitched',
        slug: 'stitched',
        items: [
          { name: 'Lawn Suits', slug: 'lawn-suits' },
          { name: 'Cotton Suits', slug: 'cotton-suits' },
          { name: 'Formal Wear', slug: 'formal-wear' },
          { name: 'Party Wear', slug: 'party-wear' }
        ]
      },
      {
        id: 'women-kurti',
        name: 'Kurti (1 Piece)',
        slug: 'kurti',
        items: [
          { name: 'Short Kurti', slug: 'short-kurti' },
          { name: 'Long Kurti', slug: 'long-kurti' },
          { name: 'Printed Kurti', slug: 'printed-kurti' },
          { name: 'Embroidered Kurti', slug: 'embroidered-kurti' }
        ]
      },
      {
        id: 'women-trouser',
        name: 'Trouser / Shalwar',
        slug: 'trouser-shalwar',
        items: [
          { name: 'Trouser', slug: 'trouser' },
          { name: 'Shalwar', slug: 'shalwar' },
          { name: 'Cigarette Pants', slug: 'cigarette-pants' },
          { name: 'Palazzo', slug: 'palazzo' }
        ]
      },
      {
        id: 'women-unstitched',
        name: 'Unstitched',
        slug: 'unstitched',
        items: [
          { name: 'Lawn 3 Piece', slug: 'lawn-3-piece' },
          { name: 'Cotton 3 Piece', slug: 'cotton-3-piece' },
          { name: 'Lawn 2 Piece', slug: 'lawn-2-piece' },
          { name: 'Premium Fabric', slug: 'premium-fabric' }
        ]
      },
      {
        id: 'women-stole',
        name: 'Stole / Shawl',
        slug: 'stole-shawl',
        items: [
          { name: 'Pashmina Shawl', slug: 'pashmina-shawl' },
          { name: 'Silk Stole', slug: 'silk-stole' },
          { name: 'Woolen Shawl', slug: 'woolen-shawl' },
          { name: 'Dupatta', slug: 'dupatta' }
        ]
      },
      {
        id: 'women-footwear',
        name: 'Footwear',
        slug: 'footwear',
        items: [
          { name: 'Sandals', slug: 'sandals' },
          { name: 'Heels', slug: 'heels' },
          { name: 'Flats', slug: 'flats' },
          { name: 'Khussas', slug: 'khussas' }
        ]
      }
    ]
  },
  {
    id: 'men',
    name: 'Men',
    slug: 'men',
    subcategories: [
      {
        id: 'men-kameez-shalwar',
        name: 'Kameez Shalwar',
        slug: 'kameez-shalwar',
        items: [
          { name: 'Cotton Kameez Shalwar', slug: 'cotton-kameez-shalwar' },
          { name: 'Wash & Wear', slug: 'wash-wear' },
          { name: 'Premium Fabric', slug: 'premium-fabric' },
          { name: 'Embroidered', slug: 'embroidered' }
        ]
      },
      {
        id: 'men-kurta-trousers',
        name: 'Kurta Trousers',
        slug: 'kurta-trousers',
        items: [
          { name: 'Cotton Kurta Set', slug: 'cotton-kurta-set' },
          { name: 'Linen Kurta Set', slug: 'linen-kurta-set' },
          { name: 'Formal Kurta', slug: 'formal-kurta' },
          { name: 'Casual Kurta', slug: 'casual-kurta' }
        ]
      },
      {
        id: 'men-kurta',
        name: 'Kurta',
        slug: 'kurta',
        items: [
          { name: 'Short Kurta', slug: 'short-kurta' },
          { name: 'Long Kurta', slug: 'long-kurta' },
          { name: 'Designer Kurta', slug: 'designer-kurta' },
          { name: 'Plain Kurta', slug: 'plain-kurta' }
        ]
      },
      {
        id: 'men-waistcoat',
        name: 'Waistcoat',
        slug: 'waistcoat',
        items: [
          { name: 'Formal Waistcoat', slug: 'formal-waistcoat' },
          { name: 'Casual Waistcoat', slug: 'casual-waistcoat' },
          { name: 'Designer Waistcoat', slug: 'designer-waistcoat' },
          { name: 'Traditional Waistcoat', slug: 'traditional-waistcoat' }
        ]
      },
      {
        id: 'men-thobe',
        name: 'Thobe',
        slug: 'thobe',
        items: [
          { name: 'White Thobe', slug: 'white-thobe' },
          { name: 'Black Thobe', slug: 'black-thobe' },
          { name: 'Colored Thobe', slug: 'colored-thobe' },
          { name: 'Embroidered Thobe', slug: 'embroidered-thobe' }
        ]
      },
      {
        id: 'men-footwear',
        name: 'Footwear',
        slug: 'footwear',
        items: [
          { name: 'Formal Shoes', slug: 'formal-shoes' },
          { name: 'Casual Shoes', slug: 'casual-shoes' },
          { name: 'Sandals', slug: 'sandals' },
          { name: 'Khussa', slug: 'khussa' }
        ]
      }
    ]
  },
  {
    id: 'boys-girls',
    name: 'Boys & Girls',
    slug: 'boys-girls',
    subcategories: [
      {
        id: 'teen-girls',
        name: 'Teen Girls',
        slug: 'teen-girls',
        items: [
          { name: 'Kurti Sets', slug: 'kurti-sets' },
          { name: 'Lawn Suits', slug: 'lawn-suits' },
          { name: 'Party Wear', slug: 'party-wear' },
          { name: 'Casual Wear', slug: 'casual-wear' }
        ]
      },
      {
        id: 'teen-boys',
        name: 'Teen Boys',
        slug: 'teen-boys',
        items: [
          { name: 'Kurta Shalwar', slug: 'kurta-shalwar' },
          { name: 'Shirts', slug: 'shirts' },
          { name: 'Trousers', slug: 'trousers' },
          { name: 'Casual Wear', slug: 'casual-wear' }
        ]
      },
      {
        id: 'girls',
        name: 'Girls',
        slug: 'girls',
        items: [
          { name: 'Frocks', slug: 'frocks' },
          { name: 'Suits', slug: 'suits' },
          { name: 'Party Dresses', slug: 'party-dresses' },
          { name: 'Casual Wear', slug: 'casual-wear' }
        ]
      },
      {
        id: 'boys',
        name: 'Boys',
        slug: 'boys',
        items: [
          { name: 'Kurta Pajama', slug: 'kurta-pajama' },
          { name: 'Waistcoat Sets', slug: 'waistcoat-sets' },
          { name: 'Shirts & Pants', slug: 'shirts-pants' },
          { name: 'Party Wear', slug: 'party-wear' }
        ]
      },
      {
        id: 'infants',
        name: 'Infants',
        slug: 'infants',
        items: [
          { name: 'Baby Suits', slug: 'baby-suits' },
          { name: 'Rompers', slug: 'rompers' },
          { name: 'Onesies', slug: 'onesies' },
          { name: 'Sets', slug: 'sets' }
        ]
      }
    ]
  },
  {
    id: 'almirah',
    name: 'Almirah',
    slug: 'almirah',
    premium: true,
    description: 'Premium Sub-Brand',
    subcategories: [
      {
        id: 'almirah-women',
        name: 'Women',
        slug: 'women',
        items: [
          { name: 'Premium Lawn', slug: 'premium-lawn' },
          { name: 'Luxury Collection', slug: 'luxury-collection' },
          { name: 'Designer Wear', slug: 'designer-wear' },
          { name: 'Bridal Collection', slug: 'bridal-collection' }
        ]
      },
      {
        id: 'almirah-men',
        name: 'Men',
        slug: 'men',
        items: [
          { name: 'Premium Kurta', slug: 'premium-kurta' },
          { name: 'Luxury Suits', slug: 'luxury-suits' },
          { name: 'Designer Collection', slug: 'designer-collection' },
          { name: 'Formal Wear', slug: 'formal-wear' }
        ]
      }
    ]
  }
];

// Quick links for mega menu
export const quickLinks = [
  { name: 'Best Sellers', slug: 'best-sellers', icon: '🔥' },
  { name: 'Sale', slug: 'sale', icon: '💥', highlight: true },
  { name: 'New Collection', slug: 'new-collection', icon: '✨' },
  { name: 'Trending', slug: 'trending', icon: '📈' }
];
