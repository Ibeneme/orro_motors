// src/pages/ManageTrips.tsx
import React, { useState, useEffect } from "react";
import {
  Pencil,
  Trash2,
  Plus,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle,
  Bus as BusIcon,
  User,
  Loader2,
} from "lucide-react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import TripModals from "./TripModals";
import { showSuccess, showError } from "../components/Toast/Toast";
import { baseURL } from "../services/baseurl";

export interface Seat {
  _id: string;
  position: number;
  isBooked: boolean;
  isPaid: boolean;
}

export interface City {
  _id: string;
  name: string;
  state: string;
  terminal: string;
}

export interface Trip {
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

export default function ManageTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Trip>>({
    tripName: "",
    bus: "",
    vehicleType: "Sienna",
    seatCount: 0,
    price: 0,
    departureTime: "",
    arrivalTime: "",
    pickup: { city: "", location: "" },
    dropoff: { city: "", location: "" },
    takeoff: { date: "", time: "" },
  });
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [viewingTrip, setViewingTrip] = useState<Trip | null>(null);
  const [deletingTrip, setDeletingTrip] = useState<Trip | null>(null);
  const [confirmCreate, setConfirmCreate] = useState(false);
  const [confirmUpdate, setConfirmUpdate] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 5;

  const token = localStorage.getItem("adminToken");
  const adminData = JSON.parse(localStorage.getItem("admin") || "{}");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  // Helper to format city + terminal
  const cityLabel = (c: City) => `${c.name} - ${c.terminal}`;

  // FETCH CITIES
  const fetchCities = async () => {
    try {
      const { data } = await axios.get(`${baseURL}/cities`, axiosConfig);
      if (data.success) setCities(data.data || []);
    } catch (err) {
      showError("Failed to load cities", "Please refresh");
    }
  };

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

  useEffect(() => {
    fetchCities();
    fetchTrips();
  }, []);

  const handleChange = (key: keyof Trip, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleNestedChange = (
    parent: "pickup" | "dropoff" | "takeoff",
    key: "city" | "location" | "date" | "time",
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [parent]: { ...(prev[parent] as any), [key]: value },
    }));
  };

  // Handle city selection (concatenated)
  const handleCitySelect = (parent: "pickup" | "dropoff", label: string) => {
    const city = cities?.find((c) => cityLabel(c) === label);
    if (city) {
      setForm((prev) => ({
        ...prev,
        [parent]: { city: city?.name, location: city?.terminal },
      }));
    }
  };

  const resetForm = () => {
    setForm({
      tripName: "",
      bus: "",
      vehicleType: "Sienna",
      seatCount: 0,
      price: 0,
      departureTime: "",
      arrivalTime: "",
      pickup: { city: "", location: "" },
      dropoff: { city: "", location: "" },
      takeoff: { date: "", time: "" },
    });
    setEditingTrip(null);
  };

  const validateForm = () => {
    const required: [string, string][] = [
      ["tripName", "Trip Name"],
      ["bus", "Bus Number"],
      ["vehicleType", "Vehicle Type"],
      ["seatCount", "Total Seats"],
      ["price", "Price"],
      ["departureTime", "Departure Time"],
      ["arrivalTime", "Arrival Time"],
      ["pickup.city", "Pickup City"],
      ["dropoff.city", "Dropoff City"],
      ["takeoff.date", "Takeoff Date"],
      ["takeoff.time", "Takeoff Time"],
    ];

    for (const [path, label] of required) {
      const keys = path.split(".");
      let value: any = form;
      for (const k of keys) value = value?.[k];
      if (!value) {
        showError("Required", `${label} is missing`);
        return false;
      }
    }
    return true;
  };

  const handleCreateTrip = async () => {
    console.log(form);
    if (!validateForm()) return;
    setActionLoading(true);
    try {
      const payload = { ...form, admin: adminData._id };
      const { data } = await axios.post(
        `${baseURL}/trips/create-new-trip`,
        payload,
        axiosConfig
      );
      if (data.success) {
        await fetchTrips();
        setShowForm(false);
        resetForm();
        setConfirmCreate(false);
        showSuccess("Success!", `"${form.tripName}" launched`);
      }
    } catch (err: any) {
      showError("Failed", err.response?.data?.message || "Try again");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTrip = async () => {
    console.log(form);
    if (!editingTrip?._id) return;
    setActionLoading(true);
    try {
      const { seatCount, ...payload } = form;

      const { data } = await axios.put(
        `${baseURL}/trips/update-trip-details/`,
        { id: editingTrip._id, ...payload },
        axiosConfig
      );

      if (data.success) {
        await fetchTrips();
        setEditingTrip(null);
        resetForm();
        setConfirmUpdate(false);
        showSuccess("Updated!", `"${form.tripName}" saved`);
      }
    } catch (err: any) {
      showError("Update Failed", err.response?.data?.message || "Try again");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTrip = async () => {
    if (!deletingTrip?._id) return;
    setActionLoading(true);
    try {
      await axios.delete(`${baseURL}/trips/delete/`, {
        ...axiosConfig,
        data: { id: deletingTrip._id },
      });
      await fetchTrips();
      setDeletingTrip(null);
      showSuccess("Deleted!", `"${deletingTrip.tripName}" removed`);
    } catch {
      showError("Delete Failed", "Try again");
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (trip: Trip) => {
    setEditingTrip(trip);
    setForm({
      tripName: trip.tripName || "",
      bus: trip.bus || "",
      vehicleType: trip.vehicleType || "Sienna",
      // seatCount: trip.seatCount || 25,
      price: trip.price || 0,
      departureTime: trip.departureTime || "",
      arrivalTime: trip.arrivalTime || "",
      pickup: {
        city: trip.pickup?.city || "",
        location: trip.pickup?.location || "",
      },
      dropoff: {
        city: trip.dropoff?.city || "",
        location: trip.dropoff?.location || "",
      },
      takeoff: {
        date: trip.takeoff?.date || "",
        time: trip.takeoff?.time || "",
      },
    });
  };

  // Generate time options: 00:00, 00:15, ..., 23:45 in 12-hour format
  const generateTimeOptions = (): React.ReactNode[] => {
    const options: React.ReactNode[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hour = h.toString().padStart(2, "0");
        const minute = m.toString().padStart(2, "0");
        const displayHour = ((h + 11) % 12) + 1;
        const ampm = h >= 12 ? "PM" : "AM";
        const value = `${hour}:${minute}`;
        const label = `${displayHour}:${minute} ${ampm} (${value})`;

        options.push(
          React.createElement("option", { key: value, value }, label)
        );
      }
    }
    return options;
  };

  const displayedTrips = trips.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(trips.length / perPage);

  if (loading) {
    return (
      <AdminLayout title="Trips" subtitle="Loading...">
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-6" />
            <p className="text-xl font-medium text-gray-700">
              Loading trips...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Trips Management" subtitle="Manage all trips">
      {actionLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center">
            <Loader2 className="w-14 h-14 text-blue-600 animate-spin mb-4" />
            <p className="text-lg font-semibold text-gray-800">Processing...</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-300 p-8 mb-10">
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) resetForm();
          }}
          className="flex items-center gap-3 text-blue-600 font-bold text-xl mb-8 hover:text-blue-700 transition"
        >
          <Plus className="w-7 h-7" />
          {showForm ? "Hide Form" : "Add New Trip"}
        </button>

        {showForm && (
          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Trip Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Trip Name
                </label>
                <input
                  type="text"
                  value={form.tripName || ""}
                  onChange={(e) => handleChange("tripName", e.target.value)}
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-300 outline-none transition text-lg"
                  placeholder="Abuja to Enugu Express"
                />
              </div>

              {/* Bus Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Bus Number
                </label>
                <input
                  type="text"
                  value={form.bus || ""}
                  onChange={(e) => handleChange("bus", e.target.value)}
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-300 outline-none transition text-lg"
                  placeholder="BUS-45"
                />
              </div>

              {/* Vehicle Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Vehicle Type
                </label>
                <select
                  value={form.vehicleType || "Sienna"}
                  onChange={(e) => handleChange("vehicleType", e.target.value)}
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-300 outline-none transition text-lg"
                >
                  <option value="Sienna">Sienna</option>
                  <option value="Coaster">Coaster</option>
                  <option value="Bus">Bus</option>
                </select>
              </div>

              {/* Total Seats */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Total Seats
                </label>
                <input
                  type="number"
                  value={form.seatCount || ""}
                  onChange={(e) =>
                    handleChange("seatCount", Number(e.target.value))
                  }
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-300 outline-none transition text-lg"
                  placeholder="25"
                />
              </div>

              {/* Price with Naira */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Price (₦)
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 font-bold text-lg">
                    ₦
                  </span>
                  <input
                    type="number"
                    value={form.price || ""}
                    onChange={(e) =>
                      handleChange("price", Number(e.target.value))
                    }
                    className="w-full pl-12 pr-5 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-300 outline-none transition text-lg"
                    placeholder="40000"
                  />
                </div>
              </div>

              {/* Departure Time – Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Departure Time
                </label>
                <select
                  value={form.departureTime || ""}
                  onChange={(e) =>
                    handleChange("departureTime", e.target.value)
                  }
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-300 outline-none transition text-lg"
                >
                  <option value="">Select Departure Time</option>
                  {generateTimeOptions()}
                </select>
              </div>

              {/* Arrival Time – Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Arrival Time
                </label>
                <select
                  value={form.arrivalTime || ""}
                  onChange={(e) => handleChange("arrivalTime", e.target.value)}
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-300 outline-none transition text-lg"
                >
                  <option value="">Select Arrival Time</option>
                  {generateTimeOptions()}
                </select>
              </div>

              {/* Pickup (City - Terminal) */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Pickup (City - Terminal)
                </label>
                <select
                  value={
                    form.pickup?.city
                      ? cityLabel(
                          cities.find((c) => c.name === form.pickup?.city)!
                        )
                      : ""
                  }
                  onChange={(e) => handleCitySelect("pickup", e.target.value)}
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-300 outline-none transition text-lg"
                >
                  <option value="">Select Pickup</option>
                  {cities.map((c) => (
                    <option key={c._id} value={cityLabel(c)}>
                      {cityLabel(c)} ({c.state})
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropoff (City - Terminal) */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Dropoff (City - Terminal)
                </label>
                <select
                  value={
                    form.dropoff?.city
                      ? cityLabel(
                          cities.find((c) => c.name === form.dropoff?.city)!
                        )
                      : ""
                  }
                  onChange={(e) => handleCitySelect("dropoff", e.target.value)}
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-300 outline-none transition text-lg"
                >
                  <option value="">Select Dropoff</option>
                  {cities.map((c) => (
                    <option key={c._id} value={cityLabel(c)}>
                      {cityLabel(c)} ({c.state})
                    </option>
                  ))}
                </select>
              </div>

              {/* Takeoff Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Takeoff Date
                </label>
                <input
                  type="date"
                  value={form.takeoff?.date || ""}
                  onChange={(e) =>
                    handleNestedChange("takeoff", "date", e.target.value)
                  }
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-300 outline-none transition text-lg"
                />
              </div>

              {/* Takeoff Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Takeoff Time
                </label>
                <input
                  type="time"
                  value={form.takeoff?.time || ""}
                  onChange={(e) =>
                    handleNestedChange("takeoff", "time", e.target.value)
                  }
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-300 outline-none transition text-lg"
                />
              </div>
            </div>

            <div className="mt-10 flex justify-end gap-6">
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-10 py-5 border-2 border-gray-400 text-gray-700 rounded-2xl hover:bg-gray-100 transition font-bold text-lg"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  editingTrip ? setConfirmUpdate(true) : setConfirmCreate(true)
                }
                className="px-10 py-5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition font-bold text-lg flex items-center gap-3"
              >
                <CheckCircle className="w-6 h-6" />
                {editingTrip ? "Update Trip" : "Launch Trip"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* TABLE & MOBILE VIEW */}
      <div className="bg-white rounded-2xl border border-gray-300 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-900">
            All Trips ({trips.length})
          </h2>
        </div>

        {/* MOBILE CARD VIEW */}
        <div className="block lg:hidden">
          {displayedTrips.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-lg">
              No trips found. Create one above!
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {displayedTrips.map((trip) => {
                const paid = trip.seats?.filter((s) => s.isPaid).length || 0;
                const booked =
                  trip.seats?.filter((s) => s.isBooked).length || 0;
                const available = trip.seatCount - booked;

                const pickupLabel = cities.find(
                  (c) => c.name === trip.pickup?.city
                )
                  ? `${trip.pickup?.city} - ${trip.pickup?.location}`
                  : trip.pickup?.city;

                const dropoffLabel = cities.find(
                  (c) => c.name === trip.dropoff?.city
                )
                  ? `${trip.dropoff?.city} - ${trip.dropoff?.location}`
                  : trip.dropoff?.city;

                return (
                  <div
                    key={trip._id}
                    className="bg-gray-50 rounded-2xl p-6 border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-bold text-xl text-gray-900">
                          {trip.tripName}
                        </p>
                        <p className="text-sm text-gray-600">
                          ID: {trip.tripId || "-"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewingTrip(trip)}
                          className="p-2 bg-purple-100 rounded-lg"
                        >
                          <Eye className="w-5 h-5 text-purple-700" />
                        </button>
                        <button
                          onClick={() => openEditModal(trip)}
                          className="p-2 bg-blue-100 rounded-lg"
                        >
                          <Pencil className="w-5 h-5 text-blue-700" />
                        </button>
                        <button
                          onClick={() => setDeletingTrip(trip)}
                          className="p-2 bg-red-100 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5 text-red-700" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Bus</p>
                        <p className="font-bold flex items-center gap-2">
                          <BusIcon className="w-4 h-4" /> {trip.bus}
                        </p>
                        <p className="text-xs text-gray-500">
                          {trip.vehicleType}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Route</p>
                        <p className="font-bold text-xs">
                          {pickupLabel} to {dropoffLabel}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Time</p>
                        <p className="text-sm">Dep: {trip.departureTime}</p>
                        <p className="text-sm">Arr: {trip.arrivalTime}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Price</p>
                        <p className="font-bold text-lg">
                          ₦{(trip.price || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Seats</p>
                        <div className="flex gap-3 text-center">
                          <div>
                            <p className="font-bold text-green-600 text-lg">
                              {paid}
                            </p>
                            <p className="text-xs">Paid</p>
                          </div>
                          <div>
                            <p className="font-bold text-yellow-600 text-lg">
                              {booked - paid}
                            </p>
                            <p className="text-xs">Hold</p>
                          </div>
                          <div>
                            <p className="font-bold text-blue-600 text-lg">
                              {available}
                            </p>
                            <p className="text-xs">Free</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-600">Admin</p>
                        <p className="flex items-center gap-2">
                          <User className="w-4 h-4" />{" "}
                          {trip.admin?.name || "Admin"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-gray-100 border-b-2 border-gray-300">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Trip
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Bus
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Route
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Seats
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Admin
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayedTrips.map((trip) => {
                const paid = trip.seats?.filter((s) => s.isPaid).length || 0;
                const booked =
                  trip.seats?.filter((s) => s.isBooked).length || 0;
                const available = trip.seatCount - booked;

                const pickupLabel = cities.find(
                  (c) => c.name === trip.pickup?.city
                )
                  ? `${trip.pickup?.city} - ${trip.pickup?.location}`
                  : trip.pickup?.city;

                const dropoffLabel = cities.find(
                  (c) => c.name === trip.dropoff?.city
                )
                  ? `${trip.dropoff?.city} - ${trip.dropoff?.location}`
                  : trip.dropoff?.city;

                return (
                  <tr key={trip._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-5">
                      <p className="font-bold text-gray-900">{trip.tripName}</p>
                      <p className="text-sm text-gray-600">{trip.tripId}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <BusIcon className="w-5 h-5 text-blue-600" />
                        <span className="font-bold">{trip.bus}</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {trip.vehicleType}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-semibold text-xs">
                        {pickupLabel} to {dropoffLabel}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-sm">
                      <p>
                        <strong>Dep:</strong> {trip.departureTime}
                      </p>
                      <p>
                        <strong>Arr:</strong> {trip.arrivalTime}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex gap-3 justify-center">
                        <div>
                          <p className="font-bold text-green-600">{paid}</p>
                          <p className="text-xs">Paid</p>
                        </div>
                        <div>
                          <p className="font-bold text-yellow-600">
                            {booked - paid}
                          </p>
                          <p className="text-xs">Hold</p>
                        </div>
                        <div>
                          <p className="font-bold text-blue-600">{available}</p>
                          <p className="text-xs">Free</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-bold">
                      ₦{(trip.price || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          {trip.admin?.name || "Admin"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 flex justify-center gap-2">
                      <button
                        onClick={() => setViewingTrip(trip)}
                        className="p-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition"
                      >
                        <Eye className="w-4 h-4 text-purple-700" />
                      </button>
                      <button
                        onClick={() => openEditModal(trip)}
                        className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition"
                      >
                        <Pencil className="w-4 h-4 text-blue-700" />
                      </button>
                      <button
                        onClick={() => setDeletingTrip(trip)}
                        className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4 text-red-700" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-700">
                Showing {(page - 1) * perPage + 1}–
                {Math.min(page * perPage, trips.length)} of {trips.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold ${
                      page === i + 1
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <TripModals
        deletingTrip={deletingTrip}
        setDeletingTrip={setDeletingTrip}
        confirmCreate={confirmCreate}
        setConfirmCreate={setConfirmCreate}
        confirmUpdate={confirmUpdate}
        setConfirmUpdate={setConfirmUpdate}
        editingTrip={editingTrip}
        setEditingTrip={setEditingTrip}
        viewingTrip={viewingTrip}
        setViewingTrip={setViewingTrip}
        form={form}
        isLoading={actionLoading}
        handleCreateTrip={handleCreateTrip}
        handleUpdateTrip={handleUpdateTrip}
        handleDeleteTrip={handleDeleteTrip}
        resetForm={resetForm}
        fetchTrips={fetchTrips}
        handleChange={handleChange}
        handleNestedChange={handleNestedChange}
        cities={cities}
        handleCitySelect={handleCitySelect}
      />
    </AdminLayout>
  );
}
