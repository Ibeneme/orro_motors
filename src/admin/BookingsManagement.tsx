// src/pages/BookingsManagement.tsx
import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Eye,
  Download,
  Search,
  MapPin,
  Calendar,
  Copy,
  X,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import { showError } from "../components/Toast/Toast";
import axios from "axios";
import { baseURL } from "../services/baseurl";

interface TripDetails {
  tripName: string;
  tripId: string;
  bus: string;
  pickup: { city: string; location: string };
  dropoff: { city: string; location: string };
  takeoff: { date: string; time: string };
  departureTime: string;
  arrivalTime: string;
  price: number;
}

interface Booking {
  bookingCode: string;
  passengerEmail: string;
  route: string;
  seatId: string;
  seatPosition: number;
  amount: number;
  status: string;
  date: string;
  tripDetails: TripDetails;
}

const ITEMS_PER_PAGE = 20;

export default function BookingsManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const token = localStorage.getItem("adminToken");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const safeFormat = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM d, yyyy, h:mm a");
    } catch {
      return "N/A";
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify({ bookings: filteredBookings }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bookings-export-${format(new Date(), "yyyy-MM-dd")}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(
        `${baseURL}/trips/bookings`,
        axiosConfig
      );
      if (!data.success)
        throw new Error(data.message || "Failed to fetch bookings");
      console.log(data)
      const rawBookings: any[] = data.bookings || [];
      const bookingMap = new Map<string, Booking>();
      const now = new Date();

      rawBookings.forEach((b: any) => {
        const code = b.bookingCode;
        if (!bookingMap.has(code)) {
          let takeoffDateTime: Date | null = null;
          if (b.tripDetails.takeoff?.date) {
            takeoffDateTime = new Date(b.tripDetails.takeoff.date);
            const timeStr = b.tripDetails.takeoff.time;
            if (timeStr) {
              const timeParts = timeStr.match(/(\d+):(\d+)\s?(AM|PM)/i);
              if (timeParts) {
                let hours = parseInt(timeParts[1], 10);
                const minutes = parseInt(timeParts[2], 10);
                const period = timeParts[3]?.toUpperCase();
                if (period === "PM" && hours < 12) hours += 12;
                if (period === "AM" && hours === 12) hours = 0;
                takeoffDateTime.setHours(hours, minutes, 0, 0);
              }
            }
          }

          const status =
            takeoffDateTime && now < takeoffDateTime ? "scheduled" : "finished";

          bookingMap.set(code, {
            bookingCode: code,
            passengerEmail: b.passengerEmail,
            route: b.route,
            amount: b.amount,
            status,
            date: b.date,
            seatId: b.seatId,
            seatPosition: b.seatPosition,
            tripDetails: {
              tripName: b.tripDetails.tripName || "Unknown Trip",
              tripId: b.tripDetails.tripId || "N/A",
              bus: b.tripDetails.bus || "N/A",
              pickup: {
                city: b.tripDetails.pickup.city,
                location: b.tripDetails.pickup.location,
              },
              dropoff: {
                city: b.tripDetails.dropoff.city,
                location: b.tripDetails.dropoff.location,
              },
              takeoff: {
                date: b.tripDetails.takeoff.date,
                time: b.tripDetails.takeoff.time,
              },
              departureTime: b.tripDetails.departureTime,
              arrivalTime: b.tripDetails.arrivalTime,
              price: b.tripDetails.price,
            },
          });
        }
      });

      const uniqueBookings = Array.from(bookingMap.values()).reverse();
      setBookings(uniqueBookings);
      setFilteredBookings(uniqueBookings);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Network error";
      setError(msg);
      showError("Failed to load bookings", msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    if (!term) {
      setFilteredBookings(bookings);
      setCurrentPage(1);
      return;
    }
    const filtered = bookings.filter(
      (b) =>
        b.bookingCode.toLowerCase().includes(term) ||
        b.passengerEmail.toLowerCase().includes(term) ||
        b.route.toLowerCase().includes(term) ||
        b.tripDetails.tripName.toLowerCase().includes(term) ||
        b.tripDetails.bus.toLowerCase().includes(term)
    );
    setFilteredBookings(filtered);
    setCurrentPage(1);
  }, [searchTerm, bookings]);

  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBookings.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBookings, currentPage]);

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);

  if (loading) {
    return (
      <AdminLayout title="Bookings Management" subtitle="Loading bookings...">
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Bookings Management" subtitle="Error">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-white p-10 rounded-2xl shadow-lg max-w-md">
            <AlertCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <p className="text-lg text-gray-700 mb-6">{error}</p>
            <button
              onClick={fetchBookings}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Bookings Management"
      subtitle="View, update, and manage all customer bookings."
    >
      {/* Header Actions */}
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by code, email, route..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
          />
        </div>
        <button
          onClick={exportToJSON}
          className="flex items-center gap-2 px-5 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium text-sm"
        >
          <Download className="w-5 h-5" />
          Export
        </button>
      </div>

      {/* Stats */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {paginatedBookings.length} of {filteredBookings.length} bookings
        {searchTerm && ` (filtered)`}
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4">
        {paginatedBookings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {searchTerm
              ? "No bookings match your search."
              : "No bookings found."}
          </div>
        ) : (
          paginatedBookings.map((b) => (
            <div
              key={b.bookingCode}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow transition"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <code className="font-mono text-blue-600 font-semibold text-sm">
                    {b.bookingCode}
                  </code>
                  <button
                    onClick={() => copyToClipboard(b.bookingCode)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    {copiedCode === b.bookingCode ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <button
                  onClick={() => setSelectedBooking(b)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <p className="font-medium text-gray-900 truncate">
                  {b.passengerEmail}
                </p>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>
                    {b.tripDetails.pickup.city} to {b.tripDetails.dropoff.city}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    Seat {b.seatPosition}
                  </span>
                  <span className="font-bold text-gray-900">
                    ₦{b.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                  </span>
                  <span className="text-gray-500">{safeFormat(b.date)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            All Bookings ({filteredBookings.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm font-semibold text-gray-600">
                <th className="px-6 py-4">Booking Code</th>
                <th className="px-6 py-4">Passenger</th>
                <th className="px-6 py-4">Route</th>
                <th className="px-6 py-4">Seat</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    {searchTerm
                      ? "No bookings match your search."
                      : "No bookings found."}
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((b) => (
                  <tr
                    key={b.bookingCode}
                    className="border-b border-gray-100 hover:bg-blue-50 transition"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-blue-600 font-semibold text-sm">
                          {b.bookingCode}
                        </span>
                        <button onClick={() => copyToClipboard(b.bookingCode)}>
                          {copiedCode === b.bookingCode ? (
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-blue-500" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-gray-900">
                      {b.passengerEmail}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {b.tripDetails.pickup.city} to{" "}
                            {b.tripDetails.dropoff.city}
                          </div>
                          <div className="text-xs text-gray-500">
                            {b.tripDetails.departureTime} to{" "}
                            {b.tripDetails.arrivalTime}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        Seat {b.seatPosition}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-bold text-gray-900">
                      ₦{b.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-gray-700 text-sm">
                      {safeFormat(b.date)}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between bg-gray-50 text-sm">
            <div className="text-gray-600 mb-2 sm:mb-0">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                Booking Details
              </h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-500 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-5 space-y-5 text-sm">
              <div>
                <p className="text-gray-600">Booking Code</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="font-mono text-blue-600 font-semibold">
                    {selectedBooking.bookingCode}
                  </code>
                  <button
                    onClick={() => copyToClipboard(selectedBooking.bookingCode)}
                  >
                    {copiedCode === selectedBooking.bookingCode ? (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Copy className="w-5 h-5 text-blue-600" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-gray-600">Passenger</p>
                <p className="font-medium text-gray-900">
                  {selectedBooking.passengerEmail}
                </p>
              </div>

              <div>
                <p className="text-gray-600">Trip</p>
                <p className="font-bold text-gray-900">
                  {selectedBooking.tripDetails.tripName}
                </p>
                <p className="text-blue-600 text-xs">
                  Bus: {selectedBooking.tripDetails.bus}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedBooking.tripDetails.pickup.city} to{" "}
                    {selectedBooking.tripDetails.dropoff.city}
                  </p>
                  <p className="text-xs text-gray-600">
                    {selectedBooking.tripDetails.pickup.location} to{" "}
                    {selectedBooking.tripDetails.dropoff.location}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">
                    {safeFormat(selectedBooking.date)}
                  </p>
                  <p className="text-xs text-gray-600">
                    {selectedBooking.tripDetails.departureTime} to{" "}
                    {selectedBooking.tripDetails.arrivalTime}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <p className="text-xs text-blue-600 font-medium">Seat</p>
                <p className="text-3xl font-bold text-blue-900">
                  {selectedBooking.seatPosition}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  ₦{selectedBooking.tripDetails.price.toLocaleString()} per seat
                </p>
              </div>

              <div className="border-t pt-4 flex justify-between items-center">
                <div>
                  <p className="text-gray-600 text-xs">Total Paid</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₦{selectedBooking.amount.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-600 text-xs">Status</p>
                  <p className="text-lg font-bold text-blue-600">
                    {selectedBooking.status.charAt(0).toUpperCase() +
                      selectedBooking.status.slice(1)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
