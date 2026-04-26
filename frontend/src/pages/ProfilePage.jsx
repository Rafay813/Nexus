// frontend/src/pages/ProfilePage.jsx
import { useState } from "react";
import Navbar      from "../components/Shared/Navbar";
import Sidebar     from "../components/Shared/Sidebar";
import ProfileCard from "../components/Profile/ProfileCard";
import ProfileForm from "../components/Profile/ProfileForm";
import { Shield, Edit3 } from "lucide-react";
import useAuth        from "../hooks/useAuth";
import { changePasswordAPI } from "../api/authAPI";
import axiosInstance  from "../api/axiosInstance";
import { useForm }    from "react-hook-form";
import toast          from "react-hot-toast";

// ── Change Password Section ───────────────────────────────────────────────────
const ChangePasswordSection = () => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      return toast.error("Passwords do not match.");
    }
    setLoading(true);
    try {
      await changePasswordAPI({
        currentPassword: data.currentPassword,
        newPassword:     data.newPassword,
      });
      toast.success("Password changed successfully!");
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 focus:border-indigo-500 text-white text-sm placeholder-slate-500 outline-none transition-colors";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Current Password
        </label>
        <input
          {...register("currentPassword", { required: true })}
          type="password"
          className={inputClass}
          placeholder="••••••••"
        />
        {errors.currentPassword && (
          <p className="text-red-400 text-xs mt-1">Current password is required.</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            New Password
          </label>
          <input
            {...register("newPassword", { required: true, minLength: 8 })}
            type="password"
            className={inputClass}
            placeholder="Min 8 characters"
          />
          {errors.newPassword && (
            <p className="text-red-400 text-xs mt-1">Min 8 characters required.</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Confirm New Password
          </label>
          <input
            {...register("confirmPassword", { required: true })}
            type="password"
            className={inputClass}
            placeholder="Repeat new password"
          />
          {errors.confirmPassword && (
            <p className="text-red-400 text-xs mt-1">Please confirm your password.</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
        >
          {loading
            ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><Shield size={15} /> Update Password</>}
        </button>
      </div>
    </form>
  );
};

// ── 2FA / OTP Section ─────────────────────────────────────────────────────────
const TwoFASection = ({ user }) => {
  const [sending,   setSending]   = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [toggling,  setToggling]  = useState(false);
  const [otp,       setOtp]       = useState("");
  const [otpSent,   setOtpSent]   = useState(false);
  const [enabled,   setEnabled]   = useState(user?.isTwoFAEnabled || false);

  const sendOTP = async () => {
    setSending(true);
    try {
      await axiosInstance.post("/auth/otp/send");
      toast.success("OTP sent to your email!");
      setOtpSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setSending(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) return toast.error("Enter the 6-digit OTP.");
    setVerifying(true);
    try {
      await axiosInstance.post("/auth/otp/verify", { otp });
      toast.success("Email verified successfully! ✅");
      setOtpSent(false);
      setOtp("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP.");
    } finally {
      setVerifying(false);
    }
  };

  const toggle2FA = async () => {
    setToggling(true);
    try {
      const res = await axiosInstance.patch("/auth/2fa/toggle");
      setEnabled(res.data.data.isTwoFAEnabled);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to toggle 2FA.");
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* 2FA Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-300 text-sm font-medium">Two-Factor Authentication</p>
          <p className="text-slate-500 text-xs mt-0.5">
            {enabled ? "2FA is currently enabled on your account." : "Enable 2FA for extra security."}
          </p>
        </div>
        <button
          onClick={toggle2FA}
          disabled={toggling}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
            enabled
              ? "bg-green-600 hover:bg-green-500 text-white"
              : "bg-slate-700 hover:bg-slate-600 text-slate-300"
          }`}
        >
          {toggling ? (
            <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
          ) : enabled ? "✅ Enabled" : "❌ Disabled"}
        </button>
      </div>

      <div className="border-t border-slate-700/50 pt-4">
        <p className="text-slate-300 text-sm font-medium mb-1">Email Verification</p>
        <p className="text-slate-500 text-xs mb-4">
          Verify your email address with a one-time password sent to your inbox.
        </p>

        {!otpSent ? (
          <button
            onClick={sendOTP}
            disabled={sending}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm transition-colors"
          >
            {sending ? (
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : "📧"}
            {sending ? "Sending..." : "Send OTP to Email"}
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-slate-400 text-xs">
              Check your email and enter the 6-digit code below.
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 w-36 tracking-[0.4em] font-mono text-center"
              />
              <button
                onClick={verifyOTP}
                disabled={verifying || otp.length !== 6}
                className="px-4 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg text-sm transition-colors"
              >
                {verifying ? "Verifying..." : "✓ Verify"}
              </button>
              <button
                onClick={() => { setOtpSent(false); setOtp(""); }}
                className="px-4 py-2.5 border border-slate-600 text-slate-400 hover:text-white rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
            <button
              onClick={sendOTP}
              disabled={sending}
              className="text-indigo-400 hover:text-indigo-300 text-xs transition-colors"
            >
              Resend OTP
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Profile Page ──────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <Navbar title="My Profile" />

        <main className="flex-1 p-4 md:p-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* Left — Profile Card */}
            <div className="xl:col-span-1">
              <ProfileCard user={user} />
            </div>

            {/* Right — Edit Sections */}
            <div className="xl:col-span-2 space-y-6">

              {/* Edit Profile */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Edit3 size={18} className="text-indigo-400" />
                  <h2 className="text-white font-semibold">Edit Profile</h2>
                </div>
                <ProfileForm />
              </div>

              {/* Change Password */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Shield size={18} className="text-indigo-400" />
                  <h2 className="text-white font-semibold">Change Password</h2>
                </div>
                <ChangePasswordSection />
              </div>

              {/* 2FA & Email Verification */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-indigo-400 text-lg">🔐</span>
                  <h2 className="text-white font-semibold">Security & 2FA</h2>
                </div>
                <TwoFASection user={user} />
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;