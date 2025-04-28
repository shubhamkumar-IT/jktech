"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="w-full px-4 py-4 bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-2xl font-bold text-blue-600">DocuManage</div>
        <nav className="hidden md:flex space-x-8">
          <a
            href="#features"
            className="text-gray-700 hover:text-blue-600 transition"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-gray-700 hover:text-blue-600 transition"
          >
            Pricing
          </a>
          <a
            href="#contact"
            className="text-gray-700 hover:text-blue-600 transition"
          >
            Contact
          </a>
        </nav>
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 space-y-4">
          <a
            href="#features"
            className="block text-gray-700 hover:text-blue-600 transition"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="block text-gray-700 hover:text-blue-600 transition"
          >
            Pricing
          </a>
          <a
            href="#contact"
            className="block text-gray-700 hover:text-blue-600 transition"
          >
            Contact
          </a>
        </div>
      )}
    </header>
  );
}
