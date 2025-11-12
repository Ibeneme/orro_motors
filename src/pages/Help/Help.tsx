// src/screens/HelpScreen.tsx
import React from "react";
import {
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Clock,
  ChevronRight,
  Headphones,
  FileText,
  LifeBuoy,
} from "lucide-react";

const HelpScreen: React.FC = () => {
  return (
    <div className="min-h-screen mt-[120px]">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
          <p className="text-sm text-gray-600 mt-1">
            We're here to help you with your journey
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-blue-600 text-white p-6 rounded-2xl flex items-center justify-center space-x-3 hover:bg-blue-700 transition">
            <Phone className="w-6 h-6" />
            <span className="font-medium">Call Support</span>
          </button>

          <button className="bg-white border-2 border-gray-200 p-6 rounded-2xl flex items-center justify-center space-x-3 hover:border-blue-500 transition">
            <Mail className="w-6 h-6 text-blue-600" />
            <span className="font-medium text-gray-900">Email Us</span>
          </button>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Contact Information
          </h2>
          <div className="space-y-5">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Phone</p>
                <p className="text-gray-600">+234 700 600 0000</p>
                <p className="text-sm text-gray-500 mt-1">
                  Mon–Sun, 6:00 AM – 10:00 PM
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Email</p>
                <p className="text-gray-600">support@orromotors.com</p>
                <p className="text-sm text-gray-500 mt-1">
                  Response within 24 hours
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Office</p>
                <p className="text-gray-600">
                  12 Adeola Odeku Street, Victoria Island, Lagos
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Support Categories */}
        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            How can we help?
          </h2>
          <div className="space-y-3">
            {[
              {
                icon: Headphones,
                title: "Booking Issues",
                desc: "Problems with reservations or payments",
              },
              {
                icon: LifeBuoy,
                title: "Trip Changes",
                desc: "Modify, cancel or reschedule your trip",
              },
              {
                icon: FileText,
                title: "Refunds & Policies",
                desc: "Refund status and travel policies",
              },
              {
                icon: Clock,
                title: "Trip Status",
                desc: "Track your bus or check delays",
              },
            ].map((item, idx) => (
              <button
                key={idx}
                className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition">
                    <item.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Live Chat CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-3xl p-8 text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Need Instant Help?</h3>
          <p className="text-blue-100 mb-6">
            Chat with our support team now — average response time under 2
            minutes
          </p>
          <button className="bg-white text-blue-600 font-medium px-8 py-3 rounded-full hover:bg-blue-50 transition">
            Call us
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpScreen;
