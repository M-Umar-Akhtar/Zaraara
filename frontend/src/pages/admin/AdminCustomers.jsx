import React, { useEffect, useMemo, useState } from 'react';
import { Mail, Phone, MapPin, Search } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import fetchApi, { buildApiUrl } from '../../utils/apiClient';

const formatCurrency = (value) => (typeof value === 'number' ? value.toLocaleString('en-PK') : '0');

export default function AdminCustomers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadCustomerSummaries = async () => {
      setStatus('loading');
      setError('');
      try {
        const response = await fetchApi(buildApiUrl('/support/orders', { page: 1, limit: 50 }));
        if (!isMounted) return;
        const orders = response.orders ?? [];
        const customerMap = new Map();
        orders.forEach((order) => {
          const key = order.customerEmail?.toLowerCase() || `${order.customerName}-${order.id}`;
          const existing = customerMap.get(key) ?? {
            id: key,
            name: order.customerName || 'Guest',
            email: order.customerEmail || 'Unknown',
            phone: order.customerPhone || 'N/A',
            city: order.shipCity || order.shipCountryCode || 'Unknown',
            orders: 0,
            spent: 0,
            joined: order.createdAt,
            lastOrder: order.createdAt,
          };
          existing.orders += 1;
          existing.spent += order.total ?? 0;
          if (order.createdAt && new Date(order.createdAt) < new Date(existing.joined)) {
            existing.joined = order.createdAt;
          }
          if (order.createdAt && new Date(order.createdAt) > new Date(existing.lastOrder)) {
            existing.lastOrder = order.createdAt;
          }
          customerMap.set(key, existing);
        });
        setCustomers(Array.from(customerMap.values()));
        setStatus('success');
      } catch (err) {
        if (!isMounted) return;
        setError(err.message ?? 'Unable to load customer summaries.');
        setStatus('error');
      }
    };

    loadCustomerSummaries();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return customers;
    return customers.filter((customer) =>
      customer.name.toLowerCase().includes(term) || customer.email.toLowerCase().includes(term)
    );
  }, [customers, searchTerm]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        <AdminHeader />

        <main className="flex-1 overflow-auto">
          <div className="p-8 space-y-8">
            <div>
              <h1 className="text-4xl font-bold leading-tight bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
                Customer Directory
              </h1>
              <p className="text-slate-600 mt-2 font-medium">Live customer data gathered from real orders.</p>
            </div>

            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex-1 min-w-[260px] relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition bg-white shadow-sm hover:shadow-md font-medium text-slate-700"
                />
              </div>
              <div className="flex gap-3">
                <div className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 shadow-sm">
                  Customers: <span className="text-primary">{customers.length}</span>
                </div>
                <div className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 shadow-sm">
                  Orders Tracked: <span className="text-primary">{customers.reduce((sum, customer) => sum + customer.orders, 0)}</span>
                </div>
              </div>
            </div>

            {status === 'loading' && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center font-semibold text-slate-500">
                Loading customers...
              </div>
            )}
            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-600">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                >
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-primary to-secondary opacity-0 group-hover:opacity-10 transition rounded-full" />
                  <div className="relative z-10 space-y-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-semibold">Customer</p>
                        <h3 className="font-bold text-slate-900 text-xl">{customer.name}</h3>
                        <p className="text-xs text-slate-500">Joined {new Date(customer.joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      <span className="px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold">
                        {customer.orders} orders
                      </span>
                    </div>

                    <div className="space-y-3 text-sm text-slate-700 font-medium">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-primary" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-primary" />
                        <span>{customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-primary" />
                        <span>{customer.city}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="border border-slate-100 rounded-2xl p-3 bg-gradient-to-br from-slate-50 to-slate-100">
                        <p className="text-xs text-slate-500 uppercase tracking-[0.2em]">Total Spent</p>
                        <p className="font-bold text-slate-900 text-lg mt-1">Rs. {formatCurrency(customer.spent)}</p>
                      </div>
                      <div className="border border-slate-100 rounded-2xl p-3 bg-gradient-to-br from-slate-50 to-slate-100">
                        <p className="text-xs text-slate-500 uppercase tracking-[0.2em]">Last order</p>
                        <p className="font-bold text-slate-900 text-lg mt-1">{new Date(customer.lastOrder ?? customer.joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {status !== 'loading' && filteredCustomers.length === 0 && (
              <div className="text-center py-16">
                <p className="text-slate-500 text-lg font-semibold">No customers found</p>
                <p className="text-slate-400 text-sm mt-2">Try widening your search or adjust filters</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
