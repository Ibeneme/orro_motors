// src/pages/AdminDashboard.tsx
import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  DollarSign,
  ListTodo,
  Eye,
  Download,
  MapPin,
  User,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { showError } from "../components/Toast/Toast";
import axios from "axios";
import { baseURL } from "../services/baseurl";
import { format } from "date-fns";

interface Trip {
  _id: string;
  tripName: string;
  tripId: string;
  bus: string;
  pickup: { city: string; location: string };
  dropoff: { city: string; location: string };
  takeoff: { date: string; time: string };
  departureTime: string;
  arrivalTime: string;
  price: number;
  seatCount: number;
  status: string;
}

interface Booking {
  bookingCode: string;
  passengerEmail: string;
  route: string;
  amount: number;
  status: string;
  date: string;
  seatPosition: number;
  tripDetails: {
    tripName: string;
    pickup: { city: string };
    dropoff: { city: string };
    departureTime: string;
    arrivalTime: string;
  };
}

export default function AdminDashboard() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("adminToken");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  // Fetch Trips
  const fetchTrips = async () => {
    try {
      const { data } = await axios.get(
        `${baseURL}/trips/fetch-all-trips`,
        axiosConfig
      );
      if (data.success) {
        setTrips(data.trips.reverse());
      }
    } catch (err: any) {
      console.error("Failed to fetch trips:", err);
    }
  };

  // Fetch Bookings
  const fetchBookings = async () => {
    try {
      const { data } = await axios.get(
        `${baseURL}/trips/bookings`,
        axiosConfig
      );
      if (!data.success)
        throw new Error(data.message || "Failed to fetch bookings");

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
            seatPosition: b.seatPosition,
            tripDetails: {
              tripName: b.tripDetails.tripName || "Unknown Trip",
              pickup: { city: b.tripDetails.pickup.city },
              dropoff: { city: b.tripDetails.dropoff.city },
              departureTime: b.tripDetails.departureTime,
              arrivalTime: b.tripDetails.arrivalTime,
            },
          });
        }
      });

      const uniqueBookings = Array.from(bookingMap.values()).reverse();
      setBookings(uniqueBookings);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Network error";
      setError(msg);
      showError("Failed to load bookings", msg);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTrips(), fetchBookings()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Compute Stats
  const totalBookings = bookings.length;
  const scheduledBookings = bookings.filter(
    (b) => b.status === "scheduled"
  ).length;
  const finishedBookings = bookings.filter(
    (b) => b.status === "finished"
  ).length;
  const totalRevenue = bookings.reduce((sum, b) => sum + b.amount, 0);

  const recentBookings = bookings.slice(0, 5);

  const exportToJSON = () => {
    const dataStr = JSON.stringify({ bookings, trips }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `admin-report-${format(new Date(), "yyyy-MM-dd")}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <AdminLayout title="Admin Dashboard">
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Admin Dashboard">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-white p-10 rounded-2xl max-w-md">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <p className="text-lg text-gray-700 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
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
    <AdminLayout title="Admin Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          {
            label: "Total Bookings",
            value: totalBookings.toLocaleString(),
            color: "blue",
            icon: Calendar,
          },
          {
            label: "Scheduled Trips",
            value: scheduledBookings,
            color: "amber",
            icon: Clock,
          },
          {
            label: "Completed Trips",
            value: finishedBookings,
            color: "green",
            icon: CheckCircle,
          },
          {
            label: "Revenue",
            value: `₦${totalRevenue.toLocaleString()}`,
            color: "purple",
            icon: DollarSign,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-4xl font-bold text-${stat.color}-600`}>
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600 mt-2 font-medium">
                  {stat.label}
                </p>
              </div>
              <div
                className={`w-14 h-14 bg-${stat.color}-100 rounded-2xl flex items-center justify-center`}
              >
                <stat.icon className={`w-8 h-8 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/admin/trips"
                className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition font-semibold"
              >
                <ListTodo className="w-6 h-6" /> Manage Trips
              </Link>
              <Link
                to="/admin/bookings"
                className="flex items-center gap-3 px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-2xl hover:bg-blue-50 transition font-semibold"
              >
                <Eye className="w-6 h-6" /> View Bookings
              </Link>
              <button
                onClick={exportToJSON}
                className="flex items-center gap-3 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition font-semibold"
              >
                <Download className="w-6 h-6" /> Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-gray-900">
                Recent Bookings
              </h3>
              <Link
                to="/admin/bookings"
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                View All
              </Link>
            </div>

            {recentBookings.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 text-lg">No bookings yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.bookingCode}
                    className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono text-blue-600 font-semibold">
                          {booking.bookingCode}
                        </code>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            booking.status === "scheduled"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        ₦{booking.amount.toLocaleString()}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span className="truncate max-w-[120px]">
                          {booking.passengerEmail}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>
                          {booking.tripDetails.pickup.city} to{" "}
                          {booking.tripDetails.dropoff.city}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(booking.date), "MMM d, h:mm a")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
