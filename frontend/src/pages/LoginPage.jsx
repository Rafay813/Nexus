import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/Auth/LoginForm";
import useAuth from "../hooks/useAuth";

const LoginPage = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-2 mb-16">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold">N</span>
            </div>
            <span className="text-white font-bold text-xl">Nexus</span>
          </div>
          <h1 className="text-5xl font-bold text-white leading-tight mb-4">
            Where Capital<br />Meets Innovation
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
            Connect investors with entrepreneurs. Build relationships, schedule meetings, and close deals — all in one platform.
          </p>
        </div>

        <div className="relative grid grid-cols-3 gap-4">
          {[
            { num: "500+", label: "Investors" },
            { num: "1,200+", label: "Startups" },
            { num: "$50M+", label: "Funded" },
          ].map(({ num, label }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <p className="text-white text-xl font-bold">{num}</p>
              <p className="text-slate-400 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-white font-bold text-lg">Nexus</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">Sign in to Nexus</h2>
            <p className="text-slate-400 text-sm">Enter your credentials to continue</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;