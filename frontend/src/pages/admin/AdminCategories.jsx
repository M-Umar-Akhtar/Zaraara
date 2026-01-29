import React, { useState } from 'react';
import { Plus, Eye, Trash2, X } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { CATEGORIES } from '../../data/mockData';

const NEW_CATEGORY_TEMPLATE = { name: '', slug: '', image: '', imageUrl: '' };

const buildSlug = (value) =>
  (value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'category';

export default function AdminCategories() {
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState(CATEGORIES);
  const [viewCategory, setViewCategory] = useState(null);
  const [newCategory, setNewCategory] = useState(() => ({ ...NEW_CATEGORY_TEMPLATE }));
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setNewCategory({ ...NEW_CATEGORY_TEMPLATE });
    setErrors({});
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeAddModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setNewCategory((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'imageUrl' ? { image: value } : {}),
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setNewCategory((prev) => ({ ...prev, image: reader.result, imageUrl: '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddCategory = () => {
    const validation = {};
    if (!newCategory.name.trim()) {
      validation.name = 'Category name is required';
    }
    if (!newCategory.slug.trim()) {
      validation.slug = 'Add a short slug for better URLs';
    }
    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }

    setIsSaving(true);
    const slugValue = newCategory.slug.trim()
      ? buildSlug(newCategory.slug)
      : buildSlug(newCategory.name);
    const freshCategory = {
      id: `cat-${Date.now()}`,
      name: newCategory.name.trim(),
      slug: slugValue,
      image: newCategory.image || CATEGORIES[0]?.image || '',
    };

    setCategories((prev) => [freshCategory, ...prev]);
    setTimeout(() => {
      setIsSaving(false);
      setShowModal(false);
      resetForm();
    }, 250);
  };

  const handleDeleteCategory = (id) => {
    const target = categories.find((category) => category.id === id);
    if (!target) return;
    if (!window.confirm(`Delete ${target.name}? This cannot be undone.`)) {
      return;
    }
    setCategories((prev) => prev.filter((category) => category.id !== id));
    if (viewCategory?.id === id) {
      setViewCategory(null);
    }
  };

  const handleViewCategory = (category) => {
    setViewCategory(category);
  };

  const closeViewModal = () => {
    setViewCategory(null);
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
                  Categories
                </h1>
                <p className="text-slate-600 mt-2 font-medium">Organize and manage your product categories.</p>
              </div>
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl transition-all hover:scale-105 shadow-lg"
              >
                <Plus size={20} />
                Add Category
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => handleViewCategory(category)}
                        className="p-3 bg-white rounded-lg hover:bg-slate-100 transition shadow-lg hover:shadow-xl font-semibold"
                      >
                        <Eye size={18} className="text-primary" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-3 bg-white rounded-lg hover:bg-slate-100 transition shadow-lg hover:shadow-xl font-semibold"
                      >
                        <Trash2 size={18} className="text-red-500" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{category.name}</h3>
                    <p className="text-sm text-slate-600 mb-4 font-medium">
                      Slug:{' '}
                      <span className="font-mono text-primary font-bold">{category.slug}</span>
                    </p>
                    <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-slate-200">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-3 rounded-xl border border-blue-200/50">
                        <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">Products</p>
                        <p className="text-2xl font-bold text-primary mt-1">
                          {Math.floor(Math.random() * 50) + 10}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-3 rounded-xl border border-green-200/50">
                        <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">Status</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">✓</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewCategory(category)}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition font-bold text-sm shadow-md flex items-center justify-center gap-2"
                      >
                        <Eye size={16} />
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition font-bold text-sm text-slate-700 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-10"></div>
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white sticky top-0 z-10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Add New Category
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g., Men"
                  value={newCategory.name}
                  onChange={handleInputChange('name')}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition font-medium"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Slug</label>
                <input
                  type="text"
                  placeholder="e.g., men"
                  value={newCategory.slug}
                  onChange={handleInputChange('slug')}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition font-medium"
                />
                {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newCategory.imageUrl}
                  onChange={handleInputChange('imageUrl')}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Upload from device</label>
                <label className="flex items-center gap-2 px-4 py-3 border border-dashed border-slate-300 rounded-2xl cursor-pointer text-sm font-medium text-slate-600 hover:border-primary hover:text-primary transition">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="sr-only" />
                  <span>Add image</span>
                  <Plus size={16} />
                </label>
                {newCategory.image && (
                  <div className="mt-3 rounded-xl border border-slate-200 overflow-hidden">
                    <img src={newCategory.image} alt="Upload preview" className="w-full h-32 object-cover" />
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 bg-slate-50/50 flex gap-3 justify-end">
              <button
                onClick={closeAddModal}
                className="px-6 py-2.5 border border-slate-300 rounded-lg hover:bg-white hover:border-slate-400 transition font-bold text-slate-700 shadow-sm hover:shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-xl transition font-bold shadow-lg"
                type="button"
                disabled={isSaving}
              >
                {isSaving ? 'Adding…' : 'Add Category'}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewCategory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-start justify-between p-6 border-b border-slate-200">
              <div>
                <p className="text-xs uppercase text-slate-500 tracking-wider">Category Preview</p>
                <h3 className="text-2xl font-bold text-slate-900">{viewCategory.name}</h3>
                <p className="text-sm text-slate-600">Slug: {viewCategory.slug}</p>
              </div>
              <button
                onClick={closeViewModal}
                className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 h-60">
                <img
                  src={viewCategory.image || CATEGORIES[0]?.image}
                  alt={viewCategory.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-xl border border-blue-200/50">
                  <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">Products</p>
                  <p className="text-2xl font-bold text-primary mt-1">{Math.floor(Math.random() * 50) + 10}</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-4 rounded-xl border border-amber-200/50">
                  <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">Visibility</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">Public</p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeViewModal}
                  className="px-5 py-2 rounded-lg border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
