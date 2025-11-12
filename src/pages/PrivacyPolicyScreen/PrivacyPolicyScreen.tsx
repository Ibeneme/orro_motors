import React from "react";
import { Lock, Shield, Eye, Database, Smartphone } from "lucide-react";

const PrivacyPolicyScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Privacy Policy
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Your privacy matters. We collect only what we need to provide safe,
            reliable transport services across Nigeria.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: November 06, 2025
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-10 space-y-8">
          {[
            {
              icon: Database,
              title: "1. Information We Collect",
              items: [
                "Name, phone number, and email for booking and communication.",
                "Payment details (processed securely via encrypted channels).",
                "Travel history to improve your experience.",
                "Device info for app functionality and security.",
              ],
            },
            {
              icon: Shield,
              title: "2. How We Use Your Data",
              items: [
                "To confirm bookings and send trip updates via SMS/email.",
                "To process payments and issue receipts.",
                "To prevent fraud and ensure passenger safety.",
                "To improve our services and send relevant offers (you can opt out).",
              ],
            },
            {
              icon: Eye,
              title: "3. Data Sharing",
              items: [
                "We do not sell your personal information.",
                "Shared only with trusted partners (banks, drivers) to fulfill your trip.",
                "Disclosed only when required by Nigerian law.",
              ],
            },
            {
              icon: Smartphone,
              title: "4. Your Rights",
              items: [
                "Access, correct, or delete your data at any time.",
                "Opt out of marketing messages.",
                "Request data export in readable format.",
                "Contact us to exercise your rights.",
              ],
            },
            {
              icon: Lock,
              title: "5. Security",
              items: [
                "256-bit SSL encryption for all transactions.",
                "Regular security audits and penetration testing.",
                "Access controls and employee training.",
                "Data stored in secure Nigerian data centers.",
              ],
            },
          ].map((section, idx) => (
            <div
              key={idx}
              className="border-b border-gray-100 last:border-0 pb-8 last:pb-0"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <section.icon className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {section.title}
                  </h2>
                  <ul className="space-y-3">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                        <span className="text-gray-700 leading-relaxed">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-10 p-6 bg-green-50 rounded-2xl">
            <p className="text-sm text-green-900 text-center">
              <strong>Privacy Contact:</strong>{" "}
              <a
                href="mailto:privacy@orromotors.com"
                className="underline font-medium"
              >
                privacy@orromotors.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyScreen;
