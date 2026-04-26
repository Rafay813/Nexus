import { Bell, Search } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { formatDate } from "../../utils/formatDate";

const Navbar = ({ title = "Dashboard" }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      {/* Left: page title — extra left padding on mobile for hamburger */}
      <div className="pl-10 md:pl-0">
        <h1 className="text-white font-semibold text-lg">{title}</h1>
        <p className="text-slate-500 text-xs">{formatDate(new Date())}</p>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Search — hidden on mobile */}
        <div className="hidden md:flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
          <Search size={15} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-slate-300 placeholder-slate-500 outline-none w-40"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full" />
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center cursor-pointer">
          <span className="text-white text-sm font-semibold">
            {user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;