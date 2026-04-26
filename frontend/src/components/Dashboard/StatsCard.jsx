import { TrendingUp, TrendingDown } from "lucide-react";

const StatsCard = ({ icon: Icon, label, value, change, changeType = "up", color = "indigo" }) => {
  const colors = {
    indigo:  { bg: "bg-indigo-900/40",  icon: "text-indigo-400",  border: "border-indigo-800/40"  },
    emerald: { bg: "bg-emerald-900/40", icon: "text-emerald-400", border: "border-emerald-800/40" },
    amber:   { bg: "bg-amber-900/40",   icon: "text-amber-400",   border: "border-amber-800/40"   },
    rose:    { bg: "bg-rose-900/40",    icon: "text-rose-400",    border: "border-rose-800/40"    },
  };
  const c = colors[color] || colors.indigo;

  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-5 flex items-start justify-between`}>
      <div>
        <p className="text-slate-400 text-sm mb-1">{label}</p>
        <p className="text-white text-2xl font-bold">{value}</p>
        {change && (
          <div className={`flex items-center gap-1 mt-1 text-xs font-medium
            ${changeType === "up" ? "text-emerald-400" : "text-red-400"}`}>
            {changeType === "up" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {change}
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl ${c.bg} border ${c.border}`}>
        <Icon size={20} className={c.icon} />
      </div>
    </div>
  );
};

export default StatsCard;