import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Briefcase, TrendingUp } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";

const schema = yup.object({
  name: yup
    .string()
    .min(2, "Name must be at least 2 characters")
    .required("Name is required"),
  email:    yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(8, "At least 8 characters")
    .matches(/[A-Z]/, "Must include uppercase letter")
    .matches(/[0-9]/, "Must include a number")
    .matches(/[!@#$%^&*]/, "Must include special character (!@#$%^&*)")
    .required("Password is required"),
  role: yup.string().oneOf(["investor", "entrepreneur"]).required("Select a role"),
});

const RegisterForm = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { role: "" },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerUser(data);
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed. Try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError) =>
    `w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-800 border text-white text-sm placeholder-slate-500 outline-none transition-colors
    ${hasError ? "border-red-500" : "border-slate-700 focus:border-indigo-500"}`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Role selector */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">I am a...</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "investor",     icon: TrendingUp, label: "Investor",     desc: "Fund startups" },
            { value: "entrepreneur", icon: Briefcase,  label: "Entrepreneur", desc: "Raise capital" },
          ].map(({ value, icon: Icon, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue("role", value, { shouldValidate: true })}
              className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all
                ${selectedRole === value
                  ? "border-indigo-500 bg-indigo-900/30 text-white"
                  : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"}`}
            >
              <Icon size={22} />
              <span className="text-sm font-semibold">{label}</span>
              <span className="text-xs opacity-70">{desc}</span>
            </button>
          ))}
        </div>
        {errors.role && <p className="text-red-400 text-xs mt-1">{errors.role.message}</p>}
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
        <div className="relative">
          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input {...register("name")} placeholder="John Doe" className={inputClass(errors.name)} />
        </div>
        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
        <div className="relative">
          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input {...register("email")} type="email" placeholder="you@example.com" className={inputClass(errors.email)} />
        </div>
        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            {...register("password")}
            type={showPass ? "text" : "password"}
            placeholder="Min 8 chars, uppercase, number, symbol"
            className={`w-full pl-9 pr-10 py-2.5 rounded-lg bg-slate-800 border text-white text-sm placeholder-slate-500 outline-none transition-colors
              ${errors.password ? "border-red-500" : "border-slate-700 focus:border-indigo-500"}`}
          />
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
      >
        {loading ? (
          <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>Create Account <ArrowRight size={16} /></>
        )}
      </button>

      <p className="text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
          Sign in
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;