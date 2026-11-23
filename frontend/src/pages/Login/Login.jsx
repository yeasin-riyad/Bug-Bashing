// src/pages/Login/Login.jsx
// FIXED: BUG-004 — removed hardcoded JWT & dev bypass
// FIXED: BUG-008 — uses unified saveToken (utils/auth.js)
// FIXED: BUG-014 — no window.location.reload()
// FIXED: BUG-015 — dispatch(setUser) after login
// FIXED: BUG-017 — client-side validation
// FIXED: BUG-019 — clear error on quick login
// NOTE: Demo login now visible in production too (per request).

import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginUser } from "../../services/auth.api";
import { saveToken } from "../../utils/auth";
import { setUser } from "../../store/slices/authSlice";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Sparkles,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // FIXED (BUG-019): clear previous error when quick-filling
  const handleQuickLogin = (email, password) => {
    setForm({ email, password });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // FIXED (BUG-017): client-side validation
    if (!form.email.trim() || !form.password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await loginUser(form);

      // FIXED (BUG-008): saveToken uses unified TOKEN_KEY internally
      saveToken(res.data.token);

      // FIXED (BUG-015): populate Redux auth user
      if (res.data.user) {
        dispatch(setUser(res.data.user));
      }

      // FIXED (BUG-014): no window.location.reload()
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="card bg-base-100/90 backdrop-blur border border-base-300 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="card-body p-6 sm:p-10 relative z-10">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Welcome Back
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              <span className="gradient-text">Sign In to CourseMaster</span>
            </h1>
            <p className="text-sm text-base-content/70 mt-2">
              Enter your credentials to access your courses & dashboard
            </p>
          </div>

          {/* Quick Demo Credentials — now visible in all environments */}
          <div className="mb-6 p-4 rounded-2xl bg-base-200/80 border border-base-300 space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold text-base-content/80 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> Quick Demo
                Credentials:
              </p>
              <span className="badge badge-xs badge-outline text-[10px]">
                Demo
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  handleQuickLogin(
                    import.meta.env.VITE_DEMO_ADMIN_EMAIL ||
                      "admin@coursemaster.com",
                    import.meta.env.VITE_DEMO_ADMIN_PASS || "admin123"
                  )
                }
                className="btn btn-xs btn-outline btn-primary gap-1 font-semibold"
              >
                <ShieldCheck className="w-3 h-3" /> Admin Fill
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickLogin(
                    import.meta.env.VITE_DEMO_STUDENT_EMAIL ||
                      "student@coursemaster.com",
                    import.meta.env.VITE_DEMO_STUDENT_PASS || "student123"
                  )
                }
                className="btn btn-xs btn-outline btn-secondary gap-1 font-semibold"
              >
                <UserCheck className="w-3 h-3" /> Student Fill
              </button>
            </div>

            {/* One-click auto-login buttons (call API directly) */}
            <div className="pt-2 border-t border-base-300/80">
              <p className="text-[11px] font-semibold text-base-content/70 mb-1.5">
                ⚡ One-click Demo Login:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={async () => {
                    handleQuickLogin(
                      import.meta.env.VITE_DEMO_ADMIN_EMAIL ||
                        "admin@coursemaster.com",
                      import.meta.env.VITE_DEMO_ADMIN_PASS || "admin123"
                    );
                    // Submit with admin credentials
                    const email =
                      import.meta.env.VITE_DEMO_ADMIN_EMAIL ||
                      "admin@coursemaster.com";
                    const password =
                      import.meta.env.VITE_DEMO_ADMIN_PASS || "admin123";
                    try {
                      setLoading(true);
                      setError(null);
                      const res = await loginUser({ email, password });
                      saveToken(res.data.token);
                      if (res.data.user) dispatch(setUser(res.data.user));
                      navigate("/admin");
                    } catch (err) {
                      setError(
                        err.response?.data?.message ||
                          "Admin demo login failed."
                      );
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="btn btn-xs btn-primary gap-1 font-bold"
                >
                  <ShieldCheck className="w-3 h-3" /> Login as Admin
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={async () => {
                    handleQuickLogin(
                      import.meta.env.VITE_DEMO_STUDENT_EMAIL ||
                        "student@coursemaster.com",
                      import.meta.env.VITE_DEMO_STUDENT_PASS || "student123"
                    );
                    const email =
                      import.meta.env.VITE_DEMO_STUDENT_EMAIL ||
                      "student@coursemaster.com";
                    const password =
                      import.meta.env.VITE_DEMO_STUDENT_PASS || "student123";
                    try {
                      setLoading(true);
                      setError(null);
                      const res = await loginUser({ email, password });
                      saveToken(res.data.token);
                      if (res.data.user) dispatch(setUser(res.data.user));
                      navigate("/student");
                    } catch (err) {
                      setError(
                        err.response?.data?.message ||
                          "Student demo login failed."
                      );
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="btn btn-xs btn-secondary gap-1 font-bold"
                >
                  <UserCheck className="w-3 h-3" /> Login as Student
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="alert alert-error shadow-md text-sm p-3 mb-4 rounded-xl flex items-center gap-2">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-primary" /> Email Address
                </span>
              </label>
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input input-bordered w-full focus:input-primary pl-4 pr-4"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-primary" /> Password
                </span>
              </label>
              <div className="relative flex items-center">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input input-bordered w-full focus:input-primary pl-4 pr-10"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-base-content/50 hover:text-base-content"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="btn btn-primary w-full btn-lg shadow-lg hover:shadow-xl mt-6 gap-2 font-bold"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-md"></span>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" /> Sign In
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-6 pt-4 border-t border-base-300">
            <p className="text-sm text-base-content/70">
              Don't have an account?{" "}
              <Link
                className="link link-primary font-bold ml-1"
                to="/register"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}