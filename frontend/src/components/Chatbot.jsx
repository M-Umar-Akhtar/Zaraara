import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, MessageCircle, X, Upload, Camera, Image, ShoppingBag } from "lucide-react";
import { useApp } from "../context/AppContext";
import ProductCard from "./ProductCard";
import OrderCard from "./OrderCard";
export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatBoxRef = useRef(null);
  const { authToken } = useApp();
  const [token, setToken] = useState(authToken);
  // Virtual Try-On State
  const [tryOnImage, setTryOnImage] = useState(null);
  const [tryOnImagePreview, setTryOnImagePreview] = useState(null);
  const [productName, setProductName] = useState("");
  const [tryOnLoading, setTryOnLoading] = useState(false);
  const [tryOnResult, setTryOnResult] = useState(null);
  const fileInputRef = useRef(null);
  useEffect(() => {
    setToken(authToken);
  }, [authToken]);
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_CHATBOT_BACKEND_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          message: userMessage.text,
          authToken: authToken,
        }),
      });
      const data = await res.json();
      const botResponses = data.responses || [];
      const formattedBotMessages = botResponses.map((r) => ({
        role: "bot",
        content: r,
      }));
      setMessages((prev) => [...prev, ...formattedBotMessages]);
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setLoading(false);
    }
  };
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTryOnImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTryOnImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setTryOnResult(null);
    }
  };
  const handleTryOn = async () => {
    if (!tryOnImage || !productName.trim() || tryOnLoading) return;
    setTryOnLoading(true);
    setTryOnResult(null);
    try {
      const formData = new FormData();
      formData.append("image", tryOnImage);
      formData.append("productName", productName.trim());
      if (authToken) {
        formData.append("authToken", authToken);
      }
      const res = await fetch(`${import.meta.env.VITE_CHATBOT_BACKEND_URL}/tryon`, {
        method: "POST",
        headers: {
          ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {}),
        },
        body: formData,
      });
      const data = await res.json();
      setTryOnResult(data[0]);
      console.log("TRYON RESULT:", data);
    } catch (err) {
      console.error("Virtual try-on error:", err);
      setTryOnResult({ error: "Something went wrong. Please try again." });
    } finally {
      setTryOnLoading(false);
    }
  };
  const resetTryOn = () => {
    setTryOnImage(null);
    setTryOnImagePreview(null);
    setProductName("");
    setTryOnResult(null);
  };
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, loading]);
  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* Chat Bubble */}
      <button
        onClick={() => setIsOpen(true)}
        className={`
          w-16 h-16 rounded-full bg-gradient-to-br from-red-700 via-red-600 to-red-500 
          flex items-center justify-center cursor-pointer
          hover:scale-110 hover:shadow-2xl
          transition-all duration-300 ease-out
          ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}
        `}
        style={{ 
          boxShadow: '0 8px 30px rgba(220, 38, 38, 0.4), 0 4px 15px rgba(0, 0, 0, 0.1)',
          transitionProperty: 'transform, opacity, box-shadow'
        }}
        aria-label="Open chat"
      >
        <div className="relative">
          <MessageCircle className="w-7 h-7 text-white" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full" />
        </div>
      </button>
      {/* Chat Window */}
      <div 
        className={`
          absolute bottom-0 right-0 w-[600px] md:w-[650px] rounded-2xl overflow-hidden 
          bg-white border border-red-100
          transition-all duration-400 ease-out origin-bottom-right
          ${isOpen 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-0 opacity-0 translate-y-4 pointer-events-none'
          }
        `}
        style={{ 
          boxShadow: '0 20px 60px -15px rgba(220, 38, 38, 0.15), 0 8px 30px -10px rgba(0, 0, 0, 0.1)',
          transitionProperty: 'transform, opacity'
        }}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-red-700 via-red-600 to-red-700 p-4 border-b border-red-400/30">
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
              <h2 className="text-xl tracking-wide text-white font-semibold" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                Zaraara Assistant
              </h2>
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200 hover:rotate-90"
              aria-label="Close chat"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>
        {/* Tabs */}
        <div className="flex border-b border-red-100 bg-gradient-to-b from-red-50/50 to-white">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all duration-300 relative ${
              activeTab === "chat"
                ? "text-red-700"
                : "text-gray-500 hover:text-red-600"
            }`}
            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat</span>
            {activeTab === "chat" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("tryon")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all duration-300 relative ${
              activeTab === "tryon"
                ? "text-red-700"
                : "text-gray-500 hover:text-red-600"
            }`}
            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
          >
            <Camera className="w-4 h-4" />
            <span>Virtual Try-On</span>
            {activeTab === "tryon" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600" />
            )}
          </button>
        </div>
        {/* Chat Tab Content */}
        {activeTab === "chat" && (
          <>
            {/* Messages */}
            <div
              ref={chatBoxRef}
              className="h-[500px] overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-red-50/30 to-white"
            >
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                  <Sparkles className="w-8 h-8 text-red-300 mb-3" />
                  <p className="text-gray-600 text-sm" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                    Welcome to Zaraara
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    How may I assist you today?
                  </p>
                </div>
              )}
              
              {messages.map((m, idx) => (
                <div key={idx} className={`flex items-end gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`} style={{ animation: "fadeIn 0.3s ease-out" }}>
                  
                  {/* Bot Avatar */}
                  {m.role === "bot" && (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-700 to-red-500 border-2 border-red-300/50 flex items-center justify-center flex-shrink-0" style={{ boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)' }}>
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {/* Message content */}
                  <div className={`flex flex-col gap-2`}>
                    {m.role === "bot" ? (
                      m.content.type === "products" ? (
                        <div>
                          {m.content.message && (
                            <p className="mb-2 text-gray-700">{m.content.message}</p>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {m.content.data.map((product) => (
                              <ProductCard key={product.id} product={product} />
                            ))}
                          </div>
                        </div>
                      ) : m.content.type === "orders" ? (
                        <div>
                          {m.content.message && (
                            <p className="mb-2 text-gray-700">{m.content.message}</p>
                          )}
                          <div className="space-y-3">
                            {m.content.data.map((order) => (
                              <OrderCard key={order.orderNumber} order={order} />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="px-4 py-3 rounded-2xl max-w-[75%] text-sm leading-relaxed shadow-sm bg-white text-gray-800 border border-gray-200 rounded-bl-sm">
                          <p>{m.content.message}</p>
                        </div>
                      )
                    ) : (
                      <div className="px-4 py-3 rounded-2xl max-w-[95%] text-sm leading-relaxed shadow-sm bg-gradient-to-br from-red-700 to-red-600 text-white border border-red-400/30 rounded-br-sm">
                        <p className="font-medium">{m.text}</p>
                      </div>
                    )}
                  </div>
                  {/* User Avatar */}
                  {m.role === "user" && (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-white flex items-center justify-center shadow-sm flex-shrink-0">
                      <span className="text-gray-700 font-bold text-sm">U</span>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex items-end gap-3" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-700 to-red-500 border-2 border-red-300/50 flex items-center justify-center flex-shrink-0" style={{ boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)' }}>
                    <Sparkles className="w-4 h-4 text-white animate-spin" />
                  </div>
                  <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Input */}
            <div className="p-4 border-t border-red-100 bg-white">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Ask about products, discounts..."
                  className="flex-1 px-5 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all duration-300"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="px-5 py-3 bg-gradient-to-br from-red-700 via-red-600 to-red-500 text-white rounded-full font-semibold tracking-wide hover:shadow-lg transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden md:inline">Send</span>
                </button>
              </div>
            </div>
          </>
        )}
        {/* Virtual Try-On Tab Content */}
        {activeTab === "tryon" && (
          <div className="h-[550px] overflow-y-auto p-6 bg-gradient-to-b from-red-50/30 to-white">
            <div className="max-w-md mx-auto space-y-6">
              {/* Upload Section */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                  Upload Your Photo
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                {!tryOnImagePreview ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-red-200 rounded-2xl flex flex-col items-center justify-center gap-3 bg-white hover:bg-red-50/50 hover:border-red-400 transition-all duration-300 group p-6"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Upload className="w-7 h-7 text-red-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">Click to upload your image</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 10MB</p>
                    </div>
                  </button>
                ) : (
                  <div className="relative group">
                    <img
                      src={tryOnImagePreview}
                      alt="Preview"
                      className="w-full max-h-[600px] object-contain rounded-2xl border border-red-200"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-center justify-center">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-white text-gray-800 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors"
                      >
                        Change Image
                      </button>
                    </div>
                    <div className="absolute top-2 right-2">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                        <Image className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                )}

              </div>
              {/* Product Name Input */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                  Product Name
                </label>
                <div className="relative">
                  <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Enter product name to try on..."
                    className="w-full pl-12 pr-5 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all duration-300"
                  />
                </div>
              </div>
              {/* Try On Button */}
              <button
                onClick={handleTryOn}
                disabled={!tryOnImage || !productName.trim() || tryOnLoading}
                className="w-full py-4 bg-gradient-to-br from-red-700 via-red-600 to-red-500 text-white rounded-xl font-semibold tracking-wide hover:shadow-lg transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
              >
                {tryOnLoading ? (
                  <>
                    <Sparkles className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    <span>Try On Now</span>
                  </>
                )}
              </button>
              {/* Result Section */}
              {tryOnResult && (
                <div className="space-y-4 animate-fadeIn">
                  {tryOnResult.error ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
                      <p className="text-red-600 text-sm">{tryOnResult.error}</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-green-600" />
                        <p className="font-medium text-green-800" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                          Try-On Complete!
                        </p>
                      </div>
                      {tryOnResult.resultImage && (
                        <img
                          src={tryOnResult.resultImage}
                          alt="Try-on result"
                          className="w-full rounded-xl mt-3 border border-green-200"
                        />
                      )}
                      {tryOnResult.message && (
                        <p className="text-sm text-gray-700 mt-3">{tryOnResult.message}</p>
                      )}
                    </div>
                  )}
                  {/* Reset Button */}
                  <button
                    onClick={resetTryOn}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-300 text-sm"
                  >
                    Try Another Look
                  </button>
                </div>
              )}
              {/* Info Section */}
              {!tryOnResult && (
                <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                        How it works
                      </p>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        Upload a clear photo of yourself, enter the product name you'd like to try, and our AI will show you how it looks on you!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}