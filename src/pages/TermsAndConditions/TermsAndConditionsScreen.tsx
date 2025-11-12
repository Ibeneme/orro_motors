import React from "react";
import {
  FileText,
  Shield,
  Clock,
  Users,
  Globe,
  AlertCircle,
} from "lucide-react";

const TermsAndConditionsScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Terms and Conditions
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Please read these terms carefully before using Orro Motors services.
            By booking or traveling with us, you agree to be bound by these
            terms.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: November 06, 2025
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-10 space-y-8">
          {[
            {
              icon: Users,
              title: "1. Booking & Payment",
              items: [
                "All bookings must be made through our official app or website.",
                "Full payment is required at the time of booking.",
                "Prices include all applicable taxes and service fees.",
                "Children under 5 years travel free when accompanied by a paying adult (limited to 1 per adult).",
              ],
            },
            {
              icon: Clock,
              title: "2. Departure & Arrival",
              items: [
                "Passengers must arrive at the terminal at least 30 minutes before departure.",
                "Orro Motors is not responsible for missed trips due to late arrival.",
                "Departure times are subject to change due to traffic or operational reasons.",
                "We guarantee arrival within ±60 minutes of scheduled time under normal conditions.",
              ],
            },
            {
              icon: Shield,
              title: "3. Cancellations & Refunds",
              items: [
                "Cancellations made 24+ hours before departure: 90% refund.",
                "Cancellations made 6–24 hours before: 50% refund.",
                "Cancellations within 6 hours: No refund.",
                "Refunds processed within 5–7 business days.",
              ],
            },
            {
              icon: AlertCircle,
              title: "4. Passenger Conduct",
              items: [
                "No smoking, alcohol, or illegal substances allowed on board.",
                "Passengers must follow crew instructions at all times.",
                "Orro Motors reserves the right to refuse service to disruptive passengers.",
                "Lost items are held for 30 days only.",
              ],
            },
            {
              icon: Globe,
              title: "5. Liability",
              items: [
                "We are not liable for delays caused by force majeure (weather, strikes, etc.).",
                "Personal belongings are carried at passenger's own risk.",
                "Maximum liability for lost luggage: ₦50,000 per passenger.",
                "Travel insurance is recommended.",
              ],
            },
          ].map((section, idx) => (
            <div
              key={idx}
              className="border-b border-gray-100 last:border-0 pb-8 last:pb-0"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <section.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {section.title}
                  </h2>
                  <ul className="space-y-3">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0" />
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

          <div className="mt-10 p-6 bg-blue-50 rounded-2xl">
            <p className="text-sm text-blue-900 text-center">
              <strong>Questions?</strong> Contact us at{" "}
              <a
                href="mailto:support@orromotors.com"
                className="underline font-medium"
              >
                support@orromotors.com
              </a>{" "}
              or call <strong>+234 700 600 0000</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsScreen;
