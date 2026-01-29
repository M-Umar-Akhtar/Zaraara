import React, { useEffect, useMemo, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import fetchApi, { buildApiUrl } from '../../utils/apiClient';

const formatCurrency = (value) =>
  typeof value === 'number' ? `Rs. ${value.toLocaleString('en-PK')}` : 'Rs. 0';

const toDate = (value) => (value ? new Date(value) : null);

const buildMonthlyRevenueSeries = (orders, months = 6) => {
  if (!orders.length) return [];
  const now = new Date();
  const series = [];

  for (let i = months - 1; i >= 0; i -= 1) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
    const total = orders.reduce((sum, order) => {
      const createdAt = toDate(order.createdAt);
      if (!createdAt || createdAt < start || createdAt > end) return sum;
      return sum + (Number(order.total) || 0);
    }, 0);
    series.push({
      name: start.toLocaleDateString('en-US', { month: 'short' }),
      revenue: total,
    });
  }

  return series;
};

export default function AdminAnalytics() {
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      setStatus('loading');
      setError('');
      try {
        const pageLimit = 50;
        const maxPages = 4;
        const fetchOrdersPaged = async () => {
          const firstPage = await fetchApi(buildApiUrl('/support/orders', { page: 1, limit: pageLimit }));
          const totalPages = Math.min(firstPage.totalPages ?? 1, maxPages);
          const pages = [firstPage];

          if (totalPages > 1) {
            const rest = await Promise.all(
              Array.from({ length: totalPages - 1 }, (_, index) =>
                fetchApi(buildApiUrl('/support/orders', { page: index + 2, limit: pageLimit }))
              )
            );
            pages.push(...rest);
          }

          return pages.flatMap((payload) => payload.orders ?? []);
        };

        const [ordersData, productsPayload, categoriesPayload] = await Promise.all([
          fetchOrdersPaged(),
          fetchApi('/products'),
          fetchApi('/categories'),
        ]);

        if (!isMounted) return;
        setOrders(ordersData);
        setProducts(productsPayload.items ?? []);
        setCategories(categoriesPayload.categories ?? []);
        setStatus('success');
      } catch (err) {
        if (!isMounted) return;
        setError(err.message ?? 'Unable to load analytics data.');
        setStatus('error');
      }
    };

    loadAnalytics();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0),
    [orders]
  );

  const averageOrderValue = useMemo(() => {
    if (!orders.length) return 0;
    return totalRevenue / orders.length;
  }, [orders.length, totalRevenue]);

  const deliveredRate = useMemo(() => {
    if (!orders.length) return 0;
    const delivered = orders.filter((order) => order.status === 'DELIVERED').length;
    return (delivered / orders.length) * 100;
  }, [orders]);

  const cancelledRate = useMemo(() => {
    if (!orders.length) return 0;
    const cancelled = orders.filter((order) => order.status === 'CANCELLED').length;
    return (cancelled / orders.length) * 100;
  }, [orders]);

  const revenueSeries = useMemo(() => buildMonthlyRevenueSeries(orders, 6), [orders]);

  const categoryBreakdown = useMemo(() => {
    if (!products.length && !categories.length) return [];
    const categoryMap = new Map();
    categories.forEach((cat) => {
      categoryMap.set(cat.slug, { name: cat.name, count: 0 });
    });
    products.forEach((product) => {
      const slug = product.categorySlug || product.category || product.categoryId;
      const key = slug ? String(slug) : 'uncategorized';
      if (!categoryMap.has(key)) {
        const label = key === 'uncategorized' ? 'Uncategorized' : key.charAt(0).toUpperCase() + key.slice(1);
        categoryMap.set(key, { name: label, count: 0 });
      }
      const entry = categoryMap.get(key);
      entry.count += 1;
    });
    const totalCount = Math.max(1, Array.from(categoryMap.values()).reduce((sum, item) => sum + item.count, 0));
    const palette = ['#3b82f6', '#22c55e', '#8b5cf6', '#60a5fa', '#f59e0b', '#ef4444'];
    return Array.from(categoryMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
      .map((cat, index) => ({
        name: cat.name,
        value: Math.round((cat.count / totalCount) * 100),
        count: cat.count,
        color: palette[index % palette.length],
      }));
  }, [categories, products]);

  const categoryGradient = useMemo(() => {
    if (!categoryBreakdown.length) return 'conic-gradient(#e2e8f0 0% 100%)';
    let offset = 0;
    const segments = categoryBreakdown.map((cat) => {
      const start = offset;
      const end = offset + cat.value;
      offset = end;
      return `${cat.color} ${start}% ${end}%`;
    });
    if (offset < 100) {
      segments.push(`#e2e8f0 ${offset}% 100%`);
    }
    return `conic-gradient(${segments.join(', ')})`;
  }, [categoryBreakdown]);

  const topProducts = useMemo(() => {
    if (!orders.length) return [];
    const productMap = new Map();
    orders.forEach((order) => {
      (order.items ?? []).forEach((item) => {
        const name = item.product?.name || `Product #${item.productId}`;
        const key = item.productId ?? name;
        if (!productMap.has(key)) {
          productMap.set(key, { name, sales: 0, revenue: 0 });
        }
        const entry = productMap.get(key);
        const qty = Number(item.quantity) || 0;
        const lineTotal = Number(item.lineTotal) || (Number(item.unitPrice) || 0) * qty;
        entry.sales += qty;
        entry.revenue += lineTotal;
      });
    });
    return Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orders]);

  const metrics = [
    { label: 'Total Revenue', value: formatCurrency(totalRevenue), change: `${orders.length} orders`, trend: 'up', icon: TrendingUp },
    { label: 'Average Order Value', value: formatCurrency(averageOrderValue), change: 'Live', trend: 'up', icon: TrendingUp },
    { label: 'Delivered Rate', value: `${deliveredRate.toFixed(1)}%`, change: 'Delivered', trend: deliveredRate >= 50 ? 'up' : 'down', icon: deliveredRate >= 50 ? TrendingUp : TrendingDown },
    { label: 'Cancelled Rate', value: `${cancelledRate.toFixed(1)}%`, change: 'Cancelled', trend: cancelledRate <= 5 ? 'up' : 'down', icon: cancelledRate <= 5 ? TrendingUp : TrendingDown },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        <AdminHeader />

        <main className="flex-1 overflow-auto">
          <div className="p-8 space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
                Analytics
              </h1>
              <p className="text-slate-600 mt-2 font-medium">Deep insights into your store's performance and customer behavior.</p>
            </div>

            {status === 'loading' && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm font-semibold text-slate-600">
                Syncing live analytics from orders, products, and categories...
              </div>
            )}
            {status === 'error' && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-600">
                {error}
              </div>
            )}

            {/* Metrics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <div
                    key={metric.label}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl transition group relative overflow-hidden"
                  >
                    {/* Gradient Background */}
                    <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${metric.trend === 'up'
                      ? 'from-green-500 to-emerald-500'
                      : 'from-red-500 to-pink-500'
                      } opacity-0 group-hover:opacity-5 transition rounded-full`}></div>

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-slate-600 text-sm font-semibold mb-1">{metric.label}</p>
                          <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
                        </div>
                        <div className={`${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'} group-hover:scale-110 transition`}>
                          <Icon size={28} className="font-bold" />
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full inline-block border ${metric.trend === 'up'
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : 'bg-red-100 text-red-700 border-red-200'
                        }`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition">
                <h2 className="text-xl font-bold text-slate-900 mb-6">📈 Revenue Trend</h2>
                <div className="relative h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl overflow-hidden p-4">
                  {revenueSeries.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm font-semibold text-slate-500">
                      No revenue data yet.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueSeries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(value) => `${(value / 1000).toFixed(1)}K`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#22c55e"
                          strokeWidth={2}
                          fill="url(#analyticsGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>

              </div>

              {/* Category Distribution */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition">
                <h2 className="text-xl font-bold text-slate-900 mb-6">🥧 Sales by Category</h2>
                <div className="h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center gap-8 p-6">

                  {/* Donut Chart */}
                  <div
                    className="relative w-40 h-40 rounded-full"
                    style={{
                      background: categoryGradient,
                    }}
                  >
                    {/* Center Hole */}
                    <div className="absolute inset-6 bg-white rounded-full flex flex-col items-center justify-center">
                      <p className="text-xs text-slate-500 font-semibold">Total</p>
                      <p className="text-lg font-bold text-slate-900">{categoryBreakdown.length ? '100%' : '0%'}</p>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="space-y-3 text-sm text-slate-700 font-semibold">
                    {categoryBreakdown.length === 0 ? (
                      <div className="text-sm text-slate-500">No category data yet.</div>
                    ) : (
                      categoryBreakdown.map((cat) => (
                        <div key={cat.name} className="flex items-center gap-3">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                          {cat.name} <span className="ml-auto text-slate-500">{cat.value}%</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition">
              <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                <h2 className="text-xl font-bold text-slate-900">🏆 Top Selling Products</h2>
                <p className="text-sm text-slate-600 mt-1 font-medium">Your best performing products this month</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Sales</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {topProducts.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-6 text-center text-sm font-semibold text-slate-500">
                          No product sales yet.
                        </td>
                      </tr>
                    ) : (
                      topProducts.map((product) => (
                        <tr key={product.name} className="hover:bg-slate-50/50 transition">
                          <td className="px-6 py-4 font-bold text-slate-900">{product.name}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-700">{product.sales} units</td>
                          <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(product.revenue)}</td>
                          <td className="px-6 py-4 font-bold text-sm text-slate-500">Live</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
