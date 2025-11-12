import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import OrroNavbar from "./components/Navbar/Navbar";
import OrroFooter from "./components/Footer/OrroFooter";
import Home from "./pages/Home/Home";
import NotFound from "./pages/NotFound/NotFound";
import MyTripsScreen from "./pages/MyTrips/MyTrips";
import HelpScreen from "./pages/Help/Help";
import PrivacyPolicyScreen from "./pages/PrivacyPolicyScreen/PrivacyPolicyScreen";
import TermsAndConditionsScreen from "./pages/TermsAndConditions/TermsAndConditionsScreen";
import ScrollToTop from "./ScrollToTop";
import TripResults from "./pages/search/TripResults";
import SeatSelection from "./pages/search/SeatSelection";
import BookingConfirmation from "./pages/search/BookingConfirmation";
import { ToastProvider } from "./components/Toast/Toast";
import PaymentSuccess from "./pages/PaymentSuccess/PaymentSuccess";
import AdminDashboardPage from "./admin/OrroMotorsAdminDashboard";
import ManageTrips from "./admin/ManageTrips";
import BookingsManagement from "./admin/BookingsManagement";
import SettingsTools from "./admin/SettingsTools";
import AdminLogin from "./admin/AdminLogin";
import CityManager from "./admin/CityManager";


function AppContent() {
  const location = useLocation();

  const hideLayout = location.pathname.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-screen">
      {!hideLayout && <OrroNavbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/my-trips" element={<MyTripsScreen />} />
          <Route path="/help" element={<HelpScreen />} />
          <Route path="/search" element={<TripResults />} />
          <Route path="/book/:tripId" element={<SeatSelection />} />
          <Route path="/confirm" element={<BookingConfirmation />} />
          <Route path="/terms" element={<TermsAndConditionsScreen />} />
          <Route path="/privacy" element={<PrivacyPolicyScreen />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/main" element={<AdminDashboardPage />} />
          <Route path="/admin/trips" element={<ManageTrips />} />
          <Route path="/admin/bookings" element={<BookingsManagement />} />
          <Route path="/admin/settings" element={<SettingsTools />} />
          <Route path="/admin/cities" element={<CityManager />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!hideLayout && <OrroFooter />}
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <Router>
        <ScrollToTop />
        <AppContent />
      </Router>
    </ToastProvider>
  );
}

export default App;
