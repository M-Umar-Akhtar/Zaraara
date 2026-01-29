import React from "react";
import { Package, MapPin, Calendar, ShoppingBag } from "lucide-react";
export default function OrderCard({ order }) {
  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "PLACED": return "bg-blue-100 text-blue-700";
      case "SHIPPED": return "bg-yellow-100 text-yellow-700";
      case "DELIVERED": return "bg-green-100 text-green-700";
      case "CANCELLED": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };
  const formatDate = (dateString) => {
    if (!dateString || dateString === "pending") return "Pending";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm max-w-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-red-600" />
          <span className="font-semibold text-sm text-gray-800">
            #{order.orderNumber}
          </span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </div>
      {/* Price Summary */}
      <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-1">
        <div className="flex justify-between text-xs text-gray-600">
          <span>Subtotal</span>
          <span>Rs {order.subtotal}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between text-xs text-green-600">
            <span>Discount</span>
            <span>-Rs {order.discount}</span>
          </div>
        )}
        <div className="flex justify-between text-xs text-gray-600">
          <span>Shipping</span>
          <span>Rs {order.shipping}</span>
        </div>
        <div className="flex justify-between text-sm font-semibold text-gray-800 pt-1 border-t border-gray-200">
          <span>Total</span>
          <span>Rs {order.total} PKR</span>
        </div>
      </div>
      {/* Shipping Address */}
      <div className="flex items-start gap-2 mb-3">
        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-gray-600 leading-relaxed">
          {order.shippingAddress}
        </p>
      </div>
      {/* Order Dates */}
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <div className="text-xs text-gray-600">
          <span>Placed: {formatDate(order.placedAt)}</span>
        </div>
      </div>
      {/* Items */}
      {order.items && order.items.length > 0 && (
        <div className="border-t border-gray-100 pt-3">
          <div className="flex items-center gap-1 mb-2">
            <ShoppingBag className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-700">Items ({order.items.length})</span>
          </div>
          <div className="space-y-1">
            {order.items.map((item, idx) => (
              <div key={idx} className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                Product #{item.productId} × {item.quantity} — Rs {item.price}
                {(item.size || item.color) && (
                  <span className="text-gray-400 ml-1">
                    ({item.size || "No size"}, {item.color || "No color"})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}