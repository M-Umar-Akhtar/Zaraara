import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import fetchApi, { buildApiUrl } from '../utils/apiClient';
import { useApp } from '../context/AppContext';

const formatCurrency = (value) => (typeof value === 'number' ? value.toLocaleString('en-PK') : '0');
const statusOrder = { PLACED: 1, PACKING: 2, SHIPPED: 3, DELIVERED: 4, CANCELLED: 5 };
const staffRoles = ['ADMIN', 'SUPPORT'];
const timeline = [
  { key: 'PLACED', label: 'Order Confirmed' },
  { key: 'PACKING', label: 'Order Packed' },
  { key: 'SHIPPED', label: 'Shipped' },
  { key: 'DELIVERED', label: 'Delivered' },
];
const adminStatusOptions = [
  { status: 'PACKING', label: 'Mark as Packed' },
  { status: 'SHIPPED', label: 'Mark as Shipped' },
  { status: 'DELIVERED', label: 'Mark as Delivered' },
];

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const { user } = useApp();
  const normalizedRole = user?.role?.toUpperCase();
  const [adminActionStatus, setAdminActionStatus] = useState('idle');
  const [adminActionError, setAdminActionError] = useState('');
  const [adminActionMessage, setAdminActionMessage] = useState('');
  const [adminReason, setAdminReason] = useState('');
  useEffect(() => {
    if (!orderNumber) {
      setStatus('error');
      setError('Order number is missing from the URL.');
      return;
    }

    let isMounted = true;
    const fetchOrder = async () => {
      setStatus('loading');
      setError('');

      try {
        const url = email
          ? buildApiUrl(`/orders/${orderNumber}`, { email })
          : `/orders/${orderNumber}`;
        const response = await fetchApi(url);
        if (!isMounted) return;
        setOrder(response.order);
        setStatus('success');
      } catch (err) {
        if (!isMounted) return;
        setError(err.message ?? 'Unable to load order details.');
        setStatus('error');
      }
    };

    fetchOrder();
    return () => {
      isMounted = false;
    };
  }, [orderNumber, email]);

  const estimatedDelivery = useMemo(() => {
    if (order?.estimatedDeliveryDate) {
      return new Date(order.estimatedDeliveryDate);
    }
    const fallback = order?.createdAt ? new Date(order.createdAt) : new Date();
    fallback.setDate(fallback.getDate() + 6);
    return fallback;
  }, [order]);

  const currentStep = order ? statusOrder[order.status] ?? 0 : 0;
  const currentStatusValue = order ? statusOrder[order.status] ?? 0 : 0;
  const canModifyStatus = Boolean(normalizedRole && staffRoles.includes(normalizedRole));

  const handleStatusChange = async (targetStatus) => {
    if (!orderNumber || !order) return;
    if (statusOrder[targetStatus] <= currentStatusValue) return;
    setAdminActionError('');
    setAdminActionMessage('');
    setAdminActionStatus('loading');
    try {
      const response = await fetchApi(`/support/orders/${orderNumber}/status`, {
        method: 'PATCH',
        body: {
          status: targetStatus,
          reason: adminReason || undefined,
        },
      });
      setOrder((prev) => (prev ? { ...prev, status: response.order.status } : prev));
      setAdminActionMessage(`Status updated to ${response.order.status}`);
      setAdminReason('');
    } catch (err) {
      setAdminActionError(err.message);
    } finally {
      setAdminActionStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container py-12">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <div className="mb-6">
            <CheckCircle className="w-20 h-20 mx-auto text-secondary" />
          </div>
          <h1 className="text-4xl font-bold text-primary mb-3">Order Management Console</h1>
          <p className="text-lg text-gray-600 mb-1">Review and act on order <span className="font-semibold text-secondary">#{orderNumber}</span></p>
          <p className="text-sm text-gray-400">Only admin/support can trigger status updates and view shipment details.</p>
        </div>

        {status === 'loading' && (
          <div className="max-w-4xl mx-auto rounded-3xl bg-gray-50 p-10 text-center font-semibold text-slate-600">
            Fetching your order details...
          </div>
        )}

        {status === 'error' && error && (
          <div className="max-w-4xl mx-auto rounded-3xl bg-rose-50 p-8 text-center text-lg font-semibold text-rose-600">
            {error}
          </div>
        )}

        {order && (
          <div className="space-y-10">
            <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 space-y-4">
                <h2 className="text-xl font-bold text-primary">Order Summary</h2>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Rs. {formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Rs. {formatCurrency(order.shipping)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-primary">
                    <span>Total</span>
                    <span>Rs. {formatCurrency(order.total)}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p><strong>Status:</strong> <span className="text-secondary font-semibold">{order.status}</span></p>
                  <p><strong>Placed on:</strong> {new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p><strong>Estimated Delivery:</strong> {estimatedDelivery.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm">
                <h2 className="text-xl font-bold text-primary">Shipping Address</h2>
                <p className="text-sm text-gray-700">{order.shipLine1}</p>
                {order.shipLine2 && <p className="text-sm text-gray-700">{order.shipLine2}</p>}
                <p className="text-sm text-gray-700">{order.shipCity}, {order.shipState ?? ''}</p>
                <p className="text-sm text-gray-700">{order.shipPostal} • {order.shipCountryCode}</p>
                <p className="text-sm text-gray-700">Contact: {order.customerName} • {order.customerEmail}</p>
              </div>
            </div>

            <section className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold text-primary mb-6">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div>
                      <p className="font-semibold text-slate-900">{item.product?.name ?? `Product #${item.productId}`}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      {item.selectedColor && <p className="text-xs text-gray-500">Color: {item.selectedColor}</p>}
                      {item.selectedSize && <p className="text-xs text-gray-500">Size: {item.selectedSize}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-secondary">Rs. {formatCurrency(item.lineTotal)}</p>
                      <p className="text-xs text-gray-400">Rs. {formatCurrency(item.unitPrice)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold text-primary mb-4">Shipping Status</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {timeline.map((step) => {
                  const stepActive = statusOrder[step.key] <= currentStep;
                  return (
                    <div
                      key={step.key}
                      className={`rounded-2xl border px-5 py-4 transition ${stepActive ? 'border-secondary bg-secondary/10 text-secondary' : 'border-gray-200 bg-white text-gray-600'}`}
                    >
                      <p className="text-xs uppercase tracking-[0.4em] font-semibold">{step.label}</p>
                      <p className="text-2xl font-black">{stepActive ? '✓' : '•'}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {canModifyStatus && order && (
              <section className="max-w-5xl mx-auto bg-emerald-50 border border-emerald-100/50 rounded-3xl p-6 space-y-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-2xl font-bold text-primary">Admin Shipping Controls</h2>
                  <p className="text-sm text-gray-500">Trigger the next fulfillment milestone for this order.</p>
                </div>
                {adminActionError && (
                  <div className="text-sm text-rose-600 font-semibold bg-rose-50 border border-rose-100 rounded-lg p-3">
                    {adminActionError}
                  </div>
                )}
                {adminActionMessage && (
                  <div className="text-sm text-emerald-800 font-semibold bg-emerald-100 border border-emerald-200 rounded-lg p-3">
                    {adminActionMessage}
                  </div>
                )}
                <label className="text-sm font-semibold text-gray-600">
                  Notes (optional)
                  <textarea
                    value={adminReason}
                    onChange={(e) => setAdminReason(e.target.value)}
                    placeholder="Something to include in the support log"
                    className="w-full mt-2 border border-gray-200 rounded-lg p-3 text-sm focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                    rows={3}
                  />
                </label>
                <div className="flex flex-wrap gap-3">
                  {adminStatusOptions.map((action) => {
                    const targetValue = statusOrder[action.status] ?? 0;
                    const disabled = targetValue <= currentStatusValue || adminActionStatus === 'loading';
                    return (
                      <button
                        type="button"
                        key={action.status}
                        disabled={disabled}
                        onClick={() => handleStatusChange(action.status)}
                        className={`px-6 py-3 rounded-2xl font-semibold transition focus:outline-none ${disabled ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-primary text-white hover:bg-secondary'}`}
                      >
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
