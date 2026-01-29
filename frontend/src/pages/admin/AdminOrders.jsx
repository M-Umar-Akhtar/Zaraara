import React, { useEffect, useMemo, useState } from 'react';
import { Eye, Download, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import fetchApi, { buildApiUrl } from '../../utils/apiClient';

const LIMIT = 10;
const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'PLACED', label: 'Placed' },
  { value: 'PACKING', label: 'Packing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];
const STATUS_COLORS = {
  PLACED: 'bg-blue-100 text-blue-700 border-blue-200',
  PACKING: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  SHIPPED: 'bg-purple-100 text-purple-700 border-purple-200',
  DELIVERED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-rose-100 text-rose-700 border-rose-200',
};

const formatCurrency = (value) => (typeof value === 'number' ? value.toLocaleString('en-PK') : '0');

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadOrders = async () => {
      setIsLoading(true);
      setError('');
      try {
        const params = {
          q: searchTerm.trim() || undefined,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          page,
          limit: LIMIT,
        };
        const response = await fetchApi(buildApiUrl('/support/orders', params));
        if (!isMounted) return;
        setOrders(response.orders ?? []);
        setTotal(response.total ?? 0);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message ?? 'Unable to load orders.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadOrders();
    return () => {
      isMounted = false;
    };
  }, [searchTerm, filterStatus, page]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / LIMIT)), [total]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleStatusChange = (event) => {
    setFilterStatus(event.target.value);
    setPage(1);
  };

  const handlePrev = () => setPage((prev) => Math.max(1, prev - 1));
  const handleNext = () => setPage((prev) => Math.min(totalPages, prev + 1));

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        <AdminHeader />

        <main className="flex-1 overflow-auto">
          <div className="p-8 space-y-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
                Orders
              </h1>
              <p className="text-slate-600 mt-2 font-medium">Track, manage, and fulfill customer orders efficiently.</p>
            </div>

            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-64 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by Order ID or customer..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition bg-white shadow-sm hover:shadow-md font-medium text-slate-700"
                />
              </div>
              <select
                value={filterStatus}
                onChange={handleStatusChange}
                className="px-6 py-3 border border-slate-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition bg-white shadow-sm hover:shadow-md font-semibold text-slate-700"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <button className="flex items-center gap-2 px-6 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition font-semibold text-slate-700 shadow-sm hover:shadow-md">
                <Download size={20} />
                Export
              </button>
            </div>

            {isLoading && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center font-semibold text-slate-500">
                Loading orders...
              </div>
            )}
            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-600">
                {error}
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {!isLoading && orders.map((order) => (
                      <tr key={order.orderNumber} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 font-bold text-primary">{order.orderNumber}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                          {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{order.customerName}</p>
                          <p className="text-xs text-slate-500">{order.customerEmail}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 rounded-full font-bold text-sm border border-blue-200">{order.itemsCount}</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">Rs. {formatCurrency(order.total)}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border inline-block ${STATUS_COLORS[order.status] ?? 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            to={`/order-confirmation/${order.orderNumber}?email=${encodeURIComponent(order.customerEmail ?? '')}`}
                            className="flex items-center gap-1 text-primary hover:text-secondary font-bold text-sm hover:bg-blue-50 px-3 py-2 rounded-lg transition hover:shadow-md"
                          >
                            <Eye size={16} />
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!isLoading && orders.length === 0 && (
                  <div className="p-12 text-center">
                    <p className="text-slate-500 font-semibold text-lg">📭 No orders found matching your criteria</p>
                    <p className="text-slate-400 text-sm mt-2">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600">
                Showing <span className="font-bold text-slate-900">{orders.length}</span> of <span className="font-bold text-slate-900">{total}</span> orders
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  disabled={page <= 1}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition font-semibold text-slate-700 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled
                  className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg shadow-lg transition font-semibold"
                >
                  {page}
                </button>
                <button
                  onClick={handleNext}
                  disabled={page >= totalPages}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition font-semibold text-slate-700 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
