import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import fetchApi from '../../utils/apiClient';

const emptyProductForm = {
  name: '',
  categorySlug: '',
  price: '',
  originalPrice: '',
  image: '',
  additionalImages: '',
  additionalImageFiles: [],
  colors: '',
  sizes: '',
  fabric: '',
  description: '',
  sale: false,
  discount: '',
};

function parseCommaSeparated(value) {
  return typeof value === 'string'
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Unable to read file'));
    reader.readAsDataURL(file);
  });
}

export default function AdminProducts() {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formState, setFormState] = useState(emptyProductForm);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [imageModal, setImageModal] = useState({ open: false, src: '' });

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const payload = await fetchApi('/products');
      setProducts(payload.items ?? []);
    } catch (error) {
      console.error('Failed to load products', error);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const payload = await fetchApi('/categories');
      setCategories(payload.categories ?? []);
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [loadProducts, loadCategories]);

  useEffect(() => {
    if (!formState.categorySlug && categories.length > 0) {
      setFormState((prev) => ({ ...prev, categorySlug: categories[0].slug }));
    }
  }, [categories, formState.categorySlug]);

  const categoryLabel = useMemo(() => {
    return categories.reduce((map, category) => {
      map[category.slug] = category.name;
      return map;
    }, {});
  }, [categories]);

  const filteredProducts = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return products;
    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(normalized) ||
        product.categorySlug.toLowerCase().includes(normalized) ||
        String(product.id).includes(normalized)
      );
    });
  }, [products, searchTerm]);

  const resetForm = (overrides = {}) => {
    setFormState({ ...emptyProductForm, ...overrides });
    setFormError('');
  };

  const openAddProductModal = () => {
    resetForm({ categorySlug: categories[0]?.slug ?? '' });
    setShowModal(true);
    setEditingProduct(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    resetForm({ categorySlug: categories[0]?.slug ?? '' });
  };

  const openEditProductModal = (product) => {
    const additionalFromProduct = (product.images ?? []).filter((img) => img !== product.image);
    resetForm({
      name: product.name,
      categorySlug: product.categorySlug,
      price: String(product.price ?? ''),
      originalPrice: product.originalPrice != null ? String(product.originalPrice) : '',
      image: product.image ?? '',
      additionalImages: additionalFromProduct.join(', '),
      additionalImageFiles: [],
      colors: (product.colors ?? []).join(', '),
      sizes: (product.sizes ?? []).join(', '),
      fabric: product.fabric ?? '',
      description: product.description ?? '',
      sale: product.sale ?? false,
      discount: product.discount != null ? String(product.discount) : '',
    });
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleSubmitProduct = async () => {
    if (!formState.name || !formState.categorySlug || !formState.price || !formState.image) {
      setFormError('Name, category, price, and main image are required.');
      return;
    }

    const priceValue = Number(formState.price);
    if (Number.isNaN(priceValue)) {
      setFormError('Price must be a valid number.');
      return;
    }

    const discountValue = formState.discount.trim() ? Number(formState.discount) : undefined;

    const additionalImagesPayload = [
      ...formState.additionalImageFiles,
      ...parseCommaSeparated(formState.additionalImages),
    ].filter(Boolean);

    const payload = {
      name: formState.name,
      categorySlug: formState.categorySlug,
      price: priceValue,
      originalPrice: formState.originalPrice ? Number(formState.originalPrice) : undefined,
      image: formState.image,
      images: additionalImagesPayload,
      sale: formState.sale,
      discount: discountValue,
      colors: parseCommaSeparated(formState.colors),
      sizes: parseCommaSeparated(formState.sizes),
      fabric: formState.fabric || undefined,
      description: formState.description || undefined,
    };

    setIsSaving(true);
    try {
      const endpoint = editingProduct ? `/products/${editingProduct.id}` : '/products';
      const method = editingProduct ? 'PATCH' : 'POST';
      await fetchApi(endpoint, {
        method,
        body: payload,
      });
      await loadProducts();
      closeModal();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleMainImageFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setFormState((prev) => ({ ...prev, image: dataUrl }));
    } catch (error) {
      setFormError('Unable to read the selected image.');
    } finally {
      event.target.value = '';
    }
  };

  const handleAdditionalImageFilesChange = async (event) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    try {
      const urls = await Promise.all(files.map(fileToDataUrl));
      setFormState((prev) => ({
        ...prev,
        additionalImageFiles: [...prev.additionalImageFiles, ...urls],
      }));
    } catch (error) {
      setFormError('Unable to read one or more selected images.');
    } finally {
      event.target.value = '';
    }
  };

  const removeAdditionalImage = (index) => {
    setFormState((prev) => ({
      ...prev,
      additionalImageFiles: prev.additionalImageFiles.filter((_, i) => i !== index),
    }));
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    try {
      await fetchApi(`/products/${productId}`, { method: 'DELETE' });
      await loadProducts();
    } catch (error) {
      setFormError(error.message);
    }
  };

  const renderRow = (product) => {
    const imageSrc = product.image || product.images?.[0] || '';
    const categoryName = categoryLabel[product.categorySlug] ?? product.categorySlug;
    return (
      <tr key={product.id} className="hover:bg-slate-50/50 transition">
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <img
              src={imageSrc}
              alt={product.name}
              onClick={() => setImageModal({ open: true, src: imageSrc })}
              className="w-12 h-12 rounded-lg object-cover shadow-md cursor-pointer"
            />
            <div>
              <p className="font-bold text-slate-900">{product.name}</p>
              <p className="text-xs text-slate-500 font-medium">ID: {product.id}</p>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 text-sm font-semibold text-slate-700 capitalize">
          {categoryName}
        </td>
        <td className="px-6 py-4 font-bold text-primary">
          Rs. {Number(product.price).toLocaleString()}
        </td>
        <td className="px-6 py-4">
          <span className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
            45 units
          </span>
        </td>
        <td className="px-6 py-4">
          <span
            className={`text-xs font-bold px-3 py-1.5 rounded-full inline-block border ${
              product.sale
                ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-700 border-green-200'
                : 'bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            {product.sale ? '🔥 On Sale' : 'Active'}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <button
              className="p-2.5 hover:bg-blue-100 rounded-lg transition text-blue-600 hover:shadow-md font-bold"
              type="button"
              onClick={() => openEditProductModal(product)}
            >
              <Edit2 size={18} />
            </button>
            <button
              className="p-2.5 hover:bg-red-100 rounded-lg transition text-red-600 hover:shadow-md font-bold"
              type="button"
              onClick={() => handleDeleteProduct(product.id)}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        <AdminHeader />

        <main className="flex-1 overflow-auto">
          <div className="p-8 space-y-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
                  Products
                </h1>
                <p className="text-slate-600 mt-2 font-medium">Manage and organize your fashion collection with ease.</p>
              </div>
              <button
                onClick={openAddProductModal}
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl transition-all hover:scale-105 shadow-lg"
                type="button"
              >
                <Plus size={20} />
                Add Product
              </button>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by product name, ID, or category..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition bg-white shadow-sm hover:shadow-md font-medium text-slate-700"
                />
              </div>
              <button className="flex items-center gap-2 px-6 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition font-semibold text-slate-700 shadow-sm hover:shadow-md" type="button">
                <Filter size={20} />
                Filter
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Product</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Stock</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {loadingProducts && (
                          <tr>
                            <td colSpan={6} className="px-6 py-10 text-center text-slate-500 text-sm">
                              Loading products...
                            </td>
                          </tr>
                        )}
                        {!loadingProducts && filteredProducts.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-6 py-10 text-center text-slate-500 text-sm">
                              No products match your search yet.
                            </td>
                          </tr>
                        )}
                        {!loadingProducts && filteredProducts.map(renderRow)}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200 rounded-2xl">
              <p className="text-sm text-slate-600 font-medium">
                Showing <span className="font-bold text-slate-900">{filteredProducts.length}</span> of{' '}
                <span className="font-bold text-slate-900">{products.length}</span> products
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition font-semibold text-slate-700 shadow-sm" type="button">
                  Previous
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg shadow-lg hover:shadow-xl transition font-semibold" type="button">
                  1
                </button>
                <button className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition font-semibold text-slate-700 shadow-sm" type="button">
                  2
                </button>
                <button className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition font-semibold text-slate-700 shadow-sm" type="button">
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white sticky top-0 z-10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {formError && <p className="text-sm text-red-600 font-medium">{formError}</p>}
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={formState.name}
                  onChange={(event) => handleFormChange('name', event.target.value)}
                  className="col-span-2 px-4 py-3 border border-slate-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition font-medium"
                />
                <input
                  type="number"
                  placeholder="Price (PKR)"
                  value={formState.price}
                  onChange={(event) => handleFormChange('price', event.target.value)}
                  className="px-4 py-3 border border-slate-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition font-medium"
                />
                <input
                  type="number"
                  placeholder="Original Price (optional)"
                  value={formState.originalPrice}
                  onChange={(event) => handleFormChange('originalPrice', event.target.value)}
                  className="px-4 py-3 border border-slate-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition font-medium"
                />
                <select
                  value={formState.categorySlug}
                  onChange={(event) => handleFormChange('categorySlug', event.target.value)}
                  className="col-span-2 px-4 py-3 border border-slate-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition font-medium text-slate-700"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="col-span-2 grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Fabric"
                    value={formState.fabric}
                    onChange={(event) => handleFormChange('fabric', event.target.value)}
                    className="px-4 py-3 border border-slate-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition font-medium"
                  />
                  <div className="flex items-center gap-3 px-4 py-3 border border-slate-300 rounded-xl">
                    <input
                      id="saleToggle"
                      type="checkbox"
                      checked={formState.sale}
                      onChange={(event) => handleFormChange('sale', event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="saleToggle" className="text-sm font-semibold text-slate-700">
                      Put on sale
                    </label>
                  </div>
                </div>
                <div className="col-span-2 space-y-2">
                  <input
                    type="text"
                    placeholder="Main Image URL"
                    value={formState.image}
                    onChange={(event) => handleFormChange('image', event.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition font-medium"
                  />
                  <label
                    htmlFor="mainImageUpload"
                    className="flex items-center justify-between px-4 py-3 border border-dashed border-slate-300 rounded-xl cursor-pointer text-sm font-semibold text-slate-600 hover:border-primary"
                  >
                    <span>Upload main image from device</span>
                    <input
                      id="mainImageUpload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleMainImageFileChange}
                    />
                    <span className="text-xs font-medium text-slate-400">
                      {formState.image ? 'Image selected' : 'No file chosen'}
                    </span>
                  </label>
                </div>
                <div className="col-span-2 space-y-3">
                  <textarea
                    placeholder="Additional image URLs (comma separated)"
                    value={formState.additionalImages}
                    onChange={(event) => handleFormChange('additionalImages', event.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition font-medium h-24"
                  />
                  <label
                    htmlFor="additionalImageUpload"
                    className="flex items-center justify-between px-4 py-3 border border-dashed border-slate-300 rounded-xl cursor-pointer text-sm font-semibold text-slate-600 hover:border-primary"
                  >
                    <span>Upload additional images from device</span>
                    <input
                      id="additionalImageUpload"
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={handleAdditionalImageFilesChange}
                    />
                    <span className="text-xs font-medium text-slate-400">
                      {formState.additionalImageFiles.length > 0
                        ? `${formState.additionalImageFiles.length} file(s)`
                        : 'No files chosen'}
                    </span>
                  </label>
                  {formState.additionalImageFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formState.additionalImageFiles.map((_, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600"
                        >
                          <span>Uploaded Image {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeAdditionalImage(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Colors (comma separated)"
                  value={formState.colors}
                  onChange={(event) => handleFormChange('colors', event.target.value)}
                  className="px-4 py-3 border border-slate-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition font-medium"
                />
                <input
                  type="text"
                  placeholder="Sizes (comma separated)"
                  value={formState.sizes}
                  onChange={(event) => handleFormChange('sizes', event.target.value)}
                  className="px-4 py-3 border border-slate-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition font-medium"
                />
                <input
                  type="number"
                  placeholder="Discount (%)"
                  value={formState.discount}
                  onChange={(event) => handleFormChange('discount', event.target.value)}
                  className="px-4 py-3 border border-slate-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition font-medium"
                />
                <textarea
                  placeholder="Product Description"
                  value={formState.description}
                  onChange={(event) => handleFormChange('description', event.target.value)}
                  className="col-span-2 px-4 py-3 border border-slate-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition font-medium h-24"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 bg-slate-50/50 flex gap-4 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 border border-slate-300 rounded-lg hover:bg-white hover:border-slate-400 transition font-bold text-slate-700 shadow-sm hover:shadow-md"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitProduct}
                className="px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-xl transition font-bold shadow-lg"
                type="button"
                disabled={isSaving}
              >
                {isSaving ? 'Saving…' : editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {imageModal.open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200">
            <img src={imageModal.src} alt="Product" className="w-full h-[520px] object-cover" />
            <div className="p-4 flex justify-end">
              <button
                onClick={() => setImageModal({ open: false, src: '' })}
                className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg"
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
