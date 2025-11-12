import React from "react";
import { Link } from "react-router-dom";
import bg from "../../assets/hero.png";
import second from "../../assets/second.png";

const OrroFooter: React.FC = () => {
  return (
    <footer className="relative overflow-hidden">
      {/* Background Image with Darker Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${bg})`,
        }}
      >
        <div className="absolute inset-0 bg-white/80" />{" "}
        {/* Increased darkness */}
      </div>

      {/* Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-black">
        {/* Brand & Description */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <img src={second} alt="Orro Motors" className="w-12 h-12" />
            <h3 className="text-xl font-bold">Orro Motors</h3>
          </div>
          <p className="text-sm max-w-xs">
            Your trusted travel partner for comfortable and safe journeys across
            Nigeria.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="transition hover:text-blue-600">
                Deliver a package
              </Link>
            </li>
            <li>
              <Link to="/" className="transition hover:text-blue-600">
                About us
              </Link>
            </li>
            <li>
              <Link to="/terms" className="transition hover:text-blue-600">
                Terms and Conditions
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="transition hover:text-blue-600">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                to="/help/contact"
                className="transition hover:text-blue-600"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Supports</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/help" className="transition hover:text-blue-600">
                Help Center
              </Link>
            </li>
            <li>
              <Link to="/help" className="transition hover:text-blue-600">
                Cancel Booking
              </Link>
            </li>
            <li>
              <Link to="/help" className="transition hover:text-blue-600">
                Track Bus
              </Link>
            </li>
            <li>
              <Link to="/help" className="transition hover:text-blue-600">
                Refund Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="relative z-10 mt-10 pt-6 text-center text-xs text-gray-700">
        © 2025 Orro Motors. All rights reserved.
      </div>
    </footer>
  );
};

export default OrroFooter;
