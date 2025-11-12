/* MyTripsScreen.tsx */
import React, { useEffect, useState } from "react";
import {
  Sofa,
  MapPin,
  Calendar,
  Clock,
  Users,
  Eye,
  Copy,
  X,
  Ticket,
  Bus,
  CalendarDays,
  Clock3,
  Hash,
  CheckCircle,
  CreditCard,
  UserCheck,
} from "lucide-react";
import { useNavigate } from "react-router";
import axios from "axios";
import { baseURL } from "../../services/baseurl";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Types – with optional fields and defaults in UI                   */
/* ------------------------------------------------------------------ */
interface Location {
  city: string;
  location?: string;
}

interface Trip {
  _id: string;
  tripName: string;
  pickup: Location;
  dropoff: Location;
  takeoff: { date: string; time: string };
  arrivalTime?: string;
}

interface Booking {
  bookingCode: string;
  amount: number;
  paymentReference: string;
  position: number;
  seat: { _id: string; position: number };
  trip: Trip;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
const PAGE_SIZE = 5;

const MyTripsScreen: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"All Trips" | "Upcoming" | "Past">(
    "All Trips"
  );
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();

  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const userData = localStorage.getItem("user");
        if (!userData) throw new Error("User data not found");

        const user = JSON.parse(userData);
        const userId = user._id;
        if (!userId) throw new Error("User ID not found");

        const { data } = await axios.get(`${baseURL}/pay/trips/${userId}`);
        if (data.success) setBookings(data.bookings);
        else console.error("Failed to fetch bookings:", data.message);
      } catch (error: any) {
        console.error(
          "Error fetching bookings:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  /* ------------------------------------------------------------------ */
  const filteredBookings = bookings
    .filter((b) => {
      const tripDate = new Date(b.trip?.takeoff?.date || "");
      if (isNaN(tripDate.getTime())) return false;
      if (activeTab === "Upcoming") return tripDate > new Date();
      if (activeTab === "Past") return tripDate <= new Date();
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );

  const totalPages = Math.ceil(filteredBookings.length / PAGE_SIZE);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ------------------------------------------------------------------ */
  // Helper: Safe text with fallback
  const safe = (value: string | undefined | null, fallback = "—") =>
    value?.trim() ? value : fallback;

  /* ------------------------------------------------------------------ */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-lg text-gray-600 font-medium">
          Loading your trips...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 mt-[120px] max-w-7xl mx-auto px-6">
      {/* Header */}
      <div className="pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>
        <p className="text-sm text-gray-600 mt-1">
          View and manage all your bookings
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(["All Trips", "Upcoming", "Past"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === tab
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-300 hover:border-gray-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* No Bookings */}
      {filteredBookings.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-20">
          <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-md text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Sofa className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              No Trips Yet
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              You haven’t booked any {activeTab.toLowerCase()} trips yet.
            </p>
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-full transition-all duration-200 shadow-md"
              onClick={() => navigate("/")}
            >
              Book Your First Trip
            </button>
          </div>
        </div>
      )}

      {/* Booking Cards */}
      {filteredBookings.length > 0 && (
        <div className="space-y-4">
          {paginatedBookings.map((b) => {
            const departureDate = safe(b.trip?.takeoff?.date);
            const isUpcoming =
              departureDate !== "—" && new Date(departureDate) > new Date();

            return (
              <div
                key={b.bookingCode}
                className="bg-white rounded-3xl shadow-lg p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all duration-200 hover:shadow-xl"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-gray-900">
                      {safe(b?.trip?.tripName)}
                    </span>
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                        isUpcoming
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {isUpcoming ? "Upcoming" : "Completed"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-900 font-medium">
                    <span>{safe(b?.trip?.pickup.city)}</span>
                    <span className="text-blue-600">→</span>
                    <span>{safe(b?.trip?.dropoff.city)}</span>
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {departureDate === "—"
                        ? "—"
                        : new Date(departureDate).toDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {safe(b.trip?.takeoff?.time)}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users className="w-4 h-4" />
                      Seat: <span className="font-semibold">{b.position}</span>
                    </div>

                    <div className="flex items-center gap-1 font-medium text-gray-900">
                      Booking Code:{" "}
                      <span
                        className="ml-1 cursor-pointer text-blue-600 hover:underline flex items-center gap-1"
                        onClick={() => copyToClipboard(b.bookingCode)}
                      >
                        {b.bookingCode} <Copy className="w-3 h-3" />
                      </span>
                    </div>

                    <div className="flex items-center gap-1 font-medium text-gray-900">
                      Amount: ₦{b.amount.toLocaleString()}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedBooking(b)}
                  className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-all duration-200 flex items-center gap-2 font-medium"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-4 py-2 border border-gray-300 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                Prev
              </button>
              <span className="px-4 py-2 bg-blue-600 text-white rounded-full font-medium">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-4 py-2 border border-gray-300 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* -------------------------- MODAL with Framer Motion & Defaults -------------------------- */}
      <AnimatePresence>
        {selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={() => setSelectedBooking(null)}
          >
            <motion.div
              initial={{ y: 60, scale: 0.95, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 60, scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-3xl font-extrabold flex items-center gap-4">
                        <Ticket className="w-10 h-10" />
                        Booking Confirmed
                      </h2>
                      <p className="text-lg mt-2 opacity-90">
                        Your seat is reserved!
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedBooking(null)}
                      className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition backdrop-blur-sm"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left */}
                  <div className="space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Bus className="w-7 h-7 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">
                          Trip Name
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {safe(selectedBooking?.trip?.tripName)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-7 h-7 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">
                          Route
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {safe(selectedBooking?.trip?.pickup.city)} →{" "}
                          {safe(selectedBooking?.trip?.dropoff.city)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {safe(selectedBooking?.trip?.pickup.location)} →{" "}
                          {safe(selectedBooking?.trip?.dropoff.location)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <CalendarDays className="w-7 h-7 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">
                          Departure
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {safe(selectedBooking.trip?.takeoff?.date) === "—"
                            ? "—"
                            : format(
                                new Date(selectedBooking.trip?.takeoff?.date),
                                "EEEE, MMMM d, yyyy"
                              )}
                        </p>
                        <p className="text-sm text-gray-600">
                          <Clock3 className="w-4 h-4 inline mr-1" />
                          {safe(selectedBooking.trip?.takeoff?.time)} · Arr:{" "}
                          {safe(selectedBooking?.trip?.arrivalTime, "N/A")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Sofa className="w-7 h-7 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">
                          Seat Number
                        </p>
                        <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                          {selectedBooking.position}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Hash className="w-7 h-7 text-pink-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 font-semibold">
                          Booking Code
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <code className="text-lg font-bold text-gray-900 bg-gray-100 px-4 py-2 rounded-xl">
                            {selectedBooking.bookingCode}
                          </code>
                          <button
                            onClick={() =>
                              copyToClipboard(selectedBooking.bookingCode)
                            }
                            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition shadow-md"
                          >
                            {copied ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <Copy className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        {copied && (
                          <p className="text-sm text-green-600 mt-2 font-medium">
                            Copied!
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <CreditCard className="w-7 h-7 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">
                          Amount Paid
                        </p>
                        <p className="text-2xl font-extrabold text-gray-900">
                          ₦{selectedBooking.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meta */}
                <div className="border-t pt-6 mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <UserCheck className="w-5 h-5 text-gray-500" />
                    <p>
                      <strong>Booked on:</strong>{" "}
                      {safe(selectedBooking.createdAt) === "—"
                        ? "—"
                        : format(
                            new Date(selectedBooking.createdAt),
                            "PPP 'at' p"
                          )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Hash className="w-5 h-5 text-gray-500" />
                    <p>
                      <strong>Payment Ref:</strong>{" "}
                      {safe(selectedBooking.paymentReference)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 text-center border-t-4 border-purple-600">
                <p className="text-lg font-bold text-gray-800 mb-2">
                  Arrive 30 minutes early at the terminal
                </p>
                <p className="text-sm text-gray-600">
                  Show your{" "}
                  <span className="font-bold text-blue-600">Booking Code</span>{" "}
                  to board
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyTripsScreen;
