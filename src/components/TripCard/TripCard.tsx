import React from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Users, Check, Navigation, AlertCircle } from "lucide-react";

interface Trip {
  id: string;
  type: string;
  class: string;
  badge?: "Best price" | "Premium" | "Limited";
  departure: string;
  arrival: string;
  duration?: string;
  price?: number; // now strictly number
  seats: number;
  pickup: { name: string; address: string };
  dropoff: { name: string; address: string };
  tripName?: string;
  departureDateTime?: string;
  departureTime?: string;
}

export const toTitleCase = (text?: any): string => {
  if (!text) return "";

  // Convert to string just in case (e.g. if it's a number)
  const str = String(text).trim();

  // Replace multiple spaces and hyphens with single spaces
  const normalized = str.replace(/[-_]+/g, " ").replace(/\s+/g, " ");

  // Convert each word to title case
  return normalized
    .split(" ")
    .map((word) =>
      word.length
        ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        : ""
    )
    .join(" ");
};

const formatNaira = (amount?: number) => {
  if (amount === undefined || amount === null) return "-";
  return amount.toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  });
};

interface TripCardProps {
  trip: Trip;
  isFirst?: boolean;
}

const TripCard: React.FC<TripCardProps> = ({ trip, isFirst = false }) => {
  const navigate = useNavigate();
  const badge = "Best price";
  const getBadgeColor = () => "bg-orange-500 text-white";

  const handleSelectTrip = () => {
    // Navigate to booking route with trip id as param
    navigate(`/book/${trip.id}`);
  };

  return (
    <div
      className={`bg-white rounded-3xl p-6 transition-all duration-200 shadow-lg hover:shadow-2xl ${
        isFirst ? "mt-0" : "mt-4"
      } mx-auto`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Navigation className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {trip.tripName || "-"}
            </h3>
            <span className="text-sm text-gray-600">{trip.class || "-"}</span>
          </div>
        </div>

        {badge && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getBadgeColor()}`}
          >
            <AlertCircle className="w-3 h-3" />
            {badge}
          </span>
        )}
      </div>

      {/* Time & Price */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-sm text-gray-600">Departure</p>
            <p className="font-semibold text-gray-900">
              {trip.departureTime}

              {/* {formatDepartureTime(trip.departureTime)} */}
            </p>
          </div>
          <div className="flex items-center gap-2 text-blue-600">
            <Navigation className="w-4 h-4 rotate-90" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Arrival</p>
            <p className="font-semibold text-gray-900">{trip.arrival || "-"}</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500">Price</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatNaira(trip.price)}
          </p>
        </div>
      </div>

      {/* Seats */}
      <div className="flex items-center gap-2 mb-4 text-sm">
        <Users className="w-4 h-4 text-blue-600" />
        <span className="text-gray-700">
          <strong>{trip.seats || 0}</strong> seats available
        </span>
      </div>

      {/* Pickup & Dropoff */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
          <div className="flex items-center gap-2 text-green-700 mb-1">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Pickup</span>
          </div>
          <p className="font-medium text-gray-900">
            {toTitleCase(trip.pickup?.name)}
          </p>
          <p className="text-sm text-gray-600">
            {toTitleCase(trip.pickup?.address)}
          </p>
        </div>

        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
          <div className="flex items-center gap-2 text-blue-700 mb-1">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">Drop-off</span>
          </div>
          <p className="font-medium text-gray-900">
            {toTitleCase(trip.dropoff?.name)}
          </p>
          <p className="text-sm text-gray-600">
            {toTitleCase(trip.dropoff?.address)}
          </p>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleSelectTrip}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-full transition flex items-center justify-center gap-2 shadow-md hover:shadow-xl"
      >
        <Navigation className="w-5 h-5" />
        Select Trip
      </button>
    </div>
  );
};

export default TripCard;
