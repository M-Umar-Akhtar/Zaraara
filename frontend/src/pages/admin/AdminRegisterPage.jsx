import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, Lock, Mail, User as UserIcon } from 'lucide-react';
import { fetchApi } from '../../utils/apiClient';
import { useApp } from '../../context/AppContext';

export default function AdminRegisterPage() {
  const { setUser, setAuthToken } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminSecret: '',
  });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.adminSecret) {
      setError('Admin registration code is required');
      return;
    }

    setStatus('loading');
    try {
      const payload = await fetchApi('/auth/admin/signup', {
        method: 'POST',
        body: {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          adminSecret: formData.adminSecret,
        },
      });
      setUser(payload.user);
      setAuthToken(payload.accessToken);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-gray-900 to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mx-auto mb-4 text-white text-3xl">
              🔐
            </div>
            <h1 className="text-3xl font-bold text-primary mb-2">Register Admin</h1>
            <p className="text-gray-600 text-sm">
              Create an admin account using the secure registration code provided by ops.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <div className="relative">
              <UserIcon className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="relative">
              <KeyRound className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="password"
                name="adminSecret"
                placeholder="Admin registration code"
                value={formData.adminSecret}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-bold hover:shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Registering…' : 'Create Admin'}
            </button>
          </form>

          <div className="text-sm text-center text-gray-600">
            <p>
              Already a member?{' '}
              <Link to="/admin/login" className="text-primary hover:text-secondary font-bold">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}