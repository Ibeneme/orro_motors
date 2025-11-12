// src/pages/SeatSelection.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Check,
  Navigation,
  ChevronLeft,
  Sofa,
  Loader2,
  Bus,
  X,
  Mail,
  Lock,
} from "lucide-react";
import { baseURL } from "../../services/baseurl";

interface Seat {
  _id: string;
  position: number;
  isPaid: boolean;
  isBooked: boolean;
  isBooking: boolean;
}

interface Trip {
  _id: string;
  tripName: string;
  tripId: string;
  pickup: { city: string; location: string };
  dropoff: { city: string; location: string };
  takeoff: { date: string; time: string };
  departureTime: string;
  arrivalTime: string;
  price: number;
  seatCount: number;
  seats: Seat[];
  bus: string;
  vehicleType: string;
}

const SeatSelection: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  //const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Modal States
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    if (!tripId) {
      setError("Invalid trip ID");
      setLoading(false);
      return;
    }

    const fetchTrip = async () => {
      setLoading(true);
      try {
        const response = await axios.post(
          `${baseURL}/trips/search-trips-by-id`,
          {
            ids: [tripId],
          }
        );
        if (response.data.success && response.data.trips[0]) {
          const fetchedTrip = response.data.trips[0];
          // Ensure seats are sorted by position (1,2,3...) from index 0
          fetchedTrip.seats = fetchedTrip.seats.sort(
            (a: Seat, b: Seat) => a.position - b.position
          );
          setTrip(fetchedTrip);
        } else {
          setError("Trip not found");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load trip");
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [tripId]);

  const toggleSeat = (position: number, seatId: string) => {
    const seat = trip?.seats.find((s) => s.position === position);
    if (!seat || seat.isBooked || seat.isBooking) return;

    setSelectedSeats((prev) =>
      prev.includes(position)
        ? prev.filter((p) => p !== position)
        : [...prev, position]
    );

    setSelectedSeatIds((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  const totalPrice = selectedSeats.length * (trip?.price || 0);

  const initiatePayment = async () => {
    if (selectedSeatIds.length === 0) return;

    const userData = localStorage.getItem("user");
    if (!userData || !trip) return;

    const user = JSON.parse(userData);
    const token = localStorage.getItem("token");

    setPaymentLoading(true);
    setModalError("");

    try {
      localStorage.removeItem("selectedSeatIds");
      localStorage.setItem("selectedSeatIds", JSON.stringify(selectedSeatIds));

      const payload = {
        email: user.email,
        amount:( trip.price * selectedSeatIds.length ),
        callback_url: `${window.location.origin}/payment-success?email=${user.email}`,
        seatIds: selectedSeatIds,
        userId: user._id,
        tripId: tripId,
      };

      const res = await axios.post(
        `${baseURL}/pay/create-paystack-payment`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        localStorage.setItem("paymentReference", res.data.reference);
        window.location.href = res.data.authorizationUrl;
        return;
      }
    } catch (err: any) {
      setModalError(
        err.response?.data?.error || "Payment initialization failed"
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleProceedToPayment = async () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.email) {
          await initiatePayment();
          return;
        }
      } catch (e) {}
    }

    setShowEmailModal(true);
  };

  const sendOtp = async () => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setModalError("Please enter a valid email");
      return;
    }

    setModalLoading(true);
    setModalError("");
    try {
      const res = await axios.post(`${baseURL}/users/send-otp`, { email });
      if (res.data.success) {
        setShowEmailModal(false);
        setShowOtpModal(true);
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setModalLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setModalError("Enter valid 6-digit OTP");
      return;
    }

    setModalLoading(true);
    setModalError("");
    try {
      const res = await axios.post(`${baseURL}/users/verify-otp`, {
        email,
        otp,
      });
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setShowOtpModal(false);
        await initiatePayment();
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setModalLoading(false);
    }
  };

  const FullScreenLoader = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
        <p className="text-lg text-gray-600 font-medium">
          Loading trip details...
        </p>
      </div>
    </div>
  );

  if (loading) return <FullScreenLoader />;
  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-12 h-12 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold mb-3">Trip Unavailable</h3>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Sort seats by position (1 to 12) — index 0 = seat 1
  const sortedSeats = [...trip.seats].sort((a, b) => a.position - b.position);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 pt-20 pb-32 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Trip Header */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 mb-8 border border-white/50">
            <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                  <Bus className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                  {trip.tripName}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Trip ID: {trip.tripId}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs sm:text-sm text-gray-500">Bus Type</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {trip.bus} ({trip.vehicleType})
                </p>
              </div>
            </div>

            <div className="hidden md:grid grid-cols-3 gap-6 text-center">
              <div className="bg-blue-50 rounded-2xl p-5">
                <p className="text-sm text-blue-700 font-medium">From</p>
                <p className="text-xl font-bold text-blue-900">
                  {trip.pickup.city}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  {trip.pickup.location}
                </p>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mt-2">
                    Departure: {trip.departureTime}
                  </p>
                </div>
              </div>
              <div className="bg-purple-50 rounded-2xl p-5">
                <p className="text-sm text-purple-700 font-medium">To</p>
                <p className="text-xl font-bold text-purple-900">
                  {trip.dropoff.city}
                </p>
                <p className="text-sm text-purple-600 mt-1">
                  {trip.dropoff.location}
                </p>
              </div>
            </div>

            <div className="md:hidden text-center py-4 border-t border-gray-200">
              <p className="text-lg font-bold text-gray-800">
                {trip.pickup.city} to {trip.dropoff.city}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {trip.pickup.location} → {trip.dropoff.location}
              </p>
            </div>
          </div>

          {/* Seat Map - Dynamic Grid Based on seatCount */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-10 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h2 className="text-xl sm:text-2xl font-bold">
                Select Your Seat(s) ({selectedSeats.length} selected)
              </h2>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                ₦{trip.price.toLocaleString()} per seat
              </p>
            </div>

            <div className="relative">
              <div className="absolute top-4 left-4 bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-lg z-10">
                Driver
              </div>

              {/* Dynamic grid: 5 columns for VIP/Sienna (12 seats), fallback to 25 */}
              <div
                className={`grid ${
                  trip.seatCount <= 16
                    ? "grid-cols-4 gap-5"
                    : "grid-cols-5 gap-4"
                } mt-16 max-w-3xl mx-auto`}
              >
                {sortedSeats.map((seat) => {
                  const isSelected = selectedSeats.includes(seat.position);
                  const isBooked = seat.isBooked || seat.isBooking;

                  return (
                    <button
                      key={seat._id}
                      onClick={() => toggleSeat(seat.position, seat._id)}
                      disabled={isBooked}
                      className="relative group transition-all duration-300 hover:scale-110 disabled:cursor-not-allowed"
                    >
                      <div
                        className={`w-16 h-16 rounded-2xl border-4 flex items-center justify-center shadow-xl transition-all ${
                          isSelected
                            ? "bg-gradient-to-br from-blue-500 to-purple-600 border-purple-700 scale-125"
                            : isBooked
                            ? "bg-gray-300 border-gray-400"
                            : "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300 hover:border-blue-500 hover:shadow-2xl"
                        }`}
                      >
                        {isSelected ? (
                          <Check className="w-9 h-9 text-white animate-pulse" />
                        ) : (
                          <Sofa
                            className={`w-10 h-10 ${
                              isBooked
                                ? "text-gray-500"
                                : "text-gray-700 group-hover:text-blue-600"
                            }`}
                          />
                        )}
                      </div>
                      <span
                        className={`absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-bold ${
                          isSelected
                            ? "text-purple-600"
                            : isBooked
                            ? "text-gray-400"
                            : "text-gray-700"
                        }`}
                      >
                        {seat.position}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-20 flex flex-wrap justify-center gap-10 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-50 to-gray-100 border-4 border-gray-300 rounded-2xl" />
                <span className="font-medium text-gray-700">Available</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-300 border-4 border-gray-400 rounded-2xl" />
                <span className="font-medium text-gray-700">Booked</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 border-4 border-purple-700 rounded-2xl" />
                <span className="font-medium text-gray-700">Selected</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl text-white">
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-base font-medium mb-3 opacity-90">
                  Your Selection
                </p>
                <div className="flex flex-wrap gap-3">
                  {selectedSeats.length === 0 ? (
                    <p className="text-white/80 italic">No seats selected</p>
                  ) : (
                    selectedSeats
                      .sort((a, b) => a - b)
                      .map((pos) => (
                        <span
                          key={pos}
                          className="px-5 py-3 bg-white/25 backdrop-blur-sm rounded-full font-bold text-lg shadow-lg"
                        >
                          Seat {pos}
                        </span>
                      ))
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Total Amount</p>
                <p className="text-5xl font-bold">
                  ₦{totalPrice.toLocaleString()}
                </p>
                {selectedSeats.length > 0 && (
                  <p className="text-sm opacity-80 mt-2">
                    {selectedSeats.length} seat
                    {selectedSeats.length > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-white text-gray-800 font-bold rounded-full border-2 border-gray-200 hover:border-gray-300 hover:shadow-2xl transition-all group"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition" />
              Back
            </button>

            <button
              disabled={selectedSeats.length === 0 || paymentLoading}
              onClick={handleProceedToPayment}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 font-bold text-white rounded-full transition-all shadow-2xl ${
                (selectedSeats.length,
                paymentLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105")
              }`}
            >
              {paymentLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Navigation className="w-5 h-5" />
              )}
              {paymentLoading ? "Processing..." : "Proceed to Payment"}
              {selectedSeats.length > 0 && !paymentLoading && (
                <span className="font-bold">({selectedSeats.length})</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* EMAIL & OTP MODALS */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-3">
                <Mail className="w-8 h-8 text-blue-600" />
                Verify Your Email
              </h3>
              <button onClick={() => setShowEmailModal(false)}>
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              We need your email to complete payment
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendOtp()}
              placeholder="you@example.com"
              className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 text-lg"
              autoFocus
            />
            {modalError && (
              <p className="text-red-500 text-sm mt-3">{modalError}</p>
            )}
            <button
              onClick={sendOtp}
              disabled={modalLoading}
              className="mt-6 w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:scale-105 transition flex items-center justify-center gap-3"
            >
              {modalLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                "Send OTP"
              )}
            </button>
          </div>
        </div>
      )}

      {showOtpModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-3">
                <Lock className="w-8 h-8 text-purple-600" />
                Enter OTP
              </h3>
              <button onClick={() => setShowOtpModal(false)}>
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Check your email: <strong>{email}</strong>
            </p>
            <input
              type="text"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              onKeyDown={(e) =>
                e.key === "Enter" && otp.length === 6 && verifyOtp()
              }
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-4 text-center text-3xl font-bold tracking-widest border border-gray-300 rounded-xl focus:outline-none focus:border-purple-500"
              autoFocus
            />
            {modalError && (
              <p className="text-red-500 text-sm mt-3">{modalError}</p>
            )}
            <button
              onClick={verifyOtp}
              disabled={modalLoading || otp.length !== 6}
              className="mt-6 w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:scale-105 transition flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {modalLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                "Verify & Pay"
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SeatSelection;
