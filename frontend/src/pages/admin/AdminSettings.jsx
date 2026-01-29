import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Bell,
  Lock,
  Mail,
  Globe,
  Shield,
  User,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Check,
  AlertCircle
} from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { useTheme } from '../../context/ThemeContext';

export default function AdminSettings() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [showPassword, setShowPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'ZARAARA Fashion',
    siteEmail: 'admin@zaraara.com',
    supportEmail: 'support@zaraara.com',
    phone: '+92 300 1234567',
    address: 'Karachi, Pakistan',
    currency: 'PKR',
    language: 'English',
    timezone: 'Asia/Karachi',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    orderNotifications: true,
    customerNotifications: true,
    inventoryAlerts: true,
    marketingEmails: false,
    weeklyReports: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorAuth: false,
    sessionTimeout: '30',
  });

  const handleSaveSettings = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Sun },
  ];

  return (
    <div className={`flex min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <AdminSidebar />

      <div className="flex-1 ml-64">
        <AdminHeader />

        <main className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Settings
            </h1>
            <p className={`mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Manage your admin portal preferences and configurations
            </p>
          </div>

          {/* Success Message */}
          {saveSuccess && (
            <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
              <Check size={20} className="text-emerald-600" />
              <p className="text-emerald-800 font-semibold">Settings saved successfully!</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Tabs Sidebar */}
            <div className={`lg:col-span-1 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-xl border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'} p-4 h-fit`}>
              <nav className="space-y-2">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                          : theme === 'dark'
                          ? 'text-slate-300 hover:bg-slate-700'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Icon size={20} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-3">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-xl border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'} p-6`}>
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                      <Globe size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        General Settings
                      </h2>
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        Basic information about your store
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                          Site Name
                        </label>
                        <input
                          type="text"
                          value={generalSettings.siteName}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                          className={`w-full px-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-primary/20 transition ${
                            theme === 'dark'
                              ? 'bg-slate-700 border-slate-600 text-white'
                              : 'bg-white border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                          Site Email
                        </label>
                        <input
                          type="email"
                          value={generalSettings.siteEmail}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, siteEmail: e.target.value })}
                          className={`w-full px-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-primary/20 transition ${
                            theme === 'dark'
                              ? 'bg-slate-700 border-slate-600 text-white'
                              : 'bg-white border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                          Support Email
                        </label>
                        <input
                          type="email"
                          value={generalSettings.supportEmail}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                          className={`w-full px-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-primary/20 transition ${
                            theme === 'dark'
                              ? 'bg-slate-700 border-slate-600 text-white'
                              : 'bg-white border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={generalSettings.phone}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, phone: e.target.value })}
                          className={`w-full px-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-primary/20 transition ${
                            theme === 'dark'
                              ? 'bg-slate-700 border-slate-600 text-white'
                              : 'bg-white border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                          Address
                        </label>
                        <input
                          type="text"
                          value={generalSettings.address}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
                          className={`w-full px-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-primary/20 transition ${
                            theme === 'dark'
                              ? 'bg-slate-700 border-slate-600 text-white'
                              : 'bg-white border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                          Currency
                        </label>
                        <select
                          value={generalSettings.currency}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, currency: e.target.value })}
                          className={`w-full px-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-primary/20 transition ${
                            theme === 'dark'
                              ? 'bg-slate-700 border-slate-600 text-white'
                              : 'bg-white border-slate-200 text-slate-900'
                          }`}
                        >
                          <option>PKR</option>
                          <option>USD</option>
                          <option>EUR</option>
                          <option>GBP</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                          Language
                        </label>
                        <select
                          value={generalSettings.language}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
                          className={`w-full px-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-primary/20 transition ${
                            theme === 'dark'
                              ? 'bg-slate-700 border-slate-600 text-white'
                              : 'bg-white border-slate-200 text-slate-900'
                          }`}
                        >
                          <option>English</option>
                          <option>Urdu</option>
                          <option>Arabic</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex gap-4">
                      <button
                        onClick={handleSaveSettings}
                        className="px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center gap-2"
                      >
                        <Save size={18} />
                        Save Changes
                      </button>
                      <button className={`px-6 py-2.5 rounded-lg font-semibold transition flex items-center gap-2 ${
                        theme === 'dark'
                          ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}>
                        <RefreshCw size={18} />
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Settings */}
              {activeTab === 'notifications' && (
                <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-xl border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'} p-6`}>
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Bell size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        Notification Preferences
                      </h2>
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        Manage how you receive notifications
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(notificationSettings).map(([key, value]) => (
                      <div key={key} className={`flex items-center justify-between p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                        <div>
                          <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            Receive notifications for {key.toLowerCase()}
                          </p>
                        </div>
                        <button
                          onClick={() => setNotificationSettings({ ...notificationSettings, [key]: !value })}
                          className={`relative w-14 h-7 rounded-full transition ${
                            value ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-slate-300'
                          }`}
                        >
                          <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                            value ? 'translate-x-7' : ''
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-slate-200 dark:border-slate-700 mt-6 flex gap-4">
                    <button
                      onClick={handleSaveSettings}
                      className="px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center gap-2"
                    >
                      <Save size={18} />
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-xl border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'} p-6`}>
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                      <Lock size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        Security Settings
                      </h2>
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        Manage your password and security preferences
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Change Password */}
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                      <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        Change Password
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={securitySettings.currentPassword}
                              onChange={(e) => setSecuritySettings({ ...securitySettings, currentPassword: e.target.value })}
                              className={`w-full px-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-primary/20 transition ${
                                theme === 'dark'
                                  ? 'bg-slate-700 border-slate-600 text-white'
                                  : 'bg-white border-slate-200 text-slate-900'
                              }`}
                            />
                            <button
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                            >
                              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                            New Password
                          </label>
                          <input
                            type="password"
                            value={securitySettings.newPassword}
                            onChange={(e) => setSecuritySettings({ ...securitySettings, newPassword: e.target.value })}
                            className={`w-full px-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-primary/20 transition ${
                              theme === 'dark'
                                ? 'bg-slate-700 border-slate-600 text-white'
                                : 'bg-white border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={securitySettings.confirmPassword}
                            onChange={(e) => setSecuritySettings({ ...securitySettings, confirmPassword: e.target.value })}
                            className={`w-full px-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-primary/20 transition ${
                              theme === 'dark'
                                ? 'bg-slate-700 border-slate-600 text-white'
                                : 'bg-white border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            Two-Factor Authentication
                          </h3>
                          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <button
                          onClick={() => setSecuritySettings({ ...securitySettings, twoFactorAuth: !securitySettings.twoFactorAuth })}
                          className={`relative w-14 h-7 rounded-full transition ${
                            securitySettings.twoFactorAuth ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-slate-300'
                          }`}
                        >
                          <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                            securitySettings.twoFactorAuth ? 'translate-x-7' : ''
                          }`} />
                        </button>
                      </div>
                    </div>

                    {/* Session Timeout */}
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                      <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        Session Timeout
                      </h3>
                      <select
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })}
                        className={`w-full px-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-primary/20 transition ${
                          theme === 'dark'
                            ? 'bg-slate-700 border-slate-600 text-white'
                            : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="120">2 hours</option>
                      </select>
                    </div>

                    <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex gap-4">
                      <button
                        onClick={handleSaveSettings}
                        className="px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center gap-2"
                      >
                        <Shield size={18} />
                        Update Security
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-xl border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'} p-6`}>
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      {theme === 'dark' ? <Moon size={24} className="text-white" /> : <Sun size={24} className="text-white" />}
                    </div>
                    <div>
                      <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        Appearance Settings
                      </h2>
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        Customize the look and feel of your admin portal
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Theme Selector */}
                    <div>
                      <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        Theme Mode
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => theme === 'dark' && toggleTheme()}
                          className={`p-6 rounded-xl border-2 transition-all ${
                            theme === 'light'
                              ? 'border-primary bg-gradient-to-br from-primary/10 to-secondary/10'
                              : theme === 'dark'
                              ? 'border-slate-600 bg-slate-700/50'
                              : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <Sun size={32} className={theme === 'light' ? 'text-primary' : 'text-slate-400'} />
                          <p className={`mt-3 font-semibold ${theme === 'light' ? 'text-primary' : theme === 'dark' ? 'text-slate-300' : 'text-slate-900'}`}>
                            Light Mode
                          </p>
                          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            Bright and clean interface
                          </p>
                          {theme === 'light' && (
                            <div className="mt-3 flex items-center gap-2 text-primary text-sm font-semibold">
                              <Check size={16} />
                              Active
                            </div>
                          )}
                        </button>

                        <button
                          onClick={() => theme === 'light' && toggleTheme()}
                          className={`p-6 rounded-xl border-2 transition-all ${
                            theme === 'dark'
                              ? 'border-primary bg-gradient-to-br from-primary/10 to-secondary/10'
                              : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <Moon size={32} className={theme === 'dark' ? 'text-primary' : 'text-slate-400'} />
                          <p className={`mt-3 font-semibold ${theme === 'dark' ? 'text-primary' : 'text-slate-900'}`}>
                            Dark Mode
                          </p>
                          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            Easy on the eyes
                          </p>
                          {theme === 'dark' && (
                            <div className="mt-3 flex items-center gap-2 text-primary text-sm font-semibold">
                              <Check size={16} />
                              Active
                            </div>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Theme Preview */}
                    <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                      <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        Preview
                      </h3>
                      <div className="space-y-3">
                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-600' : 'bg-white'} border ${theme === 'dark' ? 'border-slate-500' : 'border-slate-200'}`}>
                          <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            Sample Card
                          </p>
                          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                            This is how cards will look in {theme} mode
                          </p>
                        </div>
                        <button className="w-full px-4 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold">
                          Sample Button
                        </button>
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg border-2 ${theme === 'dark' ? 'border-blue-500/50 bg-blue-500/10' : 'border-blue-200 bg-blue-50'}`}>
                      <div className="flex gap-3">
                        <AlertCircle size={20} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                        <div>
                          <p className={`font-semibold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-900'}`}>
                            Theme Information
                          </p>
                          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-blue-200' : 'text-blue-700'}`}>
                            Your theme preference is saved automatically and will persist across sessions.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
