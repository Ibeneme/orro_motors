// src/components/HeroSection.tsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import second from "../../assets/hero.png";
import { MapPin, Calendar, Search, Loader2, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { baseURL } from "../../services/baseurl";
import { useToast } from "../Toast/Toast";

interface City {
  _id: string;
  name: string;
  state: string;
  terminal: string;
}

const HeroSection: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [from, setFrom] = useState<City | null>(null);
  const [to, setTo] = useState<City | null>(null);
  const [departureDate, setDepartureDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingCities, setFetchingCities] = useState(true);
  const [fromSearch, setFromSearch] = useState("");
  const [toSearch, setToSearch] = useState("");
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  const { addToast } = useToast();
  const navigate = useNavigate();

  // FETCH CITIES
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const { data } = await axios.get(`${baseURL}/cities`);
        if (data.success) {
          setCities(data.data || []);
        } else {
          addToast({
            type: "error",
            title: "Failed to load cities",
            message: "Please refresh the page.",
          });
        }
      } catch {
        addToast({
          type: "error",
          title: "Network Error",
          message: "Could not load cities. Check your connection.",
        });
      } finally {
        setFetchingCities(false);
      }
    };
    fetchCities();
  }, [addToast]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fromRef.current && !fromRef.current.contains(e.target as Node)) {
        setShowFromDropdown(false);
      }
      if (toRef.current && !toRef.current.contains(e.target as Node)) {
        setShowToDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter cities
  const filteredFromCities = useMemo(() => {
    return cities.filter(
      (c) =>
        c.name.toLowerCase().includes(fromSearch.toLowerCase()) ||
        c.state.toLowerCase().includes(fromSearch.toLowerCase())
    );
  }, [cities, fromSearch]);

  const filteredToCities = useMemo(() => {
    return cities.filter(
      (c) =>
        c.name.toLowerCase().includes(toSearch.toLowerCase()) ||
        c.state.toLowerCase().includes(toSearch.toLowerCase())
    );
  }, [cities, toSearch]);

  // Handlers
  const selectFrom = (city: City) => {
    setFrom(city);
    setShowFromDropdown(false);
    setFromSearch("");
  };

  const selectTo = (city: City) => {
    setTo(city);
    setShowToDropdown(false);
    setToSearch("");
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!from || !to || !departureDate) {
      addToast({
        type: "error",
        title: "Missing Info",
        message: "Please select origin, destination, and date.",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${baseURL}/trips/search-trips/`, {
        pickupCity: from.name,
        pickupLocation: from.terminal,
        destinationCity: to.name,
        destinationLocation: to.terminal,
        departureDate,
      });

      const trips = response.data?.trips || [];

      if (Array.isArray(trips) && trips.length > 0) {
        addToast({
          type: "success",
          title: "Trips Found!",
          message: `Found ${trips.length} trip${trips.length > 1 ? "s" : ""}.`,
        });

        navigate("/search", {
          state: [
            {
              from: `${from.name}-${(from.terminal)}`,
              to: `${to.name}-${(to.terminal)}`,
              departureDate,
              trips,
            },
          ],
        });
      } else {
        addToast({
          type: "success",
          title: "No Trips",
          message: "No trips available for this route and date.",
        });
      }
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Search Failed",
        message: err.response?.data?.message || "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ marginTop: 120 }}></div>
      <section className="relative md:m-16 m-6 md:mb-32">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-[12px] overflow-hidden h-[550px]"
          style={{ backgroundImage: `url('${second}')` }}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "#004A9C78" }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto px-6 py-12 md:py-20">
          <div className="text-white mb-8 md:mb-36 max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              Book your next trip in seconds.
            </h1>
            <p className="text-base md:text-lg text-gray-200">
              Search schedules, select seats and pay securely — all from one
              place.
            </p>
          </div>

          {/* Search Form */}
          <div className="relative flex justify-center">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-6 md:p-8 max-w-6xl w-full">
              <form className="space-y-5" onSubmit={handleSearch}>
                {/* FROM */}
                <div ref={fromRef} className="relative">
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                    From
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setShowFromDropdown(true);
                      setFromSearch("");
                    }}
                    className={`w-full px-4 py-3 pr-10 bg-gray-50 border ${
                      showFromDropdown
                        ? "border-blue-500 ring-2 ring-blue-500"
                        : "border-gray-200"
                    } rounded-2xl text-left text-gray-700 flex items-center justify-between focus:outline-none transition-all duration-200`}
                  >
                    <span className={from ? "font-medium" : "text-gray-400"}>
                      {from ? `${from.name} - ${from.terminal}` : "Where from?"}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                        showFromDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showFromDropdown && (
                    <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                      <input
                        type="text"
                        placeholder="Search city..."
                        value={fromSearch}
                        onChange={(e) => setFromSearch(e.target.value)}
                        className="w-full px-4 py-2 border-b border-gray-200 focus:outline-none sticky top-0 bg-white"
                        autoFocus
                      />
                      {filteredFromCities.length > 0 ? (
                        filteredFromCities.map((city) => (
                          <button
                            key={city._id}
                            type="button"
                            onClick={() => selectFrom(city)}
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 transition flex justify-between items-center"
                          >
                            <span className="font-medium">
                              {city.name} - {city.terminal}
                            </span>
                            <span className="text-xs text-gray-500">
                              {city.state}
                            </span>
                          </button>
                        ))
                      ) : (
                        <p className="px-4 py-3 text-sm text-gray-500">
                          No cities found
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* TO */}
                <div ref={toRef} className="relative">
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                    To
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setShowToDropdown(true);
                      setToSearch("");
                    }}
                    className={`w-full px-4 py-3 pr-10 bg-gray-50 border ${
                      showToDropdown
                        ? "border-blue-500 ring-2 ring-blue-500"
                        : "border-gray-200"
                    } rounded-2xl text-left text-gray-700 flex items-center justify-between focus:outline-none transition-all duration-200`}
                  >
                    <span className={to ? "font-medium" : "text-gray-400"}>
                      {to ? `${to.name} - ${to.terminal}` : "Where to?"}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                        showToDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showToDropdown && (
                    <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                      <input
                        type="text"
                        placeholder="Search city..."
                        value={toSearch}
                        onChange={(e) => setToSearch(e.target.value)}
                        className="w-full px-4 py-2 border-b border-gray-200 focus:outline-none sticky top-0 bg-white"
                        autoFocus
                      />
                      {filteredToCities.length > 0 ? (
                        filteredToCities.map((city) => (
                          <button
                            key={city._id}
                            type="button"
                            onClick={() => selectTo(city)}
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 transition flex justify-between items-center"
                          >
                            <span className="font-medium">
                              {city.name} - {city.terminal}
                            </span>
                            <span className="text-xs text-gray-500">
                              {city.state}
                            </span>
                          </button>
                        ))
                      ) : (
                        <p className="px-4 py-3 text-sm text-gray-500">
                          No cities found
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* DEPARTURE DATE */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                    Departure date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={departureDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      required
                      className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-2xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* SEARCH BUTTON */}
                <button
                  type="submit"
                  disabled={loading || fetchingCities}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 rounded-full flex items-center justify-center space-x-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      <span>Search trips</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
