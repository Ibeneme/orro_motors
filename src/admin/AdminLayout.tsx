import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  BarChart3,
  Calendar,
  ListTodo,
  Settings,
  Menu,
  X,
  Square,
} from "lucide-react";
import { format } from "date-fns";
import orros from "../../src/assets/vite.png";

const navItems = [
  { href: "/admin/main", label: "Dashboard Overview", icon: BarChart3 },
  { href: "/admin/trips", label: "Trips Management", icon: Calendar },
  { href: "/admin/bookings", label: "Bookings Management", icon: ListTodo },
  { href: "/admin/cities", label: "Cities Management", icon: Square },
  { href: "/admin/settings", label: "Settings / Tools", icon: Settings },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AdminLayout({
  children,
  title = "Admin Dashboard",
  subtitle = "Welcome to the internal management system. View and manage all trips and bookings.",
}: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const today = format(new Date(), "EEEE, MMMM d, yyyy");

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside
        className={`fixed md:sticky top-0 h-screen z-40 inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out`}
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-1">
            <img src={orros} alt="Orro Motors Logo" className="w-12 h-12" />
            <span className="text-xl font-semibold text-gray-900">
              Orro Motors
            </span>
          </div>

          <button
            className="md:hidden p-2 text-gray-700 hover:text-gray-900"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Overlay (for mobile view) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 md:hidden z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
          <div className="px-4 sm:px-6 py-3 flex justify-between items-center">
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-700 hover:text-gray-900"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Page Title */}
            <h1 className="text-lg sm:text-2xl font-semibold text-gray-900 truncate">
              {title}
            </h1>

            {/* Date/Time — hidden on mobile */}
            <div className="hidden sm:block text-sm text-gray-600">{today}</div>
          </div>
        </header>

        {/* Scrollable Main Section */}
        <main className="flex-1 h-screen overflow-y-auto p-6 md:p-8">
          {subtitle && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900">
                Orro Motors — {title}
              </h2>
              <p className="text-gray-600 mt-1">{subtitle}</p>
            </div>
          )}
          <div className="min-h-full">{children}</div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200">
          <div className="px-8 py-4 text-sm text-gray-600">
            © {new Date().getFullYear()} Orro Motors
          </div>
        </footer>
      </div>
    </div>
  );
}
