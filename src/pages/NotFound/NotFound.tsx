import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Home, MapPin } from "lucide-react";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-6 pt-32 pb-16">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="relative mb-8">
          <div className="absolute inset-0 blur-3xl opacity-30">
            <AlertCircle className="w-32 h-32 mx-auto" />
          </div>
          <AlertCircle className="relative w-32 h-32 mx-auto" />
        </div>

        {/* Main Text */}
        <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-3">
          404
        </h1>
        <p className="text-xl md:text-2xl font-semibold text-gray-700 mb-2">
          Oops! Page not found.
        </p>
        <p className="text-base text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>

          <Link
            to="/help"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 font-medium rounded-full border-2 border-blue-600 hover:bg-blue-50 transition-all duration-200"
          >
            <MapPin className="w-5 h-5" />
            Get Help
          </Link>
        </div>

        {/* Lagos Touch */}
        <p className="mt-10 text-sm text-gray-400 flex items-center justify-center gap-1">
          <MapPin className="w-4 h-4" />
          You're in Lagos — let's get you back on track.
        </p>
      </div>
    </div>
  );
};

export default NotFound;
