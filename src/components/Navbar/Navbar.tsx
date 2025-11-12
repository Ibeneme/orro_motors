import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import orro from "../../assets/vite.png";

const OrroNavbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white fixed top-0 left-0 w-full z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <a  href="/"> 
          <div className="flex items-center space-x-2"   >
            <img src={orro} alt="Orro Motors Logo" className="w-12 h-12" />
            <span className="text-blue-500 text-xl font-semibold">
              Orro Motors
            </span>
          </div></a>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-12">
            <a
              href="/"
              className="text-gray-900 text-base font-medium hover:text-blue-500 transition"
            >
              Home
            </a>
            <a
              href="/my-trips"
              className="text-gray-900 text-base font-medium hover:text-blue-500 transition"
            >
              My Trips
            </a>
            <a
              href="/help"
              className="text-gray-900 text-base font-medium hover:text-blue-500 transition"
            >
              Help
            </a>
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-900 focus:outline-none"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-blue-500 text-white px-6 py-6 space-y-6 shadow-lg">
          <a
            href="/"
            className="block text-base font-medium hover:text-blue-200 transition"
          >
            Home
          </a>
          <a
            href="/my-trips"
            className="block text-base font-medium hover:text-blue-200 transition"
          >
            My Trips
          </a>
          <a
            href="/help"
            className="block text-base font-medium hover:text-blue-200 transition"
          >
            Help
          </a>
        </div>
      )}
    </nav>
  );
};

export default OrroNavbar;
