import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useApp } from '../context/AppContext';
import { fetchApi } from '../utils/apiClient';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser, setAuthToken } = useApp();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
    setStatus('loading');
    try {
      const payload = await fetchApi('/auth/login', {
        method: 'POST',
        body: {
          email: formData.email,
          password: formData.password,
        },
      });
      setUser(payload.user);
      setAuthToken(payload.accessToken);
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-50 p-8 rounded-lg shadow">
            <h1 className="text-3xl font-bold text-primary mb-2 text-center">Welcome Back</h1>
            <p className="text-gray-600 text-center mb-8">Sign in to your account</p>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:border-secondary focus:ring-2 focus:ring-secondary/20"
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span>Remember me</span>
                </label>
                <a href="#" className="text-secondary hover:text-red-700">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-secondary text-white py-2 rounded font-bold hover:bg-red-700 transition disabled:opacity-60"
              >
                {status === 'loading' ? 'Signing In…' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-gray-600 mb-3">
                Don't have an account?{' '}
                <Link to="/signup" className="text-secondary hover:text-red-700 font-semibold">
                  Create one
                </Link>
              </p>
              <p className="text-gray-600">
                Are you an admin?{' '}
                <Link to="/admin/login" className="text-secondary hover:text-red-700 font-semibold">
                  Admin Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
