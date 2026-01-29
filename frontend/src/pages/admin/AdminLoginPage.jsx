import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { fetchApi } from '../../utils/apiClient';

export default function AdminLoginPage() {
  const { setUser, setAuthToken } = useApp();
  const [email, setEmail] = useState('admin@fashionwebsite.com');
  const [password, setPassword] = useState('admin123');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('loading');
    try {
      const payload = await fetchApi('/auth/login', {
        method: 'POST',
        body: {
          email,
          password,
        },
      });

      if (payload.user.role !== 'ADMIN') {
        throw new Error('This portal is for admins only');
      }

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
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mx-auto mb-4 text-white text-3xl">
              👑
            </div>
            <h1 className="text-3xl font-bold text-primary mb-2">Admin Portal</h1>
            <p className="text-gray-600">Fashion Website Management</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}
            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@fashionwebsite.com"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                  required
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 border border-gray-300 rounded" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-primary hover:text-secondary font-bold">
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Logging in...' : 'Login to Dashboard'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs font-bold text-blue-900 mb-2">🔐 Demo Credentials</p>
            <p className="text-xs text-blue-800 font-mono">Email: admin@fashionwebsite.com</p>
            <p className="text-xs text-blue-800 font-mono">Password: admin123</p>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Need a new admin account?{' '}
              <Link to="/admin/register" className="text-primary hover:text-secondary font-bold">
                Register here
              </Link>
            </p>
            <p className="mt-2">
              Back to{' '}
              <a href="/" className="text-primary hover:text-secondary font-bold">
                Fashion Website
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
