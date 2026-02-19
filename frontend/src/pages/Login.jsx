import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [isLogin, setIsLogin] = useState(false); // Start with signup by default
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { login, signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isLogin) {
        // Handle Login
        const result = await login(formData.email, formData.password);
        if (!result.success) {
          setError(result.error);
        }
      } else {
        // Handle Signup
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords don't match");
          return;
        }

        if (formData.password.length < 6) {
          setError("Password must be at least 6 characters long");
          return;
        }

        const result = await signup(
          formData.name,
          formData.email,
          formData.password
        );
        if (result.success) {
          setSuccess("Account created successfully! Please sign in.");
          setIsLogin(true);
          setFormData({ ...formData, password: "", confirmPassword: "" });
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            MyCareCircle
          </h1>
          <p className="text-zinc-500">Family Health & Medicine Tracker</p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-zinc-200 rounded-xl p-8 shadow-sm">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-zinc-900">
              {isLogin ? "Welcome Back" : "Create Your Account"}
            </h2>
            <p className="text-zinc-500 mt-1">
              {isLogin
                ? "Sign in to your account"
                : "Start managing your family's health today"}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                  placeholder="Enter your full name"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                placeholder={
                  isLogin
                    ? "Enter your password"
                    : "Create a password (min 6 characters)"
                }
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                  placeholder="Confirm your password"
                  required={!isLogin}
                />
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-slate-800 border-zinc-300 rounded"
                  />
                  <span className="ml-2 text-zinc-700">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-slate-800 hover:text-slate-600"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-800 text-white py-3 rounded-lg font-medium hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Please wait..."
                : isLogin
                ? "Sign In"
                : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-zinc-500">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setSuccess("");
                  setFormData({
                    email: "",
                    password: "",
                    name: "",
                    confirmPassword: "",
                  });
                }}
                className="ml-1 text-slate-800 font-medium hover:text-slate-600"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 text-center">
          <p className="text-zinc-500 text-sm mb-4">
            Trusted by families worldwide
          </p>
          <div className="flex justify-center gap-6 text-xs text-zinc-400">
            <span>🔒 Secure & Private</span>
            <span>📱 Mobile Friendly</span>
            <span>⏰ Smart Reminders</span>
          </div>
        </div>
      </div>
    </div>
  );
}
