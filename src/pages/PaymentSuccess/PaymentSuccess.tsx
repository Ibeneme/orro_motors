import React, { useEffect, useState, useRef } from "react"; // 1. Import useRef
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { CheckCircle, Loader2, Ticket, Mail } from "lucide-react";
import { baseURL } from "../../services/baseurl";

interface Booking {
  bookingCode: string;
  seatId: string;
  amount: number;
  tripId: string;
  seatPosition: number;
}

interface Trip {
  tripName: string;
  tripId: string;
  pickup: { city: string; location?: string };
  dropoff: { city: string; location?: string };
  takeoff: { date: string; time: string };
  price: number;
  bus?: string;
}

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [totalPaid, setTotalPaid] = useState<number>(0);

  // 2. Create a ref to track if the verification has been initiated
  const hasVerificationRun = useRef(false);

  const reference = searchParams.get("reference");

  useEffect(() => {
    // 3. Check the ref. If it's true, exit immediately.
    if (hasVerificationRun.current) {
      return;
    }

    if (!reference) {
      setError("Invalid payment callback");
      setVerifying(false);
      return;
    }

    // 4. Set the ref to true BEFORE calling the async function.
    hasVerificationRun.current = true;

    let didCancel = false;

    const verifyPayment = async () => {
      try {
        setVerifying(true);
        setError("");

        const userData = localStorage.getItem("user");
        const selectedSeatsData = localStorage.getItem("selectedSeatIds");

        if (!userData || !selectedSeatsData) {
          throw new Error(
            "Missing user or seat information locally. Cannot verify."
          );
        }

        const user = JSON.parse(userData);
        let selectedSeatIds: string[] = JSON.parse(selectedSeatsData);

        // --- Ensure it's a flat array of strings ---
        if (!Array.isArray(selectedSeatIds)) {
          selectedSeatIds = [String(selectedSeatIds)];
        }

        // remove duplicates just in case
        selectedSeatIds = Array.from(new Set(selectedSeatIds));

        if (selectedSeatIds.length === 0) {
          throw new Error("No seats selected for verification.");
        }

        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        console.log("Sending seatIds:", selectedSeatIds);

        const res = await axios.post(
          `${baseURL}/pay/verify-payment`,
          {
            email: user.email,
            seatIds: selectedSeatIds,
            reference,
          },
          { headers }
        );
        console.log(res, 'res')

        if (res.data.success) {
          console.log(res, "res");
          setBookings(res.data.bookings); // <-- Handles the "bookings" array
          setTrip(res.data.trip); // <-- Handles the "trip" object
          const total = res.data.bookings.reduce(
            (acc: number, b: Booking) => acc + b.amount,
            0
          );
          setTotalPaid(total); // <-- Calculates totalPaid from the bookings
          localStorage.removeItem("selectedSeatIds");
          setVerifying(false);
        } else {
          setError(res.data.message || "Payment verification failed");
          setVerifying(false);
        }
      } catch (err: any) {
        console.error("Verification error:", err);
        setVerifying(false);
        if (!didCancel) {
          // If verification fails, revert the ref only if it's NOT a critical error
          // This allows manual retry on subsequent renders if needed, but is generally safe
          // to leave as true because the verification *was* attempted.
          // For simplicity and guaranteed one-time run, we keep the ref TRUE.
          setError(
            err.response?.data?.message || "Network error. Please try again."
          );
          setVerifying(false);
        }
      } finally {
        if (!didCancel) setVerifying(false);
      }
    };

    verifyPayment();

    return () => {
      didCancel = true;
    };
  }, [reference]); // Dependency array remains correct for reference

  // ... (The rest of your component remains the same)
  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-12 text-center max-w-md">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-6" />
          <p className="text-xl font-semibold text-gray-700">
            Verifying your payment...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-red-50 to-pink-50">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-12 text-center max-w-md">
          <CheckCircle className="w-12 h-12 text-red-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-red-700 mb-4">
            Payment Issue
          </h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => navigate(-2)}
            className="px-8 py-4 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        {/* Success Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
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
          <p className="text-lg font-bold text-blue-900">{reference}</p>
        </div>

        {/* Trip Summary */}
        {trip && (
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Trip Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Trip Name</p>
                <p className="font-medium text-gray-900">{trip.tripName}</p>
              </div>
              <div>
                <p className="text-gray-600">Bus</p>
                <p className="font-medium text-gray-900">{trip.bus}</p>
              </div>
              <div>
                <p className="text-gray-600">Departure</p>
                <p className="font-medium text-gray-900">{trip.takeoff.time}</p>
              </div>
              <div>
                <p className="text-gray-600">From</p>
                <p className="font-medium text-gray-900">{trip.pickup.city}</p>
              </div>
              <div>
                <p className="text-gray-600">Arrival</p>
                <p className="font-medium text-gray-900">{trip.dropoff.city}</p>
              </div>
              <div>
                <p className="text-gray-600">Price per Seat</p>
                <p className="font-medium text-gray-900">
                  ₦{trip.price.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Seats & Booking Codes */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Seats & Booking Codes
          </h3>

          {bookings.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {bookings.map((b) => (
                <div
                  key={b.bookingCode}
                  className="flex flex-col items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-2xl shadow-md"
                >
                  <p className="font-medium text-sm">Seat #{b.seatPosition}</p>
                  <p className="font-bold text-sm mt-1">{b.bookingCode}</p>
                </div>
              ))}
            </div>
          )}

          <div className="border-t pt-3 flex justify-between text-sm">
            <span className="text-gray-600">Total Paid</span>
            <span className="font-bold text-gray-900">
              ₦{totalPaid.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Email Confirmation */}
        <div className="bg-blue-50 rounded-2xl p-4 mb-8 flex items-center gap-3">
          <Mail className="w-5 h-5 text-blue-700" />
          <p className="text-sm text-blue-900">
            A confirmation email with your e-ticket has been sent to{" "}
            <span className="font-medium">
              {localStorage.getItem("userEmail") || "your email"}
            </span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-full border border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-sm"
            onClick={() => window.print()}
          >
            <Ticket className="w-5 h-5" />
            Print Ticket
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-all duration-200 shadow-lg"
            onClick={() => navigate("/")}
          >
            Book Another Trip
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
