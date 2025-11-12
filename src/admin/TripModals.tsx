// src/pages/TripModals.tsx
import {
  Loader2,
  AlertTriangle,
  Plus,
  Pencil,
  CheckCircle,
  Trash2,
  Eye,
  MapPin,
  Clock,
  Calendar,
  Users,
  DollarSign,
} from "lucide-react";
import Modal from "./Modal";
import { format } from "date-fns";
import type { Seat, Trip } from "./ManageTrips";

interface City {
  _id: string;
  name: string;
  state: string;
  terminal: string;
}

interface TripModalsProps {
  deletingTrip: Trip | null;
  setDeletingTrip: (trip: Trip | null) => void;
  confirmCreate: boolean;
  setConfirmCreate: (v: boolean) => void;
  confirmUpdate: boolean;
  setConfirmUpdate: (v: boolean) => void;
  editingTrip: Trip | null;
  setEditingTrip: (trip: Trip | null) => void;
  viewingTrip: Trip | null;
  setViewingTrip: (trip: Trip | null) => void;
  form: Partial<Trip>;
  isLoading: boolean;
  handleCreateTrip: () => Promise<void>;
  handleUpdateTrip: () => Promise<void>;
  handleDeleteTrip: () => Promise<void>;
  resetForm: () => void;
  fetchTrips: () => Promise<void>;
  handleChange: (key: keyof Trip, value: any) => void;
  handleNestedChange: (
    parent: "pickup" | "dropoff" | "takeoff",
    key: "city" | "location" | "date" | "time",
    value: string
  ) => void;
  cities: City[];
  handleCitySelect: (parent: "pickup" | "dropoff", label: string) => void;
}

export default function TripModals({
  deletingTrip,
  setDeletingTrip,
  confirmCreate,
  setConfirmCreate,
  confirmUpdate,
  setConfirmUpdate,
  editingTrip,
  setEditingTrip,
  viewingTrip,
  setViewingTrip,
  form,
  isLoading,
  handleCreateTrip,
  handleUpdateTrip,
  handleDeleteTrip,
  resetForm,
  handleChange,
  handleNestedChange,
  cities,
  handleCitySelect,
}: TripModalsProps) {
  const cityLabel = (c: City) => `${c.name} - ${c.terminal}`;

  return (
    <>
      {/* DELETE CONFIRMATION */}
      {deletingTrip && (
        <Modal
          title="Delete Trip Permanently?"
          onClose={() => setDeletingTrip(null)}
          icon={<AlertTriangle className="w-7 h-7 text-red-600" />}
          zIndex={99}
        >
          <div className="text-center py-12 px-8">
            <div className="mx-auto w-28 h-28 mb-8">
              <div className="bg-red-100 rounded-full w-full h-full flex items-center justify-center border-4 border-red-200">
                <AlertTriangle className="w-16 h-16 text-red-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Irreversible Action
            </h3>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              Delete{" "}
              <span className="font-bold text-red-600">
                "{deletingTrip.tripName}"
              </span>
              ?<br />
              <span className="font-bold text-red-600">
                All bookings will be lost forever
              </span>
              .
            </p>
            <div className="flex justify-center gap-6">
              <button
                onClick={() => setDeletingTrip(null)}
                className="px-10 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition font-semibold text-lg"
              >
                Keep Trip
              </button>
              <button
                onClick={handleDeleteTrip}
                disabled={isLoading}
                className="px-10 py-4 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition font-semibold flex items-center gap-3 text-lg"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Trash2 className="w-6 h-6" />
                )}
                {isLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CREATE CONFIRMATION */}
      {confirmCreate && (
        <Modal
          title="Launch New Trip?"
          onClose={() => setConfirmCreate(false)}
          icon={<Plus className="w-7 h-7 text-blue-600" />}
          zIndex={100}
        >
          <div className="text-center py-12 px-8">
            <div className="mx-auto w-28 h-28 mb-8">
              <div className="bg-blue-100 rounded-full w-full h-full flex items-center justify-center border-4 border-blue-200">
                <CheckCircle className="w-16 h-16 text-blue-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Go Live?</h3>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              Create trip:
              <br />
              <span className="font-bold text-blue-600">"{form.tripName}"</span>
              <br />
              <span className="font-medium">
                {form.pickup?.city} - {form.pickup?.location} to{" "}
                {form.dropoff?.city} - {form.dropoff?.location}
              </span>
              <br />
              <span className="font-medium">
                {form.takeoff?.date} at {form.takeoff?.time}
              </span>
            </p>
            <div className="flex justify-center gap-6">
              <button
                onClick={() => setConfirmCreate(false)}
                className="px-10 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition font-semibold text-lg"
              >
                Back
              </button>
              <button
                onClick={handleCreateTrip}
                disabled={isLoading}
                className="px-10 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition font-semibold flex items-center gap-3 text-lg"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Plus className="w-6 h-6" />
                )}
                {isLoading ? "Creating..." : "Launch Trip"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* UPDATE CONFIRMATION */}
      {confirmUpdate && (
        <Modal
          title="Save Changes?"
          onClose={() => setConfirmUpdate(false)}
          icon={<Pencil className="w-7 h-7 text-green-600" />}
          zIndex={120}
        >
          <div className="text-center py-12 px-8">
            <div className="mx-auto w-28 h-28 mb-8">
              <div className="bg-green-100 rounded-full w-full h-full flex items-center justify-center border-4 border-green-200">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Update Trip?
            </h3>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              Save changes to:
              <br />
              <span className="font-bold text-green-600">
                "{form.tripName}"
              </span>
              <br />
              Takeoff:{" "}
              <span className="font-bold text-blue-600">
                {form.takeoff?.date}
              </span>{" "}
              at{" "}
              <span className="font-bold text-blue-600">
                {form.takeoff?.time}
              </span>
            </p>
            <div className="flex justify-center gap-6">
              <button
                onClick={() => setConfirmUpdate(false)}
                className="px-10 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition font-semibold text-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTrip}
                disabled={isLoading}
                className="px-10 py-4 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition font-semibold flex items-center gap-3 text-lg"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <CheckCircle className="w-6 h-6" />
                )}
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* EDIT MODAL */}
      {editingTrip && (
        <Modal
          title="Edit Trip Details"
          onClose={() => {
            setEditingTrip(null);
            resetForm();
          }}
          icon={<Pencil className="w-7 h-7 text-blue-600" />}
          width="max-w-5xl"
          zIndex={99}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-8 bg-gray-50 rounded-2xl">
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
                placeholder="Lagos to Abuja Express"
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
            {/* <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Total Seats
              </label>
              <input
                type="number"
                value={form.seatCount || ""}
                onChange={(e) => handleChange("seatCount", +e.target.value)}
                className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-300 outline-none transition text-lg"
                placeholder="42"
              />
            </div> */}

            {/* Price with ₦ */}
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
                  onChange={(e) => handleChange("price", +e.target.value)}
                  className="w-full pl-12 pr-5 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-300 outline-none transition text-lg"
                  placeholder="12,500"
                />
              </div>
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

            {/* Arrival Time */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Arrival Time
              </label>
              <input
                type="text"
                value={form.arrivalTime || ""}
                onChange={(e) => handleChange("arrivalTime", e.target.value)}
                className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-300 outline-none transition text-lg"
                placeholder="05:00 AM"
              />
            </div>

            <div className="col-span-full flex justify-end gap-6 mt-8">
              <button
                onClick={() => {
                  setEditingTrip(null);
                  resetForm();
                }}
                className="px-10 py-5 border-2 border-gray-400 text-gray-700 rounded-2xl hover:bg-gray-100 transition font-bold text-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => setConfirmUpdate(true)}
                className="px-10 py-5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition font-bold text-lg flex items-center gap-3"
              >
                <CheckCircle className="w-6 h-6" />
                Save Changes
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* VIEW MODAL */}
      {viewingTrip && (
        <Modal
          title="Trip Details & Seat Map"
          onClose={() => setViewingTrip(null)}
          icon={<Eye className="w-7 h-7 text-purple-600" />}
          width="max-w-6xl"
          zIndex={85}
        >
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h4 className="text-2xl font-bold text-gray-900">
                  Trip Overview
                </h4>
                <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 space-y-5">
                  <p className="flex items-center gap-3 text-lg">
                    <strong className="w-32">Name:</strong>
                    {viewingTrip.tripName}
                  </p>
                  <p className="flex items-center gap-3 text-lg">
                    <MapPin className="w-6 h-6 text-blue-600" />
                    <strong className="w-32">Route:</strong>
                    {(() => {
                      const p = cities.find(
                        (c) => c.name === viewingTrip.pickup?.city
                      );
                      const d = cities.find(
                        (c) => c.name === viewingTrip.dropoff?.city
                      );
                      return `${
                        p
                          ? `${p.name} - ${p.terminal}`
                          : viewingTrip.pickup?.city
                      } to ${
                        d
                          ? `${d.name} - ${d.terminal}`
                          : viewingTrip.dropoff?.city
                      }`;
                    })()}
                  </p>
                  <p className="flex items-center gap-3 text-lg">
                    <Calendar className="w-6 h-6 text-green-600" />
                    <strong className="w-32">Date:</strong>
                    {format(
                      new Date(viewingTrip.takeoff?.date || ""),
                      "EEEE, MMM d, yyyy"
                    )}
                  </p>
                  <p className="flex items-center gap-3 text-lg">
                    <Clock className="w-6 h-6 text-purple-600" />
                    <strong className="w-32">Time:</strong>
                    {viewingTrip.takeoff?.time}
                  </p>
                  <p className="flex items-center gap-3 text-lg">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                    <strong className="w-32">Price:</strong>₦
                    {(viewingTrip.price || 0).toLocaleString()}
                  </p>
                  <p className="flex items-center gap-3 text-lg">
                    <Users className="w-6 h-6 text-indigo-600" />
                    <strong className="w-32">Seats:</strong>
                    {viewingTrip.seatCount} total
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-2xl font-bold text-gray-900 mb-6">
                  Live Seat Map
                </h4>
                <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200">
                  <div className="grid grid-cols-6 gap-3 mb-8">
                    {viewingTrip.seats?.map((seat: Seat) => (
                      <div
                        key={seat._id}
                        className={`aspect-square rounded-xl flex items-center justify-center text-sm font-bold border-2 ${
                          seat.isBooked
                            ? seat.isPaid
                              ? "bg-green-500 text-white border-green-600"
                              : "bg-yellow-500 text-white border-yellow-600"
                            : "bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                        }`}
                      >
                        {seat.position}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap justify-center gap-6 text-sm font-bold">
                    <span className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 rounded"></div> Paid
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-yellow-500 rounded"></div>{" "}
                      Pending
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded"></div>{" "}
                      Available
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
