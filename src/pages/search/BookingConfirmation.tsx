// components/BookingConfirmation/BookingConfirmation.tsx
import React from "react";
import {
  Check,
  MapPin,
  Calendar,
  Clock,
  Users,
  Mail,
  Ticket,
  Navigation,
  ChevronLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const BookingConfirmation: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Booking Confirmed!
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Your trip has been successfully booked
          </p>
        </div>

        {/* Booking Reference */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-6 text-center">
          <p className="text-xs text-blue-700 font-medium">Booking Reference</p>
          <p className="text-lg font-bold text-blue-900">OMYV0XUF3</p>
        </div>

        {/* Trip Summary */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Trip Details
          </h3>

          {/* Route & Date */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-xl flex-1">
              <MapPin className="w-4 h-4 text-green-700" />
              <div>
                <p className="text-xs text-green-700">Route</p>
                <p className="font-medium text-gray-900">Ikeja → Island</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-xl flex-1">
              <Calendar className="w-4 h-4 text-green-700" />
              <div>
                <p className="text-xs text-green-700">Date</p>
                <p className="font-medium text-gray-900">Sat, Nov 1, 2025</p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Operator</p>
              <p className="font-medium text-gray-900">Orro Express</p>
            </div>
            <div>
              <p className="text-gray-600">Departure</p>
              <p className="font-medium text-gray-900">08:00 AM</p>
            </div>
            <div>
              <p className="text-gray-600">Arrival</p>
              <p className="font-medium text-gray-900">02:30 PM</p>
            </div>
            <div>
              <p className="text-gray-600">Duration</p>
              <p className="font-medium text-gray-900 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                6h 30m
              </p>
            </div>
          </div>
        </div>

        {/* Pickup & Dropoff */}
        <div className="bg-green-50 rounded-3xl p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Trip Details
          </h3>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-green-200">
              <div className="flex items-center gap-2 text-green-700 mb-1">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Pickup</span>
              </div>
              <p className="font-medium text-gray-900">Ikeja Motor Park</p>
              <p className="text-sm text-gray-600">
                Bay 7, Along Agege Motor Road, Ikeja
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700 mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">Drop-off</span>
              </div>
              <p className="font-medium text-gray-900">New Market Junction</p>
              <p className="text-sm text-gray-600">
                Beside First Bank, New Market Road
              </p>
            </div>
          </div>
        </div>

        {/* Seat & Payment */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Seat Numbers
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <span className="px-3 py-1.5 bg-blue-600 text-white rounded-full text-sm font-medium">
                  2A
                </span>
                <span className="px-3 py-1.5 bg-blue-600 text-white rounded-full text-sm font-medium">
                  2B
                </span>
              </div>
              <p className="text-sm text-gray-600">Ticket (2)</p>
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Paid</span>
                <span className="font-bold text-gray-900">₦16,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Email Confirmation */}
        <div className="bg-blue-50 rounded-2xl p-4 mb-8 flex items-center gap-3">
          <Mail className="w-5 h-5 text-blue-700" />
          <p className="text-sm text-blue-900">
            A confirmation email with your e-ticket has been sent to{" "}
            <span className="font-medium">brightmoses@gmail.com</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-full border border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-sm">
              <Ticket className="w-5 h-5" />
              Print Ticket
            </button>

            <button
              onClick={() => navigate("/")}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-all duration-200 shadow-lg"
            >
              <Navigation className="w-5 h-5" />
              Book Another Trip
            </button>
          </div>

          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-full border border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
            View All My Trips
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
