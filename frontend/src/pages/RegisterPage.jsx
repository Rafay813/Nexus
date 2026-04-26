import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../components/Auth/RegisterForm";
import useAuth from "../hooks/useAuth";

const RegisterPage = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-900 via-slate-900 to-slate-950 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-purple-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-2 mb-16">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold">N</span>
            </div>
            <span className="text-white font-bold text-xl">Nexus</span>
          </div>
          <h1 className="text-5xl font-bold text-white leading-tight mb-4">
            Join the<br />Nexus Network
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
            Whether you're looking to invest or raise capital, Nexus connects you with the right people to grow.
          </p>
        </div>

        <div className="relative space-y-4">
          {[
            { role: "Investor",     desc: "Discover vetted startups, schedule pitches, manage your portfolio" },
            { role: "Entrepreneur", desc: "Reach qualified investors, share your story, close funding rounds" },
          ].map(({ role, desc }) => (
            <div key={role} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <p className="text-white font-semibold mb-1">{role}</p>
              <p className="text-slate-400 text-sm">{desc}</p>
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
            <h2 className="text-2xl font-bold text-white mb-1">Create your account</h2>
            <p className="text-slate-400 text-sm">Join thousands of investors and entrepreneurs</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;