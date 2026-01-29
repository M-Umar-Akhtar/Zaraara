import React from 'react';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="container py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4">About Us</h3>
            <p className="text-gray-300 text-sm">
              Premium fashion brand delivering quality and style for over decades. Experience elegance with every collection.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/" className="hover:text-white">Home</a></li>
              <li><a href="/about" className="hover:text-white">About</a></li>
              <li><a href="/contact" className="hover:text-white">Contact</a></li>
              <li><a href="/faq" className="hover:text-white">FAQ</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-bold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/shipping" className="hover:text-white">Shipping Info</a></li>
              <li><a href="/returns" className="hover:text-white">Returns</a></li>
              <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-white">Terms & Conditions</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Info</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <span>+92 (XXX) XXX-XXXX</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span>support@jj.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>Karachi, Pakistan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-300 text-sm">Follow us on social media</p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-300 hover:text-white transition">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition">
              <Instagram size={20} />
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition">
              <Twitter size={20} />
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2024 Fashion Website. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
