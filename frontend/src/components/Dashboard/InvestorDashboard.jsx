import { DollarSign, Users, Calendar, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import StatsCard from "./StatsCard";
import useAuth from "../../hooks/useAuth";

const InvestorDashboard = () => {
  const { user } = useAuth();
  const profile  = user?.investorProfile || {};

  const stats = [
    { icon: DollarSign, label: "Portfolio Size",      value: `$${(profile.portfolioSize || 0).toLocaleString()}`, color: "emerald", change: "Active investments" },
    { icon: Users,      label: "Connections",          value: "—",  color: "indigo",  change: "Entrepreneurs" },
    { icon: Calendar,   label: "Meetings Scheduled",   value: "—",  color: "amber"   },
    { icon: TrendingUp, label: "Investment Range",
      value: profile.minInvestment
        ? `$${profile.minInvestment.toLocaleString()} – $${profile.maxInvestment.toLocaleString()}`
        : "Not set",
      color: "rose" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="rounded-xl bg-gradient-to-r from-indigo-900/50 to-slate-800/50 border border-indigo-800/40 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-white text-xl font-bold">
              Welcome back, {user?.name?.split(" ")[0]}! 👋
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {profile.firmName ? `${profile.firmName} · ` : ""}Investor Dashboard
            </p>
            {profile.industriesOfInterest?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {profile.industriesOfInterest.slice(0, 4).map((ind) => (
                  <span key={ind} className="text-xs bg-indigo-900/60 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-800/50">
                    {ind}
                  </span>
                ))}
              </div>
            )}
          </div>
          <Link to="/profile"
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Edit Profile <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => <StatsCard key={s.label} {...s} />)}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <h3 className="text-white font-semibold mb-3">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: "Browse Entrepreneurs", to: "/profile", color: "indigo" },
              { label: "Schedule a Meeting",   to: "/meetings", color: "emerald" },
              { label: "Review Documents",     to: "/documents", color: "amber" },
            ].map(({ label, to, color }) => (
              <Link key={label} to={to}
                className={`flex items-center justify-between px-4 py-3 rounded-lg bg-${color}-900/20 border border-${color}-800/30 text-${color}-400 hover:bg-${color}-900/40 transition-colors text-sm font-medium`}>
                {label} <ArrowRight size={14} />
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <h3 className="text-white font-semibold mb-3">Investment Preferences</h3>
          {profile.investmentStages?.length > 0 ? (
            <div className="space-y-2">
              {profile.investmentStages.map((stage) => (
                <div key={stage} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                  <span className="text-slate-400 text-sm">{stage}</span>
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">Preferred</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-500 text-sm mb-3">No preferences set yet</p>
              <Link to="/profile"
                className="text-indigo-400 hover:text-indigo-300 text-sm font-medium inline-flex items-center gap-1">
                Complete your profile <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestorDashboard;