// src/pages/CityManager.tsx
import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  CheckCircle,
  Loader2,
  AlertCircle,
  Building2,
} from "lucide-react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import Modal from "./Modal";
import { showSuccess, showError } from "../components/Toast/Toast";
import { baseURL } from "../services/baseurl";

interface City {
  _id?: string;
  name: string;
  state?: string;
  country?: string;
  terminal: string;
}

export default function CityManager() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentCity, setCurrentCity] = useState<City | null>(null);
  const [cityToDelete, setCityToDelete] = useState<City | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const adminToken = localStorage.getItem("adminToken");
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "application/json",
    },
  };

  /* ------------------- FETCH CITIES ------------------- */
  const fetchCities = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${baseURL}/cities`, axiosConfig);
      console.log(data, "data");
      if (data.success) setCities(data.data || []);
    } catch {
      showError("Failed to load cities", "Please refresh");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  /* ------------------- MODAL CONTROLS ------------------- */
  const openModal = (city?: City) => {
    setCurrentCity(
      city || { name: "", state: "", country: "Nigeria", terminal: "" }
    );
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setCurrentCity(null);
  };

  const openDeleteModal = (city: City) => {
    setCityToDelete(city);
    setShowDeleteModal(true);
  };
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setCityToDelete(null);
  };

  /* ------------------- SAVE CITY + TERMINAL ------------------- */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCity?.name.trim()) return showError("City name is required");
    if (!currentCity?.terminal.trim())
      return showError("Terminal name is required");


    setIsSubmitting(true);
    try {
      if (currentCity._id) {
        await axios.put(
          `${baseURL}/cities/${currentCity._id}`,
          currentCity,
          axiosConfig
        );
        showSuccess("Updated", `${currentCity.name} (${currentCity.terminal})`);
      } else {
        await axios.post(
          `${baseURL}/cities/add`,
          { cities: [currentCity] },
          axiosConfig
        );
        showSuccess("Created", `${currentCity.name} (${currentCity.terminal})`);
      }
      closeModal();
      await fetchCities();
    } catch (err: any) {
      showError("Save Failed", err.response?.data?.message || "Try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ------------------- DELETE CITY + TERMINAL ------------------- */
  const confirmDelete = async () => {
    if (!cityToDelete?._id) return;
    setIsDeleting(true);
    try {
      await axios.delete(`${baseURL}/cities/${cityToDelete._id}`, axiosConfig);
      showSuccess("Deleted", `${cityToDelete.name} removed`);
      closeDeleteModal();
      await fetchCities();
    } catch (err: any) {
      showError("Delete Failed", err.response?.data?.message || "Try again");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout
      title="City & Terminal Management"
      subtitle="Each city has one terminal"
    >
      {/* ---------- HEADER ---------- */}
      <div className="bg-white rounded-2xl border border-gray-300 p-6 md:p-8 mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Cities & Terminals
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              One terminal per city
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium text-sm md:text-base"
          >
            <Plus className="w-5 h-5" />
            Add City
          </button>
        </div>
      </div>

      {/* ---------- MAIN CONTENT ---------- */}
      <div className="bg-white rounded-2xl border border-gray-300 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">
            All Locations ({cities.length})
          </h2>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Loading...
            </div>
          ) : cities.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No cities yet. Add one above!
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {cities.map((city) => (
                <div
                  key={city._id}
                  className="p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">{city.name}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Building2 className="w-4 h-4 text-purple-600" />
                        {city.terminal}
                      </p>
                      <p className="text-xs text-gray-500">
                        {city.state || "—"} • {city.country || "Nigeria"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 sm:mt-0">
                    <button
                      onClick={() => openModal(city)}
                      className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-blue-700" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(city)}
                      className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-700" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-100 border-b-2 border-gray-300">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  City
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Terminal
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  State
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading...
                  </td>
                </tr>
              ) : cities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    No cities yet. Add one above!
                  </td>
                </tr>
              ) : (
                cities.map((city) => (
                  <tr key={city._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-gray-900">
                          {city.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-purple-600" />
                        <span className="text-gray-900">{city.terminal}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-600">
                      {city.state || "—"}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-600">
                      {city.country || "Nigeria"}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => openModal(city)}
                          className="p-3 bg-blue-100 hover:bg-blue-200 rounded-lg transition"
                          title="Edit city"
                        >
                          <Edit className="w-5 h-5 text-blue-700" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(city)}
                          className="p-3 bg-red-100 hover:bg-red-200 rounded-lg transition"
                          title="Delete city"
                        >
                          <Trash2 className="w-5 h-5 text-red-700" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------- ADD / EDIT MODAL ---------- */}
      {showModal && currentCity && (
        <Modal
          title={currentCity._id ? "Edit City & Terminal" : "Add New City"}
          onClose={closeModal}
          icon={<MapPin className="w-7 h-7 text-blue-600" />}
          width="max-w-2xl"
        >
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  City Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={currentCity.name}
                  onChange={(e) =>
                    setCurrentCity({ ...currentCity, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-300 outline-none transition text-base"
                  placeholder="Lagos"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Terminal Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={currentCity.terminal}
                  onChange={(e) =>
                    setCurrentCity({ ...currentCity, terminal: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-300 outline-none transition text-base"
                  placeholder="Jibowu Terminal"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={currentCity.state || ""}
                  onChange={(e) =>
                    setCurrentCity({ ...currentCity, state: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-300 outline-none transition text-base"
                  placeholder="Lagos State"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={currentCity.country || "Nigeria"}
                  onChange={(e) =>
                    setCurrentCity({ ...currentCity, country: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-300 outline-none transition text-base"
                  placeholder="Nigeria"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={closeModal}
                className="px-6 py-3 border-2 border-gray-400 text-gray-700 rounded-xl hover:bg-gray-100 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium flex items-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                {isSubmitting
                  ? "Saving..."
                  : currentCity._id
                  ? "Update"
                  : "Add City"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ---------- DELETE CONFIRMATION ---------- */}
      {showDeleteModal && cityToDelete && (
        <Modal
          title="Delete City"
          onClose={closeDeleteModal}
          icon={<AlertCircle className="w-7 h-7 text-red-600" />}
          width="max-w-md"
        >
          <div className="text-center space-y-4">
            <div className="mx-auto w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Delete "{cityToDelete.name}"?
            </h3>
            <p className="text-sm text-gray-600">
              Terminal <strong>"{cityToDelete.terminal}"</strong> will also be
              removed.
            </p>
            <p className="text-xs text-gray-500">
              This action <strong>cannot be undone</strong>.
            </p>
          </div>
          <div className="flex justify-center gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={closeDeleteModal}
              disabled={isDeleting}
              className="px-6 py-3 border-2 border-gray-400 text-gray-700 rounded-xl hover:bg-gray-100 transition font-medium"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium flex items-center gap-2 disabled:opacity-70"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  Delete
                </>
              )}
            </button>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
