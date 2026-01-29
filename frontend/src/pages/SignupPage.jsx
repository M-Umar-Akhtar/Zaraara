import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useApp } from '../context/AppContext';
import { fetchApi } from '../utils/apiClient';

export default function SignupPage() {
  const navigate = useNavigate();
  const { setUser, setAuthToken } = useApp();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.agreeTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }

    setStatus('loading');
    try {
      const payload = await fetchApi('/auth/signup', {
        method: 'POST',
        body: {
          name: formData.fullName,
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
            <h1 className="text-3xl font-bold text-primary mb-2 text-center">Create Account</h1>
            <p className="text-gray-600 text-center mb-8">Join us today and enjoy exclusive benefits</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:border-secondary focus:ring-2 focus:ring-secondary/20"
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

              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-gray-600">
                  I agree to the{' '}
                  <a href="#" className="text-secondary hover:text-red-700 font-semibold">
                    terms and conditions
                  </a>
                </span>
              </label>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-secondary text-white py-2 rounded font-bold hover:bg-red-700 transition disabled:opacity-60"
              >
                {status === 'loading' ? 'Creating account…' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-secondary hover:text-red-700 font-semibold">
                  Sign in
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
