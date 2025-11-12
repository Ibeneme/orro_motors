import React, { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Search, Filter } from "lucide-react";
import TripCard, { toTitleCase } from "../../components/TripCard/TripCard";
import axios from "axios";
import { baseURL } from "../../services/baseurl";
import { useToast } from "../../components/Toast/Toast";

interface Trip {
  _id: string;
  tripName: string;
  bus?: string;
  type?: string;
  class?: string;
  badge?: string;
  departureTime: string;
  arrivalTime: string;
  duration?: string;
  price?: string;
  seats?: any[];
  seatCount: number;
  pickup: { city: string; location: string };
  dropoff: { city: string; location: string };
  takeoff: { date: string; time: string };
  status: string;
  createdAt: string;
  updatedAt: string;
  departureDateTime?: any;
}

interface LocationState {
  from: string;
  to: string;
  departureDate: string;
  trips: Trip[];
}

const TripResults: React.FC = () => {
  const location = useLocation();
  const stateData = location.state as LocationState[] | undefined;
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const from = stateData?.[0]?.from || "";
  const to = stateData?.[0]?.to || "";
  const initialTrips = stateData?.[0]?.trips || [];

  // Extract all _ids
  const tripIds = initialTrips.map((trip) => trip._id);

  // Fetch trips by _id on component mount
  useEffect(() => {
    if (tripIds.length === 0) return;

    const fetchTripsByIds = async () => {
      setLoading(true);
      try {
        const response = await axios.post(
          `${baseURL}/trips/search-trips-by-id`,
          {
            ids: tripIds,
          }
        );

        const fetchedTrips: Trip[] = response.data?.trips || [];
        setTrips(fetchedTrips);

        console.log("✅ Fetched trips by IDs:", fetchedTrips);

        if (fetchedTrips.length > 0) {
          addToast({
            type: "success",
            title: "Trips Refreshed!",
            message: `Fetched ${fetchedTrips.length} latest trips.`,
          });
        } else {
          addToast({
            type: "error",
            title: "No Trips Found",
            message: "No trips found for the provided IDs.",
          });
        }
      } catch (err: any) {
        console.error("❌ Error fetching trips by IDs:", err);
        addToast({
          type: "error",
          title: "Search Failed",
          message:
            err.response?.data?.message ||
            "Unable to fetch trips. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTripsByIds();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");

  // Filter trips by search term
  const filteredTrips = useMemo(() => {
    if (!searchTerm) return trips;
    return trips.filter(
      (trip) =>
        trip.tripName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.pickup.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.dropoff.city.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, trips]);

  // Spinner Loader Component
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-32 pb-16">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin animation-delay-300"></div>
          </div>
          <p className="text-lg text-gray-600 font-medium animate-pulse">
            Loading trips...
          </p>
        </div>
      </div>
    );
  }

  const validBadge = (
    badge: string | undefined
  ): "Best price" | "Premium" | "Limited" | undefined => {
    if (badge === "Best price" || badge === "Premium" || badge === "Limited")
      return badge;
    return undefined;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Available Trips</h2>
          <div className="flex items-center justify-between mt-2">
            <p className="text-lg text-gray-700">
              {toTitleCase(from)} <span className="text-blue-600">→</span>{" "}
              {toTitleCase(to)}
            </p>
            <p className="text-sm text-gray-600">
              <strong>{filteredTrips.length}</strong> trips found
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-6 flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 text-gray-500">
            <Search className="w-5 h-5" />
            <input
              type="text"
              placeholder="Search trips"
              className="flex-1 outline-none text-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Trip Cards */}
        <div className="space-y-6">
          {filteredTrips.length > 0 ? (
            filteredTrips.map((trip, index) => (
              <TripCard
                key={trip._id}
                trip={{
                  id: trip?._id || "",
                  type: trip.bus || "-",
                  class: trip.status || "-",
                  badge: validBadge(trip.badge),
                  departure: trip.takeoff?.time || trip.departureTime || "-",
                  arrival: trip.arrivalTime || "-",
                  duration: trip.departureDateTime || "-",
                  price: trip.price ? Number(trip.price) : 0,
                  seats: trip.seatCount || 0,
                  departureTime: trip?.departureTime || "",
                  pickup: {
                    name: trip.pickup?.city
                      ? toTitleCase(trip.pickup.city)
                      : "-",
                    address: trip.pickup?.location
                      ? toTitleCase(trip.pickup.location)
                      : "-",
                  },
                  dropoff: {
                    name: trip.dropoff?.city
                      ? toTitleCase(trip.dropoff.city)
                      : "-",
                    address: trip.dropoff?.location
                      ? toTitleCase(trip.dropoff.location)
                      : "-",
                  },
                  tripName: trip.tripName || "",
                  departureDateTime: trip.takeoff
                    ? `${trip.takeoff.date}T${trip.takeoff.time}`
                    : undefined,
                }}
                isFirst={index === 0}
              />
            ))
          ) : (
            <p className="text-center text-gray-500">
              No trips match your search.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripResults;
