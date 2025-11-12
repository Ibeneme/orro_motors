import { useState } from "react";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import orros from "../../src/assets/vite.png";
import { baseURL } from "../services/baseurl";

export default function AdminLogin() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Resend OTP
const handleResendOtp = async () => {
    if (!email) {
      setMessage("Please enter your email first.");
      return;
    }
  
    setLoading(true);
    setMessage("");
  
    try {
      const { data } = await axios.post(`${baseURL}/admins/resend-otp`, { email });
  
      if (data.success) {
        setMessage(data.message || "OTP resent successfully!");
      } else {
        setMessage(data.message || "Failed to resend OTP.");
      }
    } catch (error: any) {
      console.error("Error resending OTP:", error);
      setMessage(error.response?.data?.message || "Server error.");
    } finally {
      setLoading(false);
    }
  };

  // Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { data } = await axios.post(`${baseURL}/admins/login`, { email });

      if (data.success) {
        setMessage(data.message || "OTP sent to your email!");
        setStep("otp");
      } else {
        setMessage(data.message || "Failed to send OTP.");
      }
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      setMessage(
        error.response?.data?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { data } = await axios.post(`${baseURL}/admins/verify-otp`, {
        email,
        otp,
      });

      console.log("Verify OTP response:", data); // log the full response

      if (data.success) {
        setMessage("Login Successful! 🚀");

        // Save token and admin info to localStorage
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminData", JSON.stringify(data.admin));

        console.log("Saved token and admin info to localStorage");

        navigate("/admin/main");
      } else {
        setMessage(data.message || "Invalid OTP or server error.");
      }
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      setMessage(
        error.response?.data?.message || "Invalid OTP or server error."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <img
              src={orros}
              alt="Orro Motors Logo"
              className="w-18 h-18"
              style={{ borderRadius: 64 }}
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Orro Motors Admin
          </h1>
          <p className="text-gray-600 mt-2">
            Secure login with email verification
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {message && (
            <p
              className={`text-sm mb-4 text-center ${
                step === "otp" ? "text-green-600" : "text-blue-600"
              }`}
            >
              {message}
            </p>
          )}

          {step === "email" ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Enter Email Address
              </h2>
              <p className="text-gray-500 text-sm mb-8">
                We'll send you a 6-digit code to your email.
              </p>

              <form onSubmit={handleSendOtp}>
                <div className="relative mb-6">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-lg"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-blue-600 text-white py-4 rounded-xl transition font-semibold flex items-center justify-center gap-3 shadow-lg ${
                    loading
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:bg-blue-700"
                  }`}
                >
                  {loading ? "Sending..." : "Send OTP"}
                  {!loading && <ArrowRight className="w-5 h-5" />}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Verify OTP</h2>
              </div>
              <p className="text-gray-500 text-sm mb-8">
                Enter the 6-digit code sent to{" "}
                <span className="font-semibold text-gray-900">{email}</span>
              </p>

              <form onSubmit={handleVerifyOtp}>
                <div className="relative mb-8">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="123456"
                    maxLength={6}
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-2xl tracking-widest font-mono"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    disabled={loading}
                    className="flex-1 border border-gray-300 text-gray-700 py-4 rounded-xl hover:bg-gray-50 transition font-medium"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 bg-blue-600 text-white py-4 rounded-xl transition font-semibold shadow-lg ${
                      loading
                        ? "opacity-70 cursor-not-allowed"
                        : "hover:bg-blue-700"
                    }`}
                  >
                    {loading ? "Verifying..." : "Verify & Login"}
                  </button>
                </div>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Didn’t receive code?{" "}
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleResendOtp}
                  className="text-blue-600 font-medium hover:underline disabled:opacity-50"
                >
                  Resend
                </button>
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-8">
          © {new Date().getFullYear()} Orro Motors. Admin access only.
        </p>
      </div>
    </div>
  );
}
