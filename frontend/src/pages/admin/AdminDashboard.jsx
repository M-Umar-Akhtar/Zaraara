import React, { useEffect, useMemo, useState } from "react";
import {
  ShoppingBag,
  Package,
  TrendingUp,
  Users,
  ChevronRight,
  X,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import { useTheme } from "../../context/ThemeContext";
import fetchApi, { buildApiUrl } from "../../utils/apiClient";

const COLOR_PALETTE = [
  { color: "from-blue-500 to-blue-600", dotColor: "bg-blue-600", hex: "#2563eb" },
  { color: "from-teal-500 to-teal-600", dotColor: "bg-teal-500", hex: "#0d9488" },
  { color: "from-purple-500 to-purple-600", dotColor: "bg-purple-500", hex: "#7c3aed" },
  { color: "from-cyan-500 to-cyan-600", dotColor: "bg-cyan-500", hex: "#06b6d4" },
  { color: "from-amber-500 to-amber-600", dotColor: "bg-amber-500", hex: "#f59e0b" },
  { color: "from-rose-500 to-rose-600", dotColor: "bg-rose-500", hex: "#e11d48" },
];

const formatCurrency = (value) =>
  typeof value === "number" ? `Rs. ${value.toLocaleString("en-PK")}` : "Rs. 0";

const formatPercentChange = (current, previous) => {
  if (!previous && current) return "+100%";
  if (!previous && !current) return "0%";
  const delta = ((current - previous) / Math.max(previous, 1)) * 100;
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)}%`;
};

const toDate = (value) => (value ? new Date(value) : null);

/* Components */
const StatCard = ({ icon: Icon, label, value, change, iconBg, theme }) => (
  <div
    className={`rounded-xl p-6 shadow-sm transition-all hover:shadow-md ${
      theme === "dark" ? "bg-slate-800 border border-slate-700" : "bg-white border border-slate-100"
    }`}
  >
    <div className="flex items-start gap-4">
      <div className={`${iconBg} p-3 rounded-xl`}>
        <Icon size={24} className="text-white" />
      </div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
          {label}
        </p>
        <p className={`text-2xl font-bold mt-1 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
          {value}
        </p>
        <p className="text-sm font-semibold text-emerald-600 mt-1">{change}</p>
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const variants = {
    PLACED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    PACKING: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    SHIPPED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    DELIVERED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    CANCELLED: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${variants[status] ?? "bg-slate-100 text-slate-700"}`}>
      {status ?? "Unknown"}
    </span>
  );
};

const getPeriodWindow = (days) => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(end.getDate() - days + 1);
  start.setHours(0, 0, 0, 0);
  return { start, end };
};

const sumOrdersInRange = (orders, start, end) =>
  orders.reduce((acc, order) => {
    const createdAt = toDate(order.createdAt);
    if (!createdAt || createdAt < start || createdAt > end) return acc;
    return acc + (Number(order.total) || 0);
  }, 0);

const countOrdersInRange = (orders, start, end) =>
  orders.reduce((acc, order) => {
    const createdAt = toDate(order.createdAt);
    if (!createdAt || createdAt < start || createdAt > end) return acc;
    return acc + 1;
  }, 0);

const countUniqueCustomers = (orders, start, end) => {
  const keys = new Set();
  orders.forEach((order) => {
    const createdAt = toDate(order.createdAt);
    if (!createdAt || createdAt < start || createdAt > end) return;
    const key = order.customerEmail || order.customerId || order.customerName || order.id;
    if (key) keys.add(key);
  });
  return keys.size;
};

const buildSalesSeries = (orders, days, points = 20) => {
  if (!orders.length) return [];
  const { start, end } = getPeriodWindow(days);
  const bucketSize = Math.max(1, Math.ceil(days / points));
  const buckets = [];

  for (let i = 0; i < points; i += 1) {
    const bucketStart = new Date(start);
    bucketStart.setDate(start.getDate() + i * bucketSize);
    if (bucketStart > end) break;
    const bucketEnd = new Date(bucketStart);
    bucketEnd.setDate(bucketStart.getDate() + bucketSize - 1);
    bucketEnd.setHours(23, 59, 59, 999);
    if (bucketEnd > end) bucketEnd.setTime(end.getTime());

    const prevStart = new Date(bucketStart);
    prevStart.setDate(bucketStart.getDate() - days);
    const prevEnd = new Date(bucketEnd);
    prevEnd.setDate(bucketEnd.getDate() - days);

    buckets.push({
      name: bucketStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      sales1: sumOrdersInRange(orders, bucketStart, bucketEnd),
      sales2: sumOrdersInRange(orders, prevStart, prevEnd),
    });
  }

  return buckets;
};

/* Main Dashboard */
export default function AdminDashboard() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("month");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const [dashboardStatus, setDashboardStatus] = useState("loading");
  const [dashboardError, setDashboardError] = useState("");
  const [orders, setOrders] = useState([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const loadDashboard = async () => {
      setDashboardStatus("loading");
      setDashboardError("");
      try {
        const pageLimit = 50;
        const maxPages = 4;
        const fetchOrdersPaged = async () => {
          const firstPage = await fetchApi(buildApiUrl("/support/orders", { page: 1, limit: pageLimit }));
          const totalPages = Math.min(firstPage.totalPages ?? 1, maxPages);
          const pages = [firstPage];

          if (totalPages > 1) {
            const rest = await Promise.all(
              Array.from({ length: totalPages - 1 }, (_, index) =>
                fetchApi(buildApiUrl("/support/orders", { page: index + 2, limit: pageLimit }))
              )
            );
            pages.push(...rest);
          }

          const combinedOrders = pages.flatMap((payload) => payload.orders ?? []);
          const total = pages[0]?.total ?? combinedOrders.length;
          return { orders: combinedOrders, total };
        };

        const [ordersPayload, productsPayload, categoriesPayload] = await Promise.all([
          fetchOrdersPaged(),
          fetchApi("/products"),
          fetchApi("/categories"),
        ]);
        if (!isMounted) return;
        const fetchedOrders = ordersPayload.orders ?? [];
        setOrders(fetchedOrders);
        setOrdersTotal(ordersPayload.total ?? fetchedOrders.length);
        setProducts(productsPayload.items ?? []);
        setCategories(categoriesPayload.categories ?? []);
        setDashboardStatus("success");
      } catch (error) {
        if (!isMounted) return;
        setDashboardError(error.message ?? "Unable to load dashboard data.");
        setDashboardStatus("error");
      }
    };

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const aDate = toDate(a.createdAt)?.getTime() ?? 0;
      const bDate = toDate(b.createdAt)?.getTime() ?? 0;
      return bDate - aDate;
    });
  }, [orders]);

  const recentOrders = useMemo(() => sortedOrders.slice(0, 5), [sortedOrders]);

  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  }, [orders]);

  const totalCustomers = useMemo(() => countUniqueCustomers(orders, new Date(0), new Date()), [orders]);

  const { currentOrdersCount, previousOrdersCount, currentRevenue, previousRevenue, currentCustomers, previousCustomers } = useMemo(() => {
    const currentWindow = getPeriodWindow(30);
    const previousEnd = new Date(currentWindow.start);
    previousEnd.setDate(currentWindow.start.getDate() - 1);
    previousEnd.setHours(23, 59, 59, 999);
    const previousStart = new Date(previousEnd);
    previousStart.setDate(previousEnd.getDate() - 29);
    previousStart.setHours(0, 0, 0, 0);

    return {
      currentOrdersCount: countOrdersInRange(orders, currentWindow.start, currentWindow.end),
      previousOrdersCount: countOrdersInRange(orders, previousStart, previousEnd),
      currentRevenue: sumOrdersInRange(orders, currentWindow.start, currentWindow.end),
      previousRevenue: sumOrdersInRange(orders, previousStart, previousEnd),
      currentCustomers: countUniqueCustomers(orders, currentWindow.start, currentWindow.end),
      previousCustomers: countUniqueCustomers(orders, previousStart, previousEnd),
    };
  }, [orders]);

  const stats = useMemo(() => [
    {
      label: "Total Orders",
      value: ordersTotal.toLocaleString("en-PK"),
      change: formatPercentChange(currentOrdersCount, previousOrdersCount),
      icon: ShoppingBag,
      iconBg: "bg-orange-500",
    },
    {
      label: "Total Products",
      value: products.length.toLocaleString("en-PK"),
      change: products.length ? "Live" : "0%",
      icon: Package,
      iconBg: "bg-purple-500",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(totalRevenue),
      change: formatPercentChange(currentRevenue, previousRevenue),
      icon: TrendingUp,
      iconBg: "bg-emerald-500",
    },
    {
      label: "Total Customers",
      value: totalCustomers.toLocaleString("en-PK"),
      change: formatPercentChange(currentCustomers, previousCustomers),
      icon: Users,
      iconBg: "bg-orange-400",
    },
  ], [currentCustomers, currentOrdersCount, currentRevenue, ordersTotal, previousCustomers, previousOrdersCount, previousRevenue, products.length, totalCustomers, totalRevenue]);

  const periodDays = useMemo(() => {
    const map = { month: 30, "3months": 90, "6months": 180 };
    return map[activeTab] ?? 30;
  }, [activeTab]);

  const salesData = useMemo(() => buildSalesSeries(sortedOrders, periodDays), [periodDays, sortedOrders]);

  const topCategories = useMemo(() => {
    if (!products.length && !categories.length) return [];
    const categoryMap = new Map();
    categories.forEach((cat) => {
      categoryMap.set(cat.slug, { name: cat.name, count: 0 });
    });
    products.forEach((product) => {
      const slug = product.categorySlug || product.category || product.categoryId;
      const key = slug ? String(slug) : "uncategorized";
      if (!categoryMap.has(key)) {
        const label = key === "uncategorized" ? "Uncategorized" : key.charAt(0).toUpperCase() + key.slice(1);
        categoryMap.set(key, { name: label, count: 0 });
      }
      const entry = categoryMap.get(key);
      entry.count += 1;
    });
    const totalCount = Math.max(1, Array.from(categoryMap.values()).reduce((sum, item) => sum + item.count, 0));
    return Array.from(categoryMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
      .map((cat, index) => {
        const palette = COLOR_PALETTE[index % COLOR_PALETTE.length];
        return {
          name: cat.name,
          value: Math.round((cat.count / totalCount) * 100),
          count: cat.count,
          color: palette.color,
          dotColor: palette.dotColor,
          hex: palette.hex,
        };
      });
  }, [categories, products]);

  const donutSegments = useMemo(() => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;
    return topCategories.map((cat) => {
      const length = (cat.value / 100) * circumference;
      const segment = { ...cat, length, offset, circumference };
      offset += length;
      return segment;
    });
  }, [topCategories]);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  return (
    <div className={`flex min-h-screen ${theme === "dark" ? "bg-slate-900" : "bg-slate-50"}`}>
      <AdminSidebar />

      <div className="flex-1 ml-64">
        <AdminHeader />

        <main className="p-8 space-y-6">
          {/* Dashboard Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                Dashboard
              </h1>
              <p className={`mt-1 text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                Welcome back! Here's your store's performance today.
              </p>
            </div>
            <div className="text-right">
              <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                Last updated: Today at {getCurrentTime()}
              </p>
              <button
                className={`mt-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition shadow-sm hover:shadow ${
                  theme === "dark"
                    ? "bg-slate-800 text-white border border-slate-700 hover:bg-slate-700"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                📊 Export Report
              </button>
            </div>
          </div>

          {dashboardStatus === "loading" && (
            <div className={`rounded-xl border border-dashed p-6 text-sm font-semibold ${theme === "dark" ? "border-slate-700 bg-slate-800 text-slate-400" : "border-slate-200 bg-white text-slate-600"}`}>
              Syncing live analytics from orders, products, and categories...
            </div>
          )}
          {dashboardStatus === "error" && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-600">
              {dashboardError}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} theme={theme} />
            ))}
          </div>

          {/* Chatbot Manager */}
          <div
            className={`rounded-2xl p-6 shadow-sm border flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 ${
              theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
            }`}
          >
            <div>
              <p className={`text-xs uppercase tracking-[0.3em] ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                AI Assistant Hub
              </p>
              <h2 className={`text-2xl font-bold mt-2 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                Chatbot Manager (Coming Soon)
              </h2>
              <p className={`mt-2 text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                Reserve space to configure the support chatbot, connect knowledge bases, and launch automated workflows.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition shadow-sm hover:shadow ${
                  theme === "dark"
                    ? "bg-slate-700 text-white hover:bg-slate-600"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                Open Chatbot Manager
              </button>
              <button
                type="button"
                className={`px-6 py-3 rounded-xl text-sm font-semibold border transition ${
                  theme === "dark"
                    ? "border-slate-600 text-slate-300 hover:bg-slate-700"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Configure Later
              </button>
            </div>
          </div>

          {/* Sales Overview & Top Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Overview */}
            <div
              className={`lg:col-span-2 rounded-xl p-6 shadow-sm ${
                theme === "dark" ? "bg-slate-800 border border-slate-700" : "bg-white border border-slate-100"
              }`}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                  Sales Overview
                </h2>
                <div className="flex gap-2">
                  {[
                    { id: "month", label: "This Month" },
                    { id: "3months", label: "Last 3 Months" },
                    { id: "6months", label: "Last 6 Months" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
                        activeTab === tab.id
                          ? theme === "dark"
                            ? "bg-slate-700 text-white"
                            : "bg-slate-100 text-slate-900"
                          : theme === "dark"
                          ? "text-slate-400 hover:bg-slate-700/50"
                          : "text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart */}
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={salesData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorSales1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorSales2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme === "dark" ? "#334155" : "#e2e8f0"}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      stroke={theme === "dark" ? "#64748b" : "#94a3b8"}
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke={theme === "dark" ? "#64748b" : "#94a3b8"}
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `${(value / 1000).toFixed(1)}K`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
                        border: `1px solid ${theme === "dark" ? "#334155" : "#e2e8f0"}`,
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      labelStyle={{ color: theme === "dark" ? "#f1f5f9" : "#0f172a" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales2"
                      stroke="#14b8a6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorSales2)"
                    />
                    <Area
                      type="monotone"
                      dataKey="sales1"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorSales1)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Categories */}
            <div
              className={`rounded-xl p-6 shadow-sm ${
                theme === "dark" ? "bg-slate-800 border border-slate-700" : "bg-white border border-slate-100"
              }`}
            >
              <h2 className={`text-lg font-bold mb-6 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                Top Categories
              </h2>

              {/* Progress Bars */}
              <div className="space-y-5 mb-6">
                {topCategories.length === 0 ? (
                  <div className={`rounded-xl border border-dashed p-4 text-sm ${theme === "dark" ? "border-slate-700 text-slate-400" : "border-slate-200 text-slate-500"}`}>
                    No category insights yet. Add products to see category distribution.
                  </div>
                ) : (
                  topCategories.map((cat) => (
                    <div key={cat.name}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-sm font-medium ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                          {cat.name}
                        </span>
                        <span className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                          {cat.value}%
                        </span>
                      </div>
                      <div className={`h-2 rounded-full ${theme === "dark" ? "bg-slate-700" : "bg-slate-100"}`}>
                        <div
                          className={`h-full bg-gradient-to-r ${cat.color} rounded-full transition-all duration-700`}
                          style={{ width: `${cat.value}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Donut Chart */}
              <div className="flex justify-center my-6">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    {donutSegments.map((segment) => (
                      <circle
                        key={segment.name}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={segment.hex}
                        strokeWidth="20"
                        strokeDasharray={`${segment.length} ${segment.circumference}`}
                        strokeDashoffset={-segment.offset}
                        transform="rotate(-90 50 50)"
                      />
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                        {topCategories.length ? "100%" : "0%"}
                      </p>
                      <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Total</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-3">
                {topCategories.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <span className={`w-3 h-3 ${cat.dotColor} rounded-full`} />
                    <span className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                      {cat.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div
            className={`rounded-xl overflow-hidden shadow-sm ${
              theme === "dark" ? "bg-slate-800 border border-slate-700" : "bg-white border border-slate-100"
            }`}
          >
            <div className={`px-6 py-5 border-b flex justify-between items-center ${theme === "dark" ? "border-slate-700" : "border-slate-200"}`}>
              <h2 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                Recent Orders
              </h2>
              <button className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition">
                View All Orders
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={theme === "dark" ? "bg-slate-700/30" : "bg-slate-50"}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                      Order ID
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                      Customer
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                      Amount
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                      Status
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                      Placed
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.orderNumber ?? order.id}
                      className={`border-t transition ${
                        theme === "dark"
                          ? "border-slate-700 hover:bg-slate-700/30"
                          : "border-slate-100 hover:bg-slate-50"
                      }`}
                    >
                      <td className={`px-6 py-4 text-sm font-semibold ${theme === "dark" ? "text-slate-300" : "text-slate-900"}`}>
                        {order.orderNumber ?? order.id}
                      </td>
                      <td className={`px-6 py-4 text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                        {order.customerName ?? order.customer ?? "Customer"}
                      </td>
                      <td className={`px-6 py-4 text-sm font-semibold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                        {formatCurrency(Number(order.total) || 0)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                          : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleViewDetails(order)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && dashboardStatus !== "loading" && (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-sm font-semibold text-slate-500">
                        No recent orders yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Details Modal */}
          {showOrderModal && selectedOrder && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div 
                className={`max-w-2xl w-full rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto ${
                  theme === "dark" ? "bg-slate-800" : "bg-white"
                }`}
              >
                {/* Modal Header */}
                <div className={`sticky top-0 px-6 py-4 border-b flex items-center justify-between ${
                  theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                }`}>
                  <h2 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                    Order Details
                  </h2>
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className={`p-2 rounded-lg transition ${
                      theme === "dark" 
                        ? "hover:bg-slate-700 text-slate-400 hover:text-white" 
                        : "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {/* Order Info */}
                  <div className={`p-4 rounded-xl ${
                    theme === "dark" ? "bg-slate-700/50" : "bg-slate-50"
                  }`}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className={`text-sm font-semibold ${
                          theme === "dark" ? "text-slate-400" : "text-slate-600"
                        }`}>
                          Order ID
                        </p>
                        <p className={`text-lg font-bold ${
                          theme === "dark" ? "text-white" : "text-slate-900"
                        }`}>
                          {selectedOrder.orderNumber ?? selectedOrder.id ?? "—"}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${
                          theme === "dark" ? "text-slate-400" : "text-slate-600"
                        }`}>
                          Total Amount
                        </p>
                        <p className={`text-lg font-bold ${
                          theme === "dark" ? "text-white" : "text-slate-900"
                        }`}>
                          {formatCurrency(Number(selectedOrder.total) || 0)}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${
                          theme === "dark" ? "text-slate-400" : "text-slate-600"
                        }`}>
                          Order Date
                        </p>
                        <p className={`text-base font-semibold ${
                          theme === "dark" ? "text-slate-300" : "text-slate-700"
                        }`}>
                          {selectedOrder.createdAt
                            ? new Date(selectedOrder.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${
                          theme === "dark" ? "text-slate-400" : "text-slate-600"
                        }`}>
                          Total Items
                        </p>
                        <p className={`text-base font-semibold ${
                          theme === "dark" ? "text-slate-300" : "text-slate-700"
                        }`}>
                          {selectedOrder.itemsCount ?? selectedOrder.items?.length ?? "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div>
                    <h3 className={`text-lg font-bold mb-4 ${
                      theme === "dark" ? "text-white" : "text-slate-900"
                    }`}>
                      Customer Information
                    </h3>
                    <div className={`p-4 rounded-xl space-y-4 ${
                      theme === "dark" ? "bg-slate-700/50" : "bg-slate-50"
                    }`}>
                      {/* Name */}
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          theme === "dark" ? "bg-slate-600" : "bg-white"
                        }`}>
                          <Users size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <p className={`text-xs font-semibold ${
                            theme === "dark" ? "text-slate-400" : "text-slate-600"
                          }`}>
                            Customer Name
                          </p>
                          <p className={`text-base font-bold ${
                            theme === "dark" ? "text-white" : "text-slate-900"
                          }`}>
                            {selectedOrder.customerName ?? selectedOrder.customer ?? "Customer"}
                          </p>
                        </div>
                      </div>

                      {/* Email */}
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          theme === "dark" ? "bg-slate-600" : "bg-white"
                        }`}>
                          <Mail size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <p className={`text-xs font-semibold ${
                            theme === "dark" ? "text-slate-400" : "text-slate-600"
                          }`}>
                            Email Address
                          </p>
                          <p className={`text-base font-semibold ${
                            theme === "dark" ? "text-slate-300" : "text-slate-700"
                          }`}>
                            {selectedOrder.customerEmail ?? selectedOrder.email ?? "—"}
                          </p>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          theme === "dark" ? "bg-slate-600" : "bg-white"
                        }`}>
                          <Phone size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <p className={`text-xs font-semibold ${
                            theme === "dark" ? "text-slate-400" : "text-slate-600"
                          }`}>
                            Phone Number
                          </p>
                          <p className={`text-base font-semibold ${
                            theme === "dark" ? "text-slate-300" : "text-slate-700"
                          }`}>
                            {selectedOrder.customerPhone ?? selectedOrder.phone ?? "—"}
                          </p>
                        </div>
                      </div>

                      {/* Address */}
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          theme === "dark" ? "bg-slate-600" : "bg-white"
                        }`}>
                          <MapPin size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <p className={`text-xs font-semibold ${
                            theme === "dark" ? "text-slate-400" : "text-slate-600"
                          }`}>
                            Shipping Address
                          </p>
                          <p className={`text-base font-semibold ${
                            theme === "dark" ? "text-slate-300" : "text-slate-700"
                          }`}>
                            {selectedOrder.shipLine1
                              ? `${selectedOrder.shipLine1}${selectedOrder.shipLine2 ? `, ${selectedOrder.shipLine2}` : ""}, ${selectedOrder.shipCity ?? ""} ${selectedOrder.shipState ?? ""} ${selectedOrder.shipPostal ?? ""}`.trim()
                              : "Shipping address not available"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Status */}
                  <div>
                    <h3 className={`text-lg font-bold mb-4 ${
                      theme === "dark" ? "text-white" : "text-slate-900"
                    }`}>
                      Order Status
                    </h3>
                    <div className="flex gap-3">
                      <StatusBadge status={selectedOrder.status} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => setShowOrderModal(false)}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition"
                    >
                      Close
                    </button>
                    <button className="flex-1 px-6 py-3 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 transition">
                      Contact Customer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
