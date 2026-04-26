import { DollarSign, Users, Target, Rocket, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import StatsCard from "./StatsCard";
import useAuth from "../../hooks/useAuth";

const EntrepreneurDashboard = () => {
  const { user } = useAuth();
  const profile  = user?.entrepreneurProfile || {};

  const raised   = profile.fundingRaised || 0;
  const goal     = profile.fundingGoal   || 1;
  const pct      = Math.min(Math.round((raised / goal) * 100), 100);

  const stats = [
    { icon: DollarSign, label: "Funding Goal",    value: `$${(goal).toLocaleString()}`,   color: "emerald" },
    { icon: Target,     label: "Funds Raised",    value: `$${raised.toLocaleString()}`,    color: "indigo"  },
    { icon: Users,      label: "Team Size",        value: `${profile.teamSize || 1} members`, color: "amber" },
    { icon: Rocket,     label: "Startup Stage",    value: profile.startupStage || "Not set", color: "rose"  },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="rounded-xl bg-gradient-to-r from-purple-900/50 to-slate-800/50 border border-purple-800/40 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-white text-xl font-bold">
              Welcome back, {user?.name?.split(" ")[0]}! 🚀
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {profile.startupName ? `${profile.startupName} · ` : ""}Entrepreneur Dashboard
            </p>
            {profile.industry && (
              <span className="mt-2 inline-block text-xs bg-purple-900/60 text-purple-300 px-2.5 py-1 rounded-full border border-purple-800/50">
                {profile.industry}
              </span>
            )}
          </div>
          <Link to="/profile"
            className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-medium">
            Edit Profile <ArrowRight size={12} />
          </Link>
        </div>

        {/* Funding progress */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>Funding Progress</span>
            <span className="text-white font-medium">{pct}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ${raised.toLocaleString()} raised of ${goal.toLocaleString()} goal
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => <StatsCard key={s.label} {...s} />)}
      </div>

      {/* Quick actions + traction */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <h3 className="text-white font-semibold mb-3">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: "Browse Investors",   to: "/profile",   color: "indigo"  },
              { label: "Schedule a Pitch",   to: "/meetings",  color: "emerald" },
              { label: "Upload Documents",   to: "/documents", color: "amber"   },
            ].map(({ label, to, color }) => (
              <Link key={label} to={to}
                className={`flex items-center justify-between px-4 py-3 rounded-lg bg-${color}-900/20 border border-${color}-800/30 text-${color}-400 hover:bg-${color}-900/40 transition-colors text-sm font-medium`}>
                {label} <ArrowRight size={14} />
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <h3 className="text-white font-semibold mb-3">Traction & Business</h3>
          {profile.traction ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">Traction</p>
                <p className="text-slate-300 text-sm">{profile.traction}</p>
              </div>
              {profile.revenueModel && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Revenue Model</p>
                  <p className="text-slate-300 text-sm">{profile.revenueModel}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-500 text-sm mb-3">Complete your startup profile</p>
              <Link to="/profile"
                className="text-purple-400 hover:text-purple-300 text-sm font-medium inline-flex items-center gap-1">
                Add details <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EntrepreneurDashboard;