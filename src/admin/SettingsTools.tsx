// src/pages/SettingsTools.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import {

  Download,

  LogOut,
  Info,
  AlertCircle,

  Loader2,
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import Modal from "./Modal";
import { baseURL } from "../services/baseurl";
import { showError, showSuccess } from "../components/Toast/Toast";

interface Seat {
  _id: string;
  position: number;
  isBooked: boolean;
  isPaid: boolean;
}

interface Trip {
  _id?: string;
  tripName: string;
  bus: string;
  vehicleType: string;
  pickup: { city: string; location: string };
  dropoff: { city: string; location: string };
  takeoff: { date: string; time: string };
  departureTime: string;
  arrivalTime: string;
  seatCount: number;
  price: number;
  admin?: { name: string };
  seats?: Seat[];
  status?: string;
  tripId?: string;
}

interface Booking {
  bookingCode: string;
  passengerEmail: string;
  route: string;
  amount: number;
  status: string;
  seatPosition: string;
  tripDetails: Trip;
}

export default function SettingsTools() {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("adminToken");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  console.log(loading)
  // FETCH TRIPS
  const fetchTrips = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${baseURL}/trips/fetch-all-trips`,
        axiosConfig
      );
      if (data.success) setTrips(data.trips.reverse());
    } catch (error: any) {
      showError(
        "Failed to load trips",
        error.response?.data?.message || "Please refresh"
      );
    } finally {
      setLoading(false);
    }
  };

  // FETCH BOOKINGS
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${baseURL}/trips/bookings`,
        axiosConfig
      );
      if (!data.success)
        throw new Error(data.message || "Failed to fetch bookings");

      const bookingMap = new Map<string, Booking>();
      const now = new Date();

      (data.bookings || []).forEach((b: any) => {
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
            seatPosition: b.seatPosition,
            tripDetails: b.tripDetails,
          });
        }
      });

      setBookings(Array.from(bookingMap.values()).reverse());
    } catch (err: any) {
      showError(
        "Failed to load bookings",
        err.response?.data?.message || "Network error"
      );
    } finally {
      setLoading(false);
    }
  };

  // EXPORT DATA
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = { trips, bookings };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orro-motors-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      a.click();
      URL.revokeObjectURL(url);

      showSuccess("Export Successful", "Backup file downloaded");
      setShowExportModal(false);
    } catch (err) {
      showError("Export Failed", "Please try again");
    } finally {
      setIsExporting(false);
    }
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    window.location.href = "/admin";
  };

  useEffect(() => {
    fetchTrips();
    fetchBookings();
  }, []);

  return (
    <AdminLayout
      title="Settings / Tools"
      subtitle="Manage your data, view bookings, and system preferences."
    >
      {/* Logout Section */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowLogoutModal(true)}
          className="px-5 py-2.5 bg-red-600 text-white rounded-xl shadow-sm flex items-center gap-2 hover:bg-red-700 transition font-medium text-sm"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Export All Data */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start gap-4 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <Download className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                Export All Data
              </h3>
              <p className="text-xs text-gray-600">
                Download all trips and bookings as a JSON file.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowExportModal(true)}
            className="px-6 py-2.5 text-sm bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition shadow-md flex items-center gap-2 w-full justify-center"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-3">
          <Info className="w-5 h-5 text-purple-600" />
          About Orro Motors Admin
        </h3>
        <p className="text-xs text-gray-700 leading-relaxed">
          The Orro Motors Admin Dashboard allows administrators to manage trips,
          monitor bookings, and handle customer reservations efficiently.
        </p>
      </div>

      {/* EXPORT CONFIRMATION MODAL */}
      {showExportModal && (
        <Modal
          title="Export All Data"
          onClose={() => setShowExportModal(false)}
          icon={<Download className="w-7 h-7 text-green-600" />}
          width="max-w-md"
        >
          <div className="space-y-5 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Download className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Export Backup?</h3>
            <p className="text-sm text-gray-600">
              This will download <strong>all trips and bookings</strong> as a
              JSON file.
            </p>
            <div className="text-xs text-gray-500">
              <p>
                Trips: <strong>{trips.length}</strong>
              </p>
              <p>
                Bookings: <strong>{bookings.length}</strong>
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowExportModal(false)}
              disabled={isExporting}
              className="px-6 py-2.5 border-2 border-gray-400 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium flex items-center gap-2 disabled:opacity-70"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Export Now
                </>
              )}
            </button>
          </div>
        </Modal>
      )}

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <Modal
          title="Logout"
          onClose={() => setShowLogoutModal(false)}
          icon={<AlertCircle className="w-7 h-7 text-red-600" />}
          width="max-w-md"
        >
          <div className="space-y-5 text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <LogOut className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Logout?</h3>
            <p className="text-sm text-gray-600">
              You will be signed out of the admin dashboard.
            </p>
          </div>

          <div className="flex justify-center gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="px-6 py-2.5 border-2 border-gray-400 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
