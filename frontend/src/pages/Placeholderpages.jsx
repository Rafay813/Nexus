// frontend/src/pages/PlaceholderPages.jsx
import Navbar from "../components/Shared/Navbar";
import Sidebar from "../components/Shared/Sidebar";
import { Construction } from "lucide-react";

const ComingSoonBadge = ({ week, features }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <div className="w-20 h-20 rounded-2xl bg-indigo-900/40 border border-indigo-800/40 flex items-center justify-center mb-6">
      <Construction size={36} className="text-indigo-400" />
    </div>
    <span className="text-xs font-semibold bg-indigo-900/60 text-indigo-400 px-3 py-1 rounded-full border border-indigo-800/40 mb-4">
      Week {week} Feature
    </span>
    <h2 className="text-white text-2xl font-bold mb-2">Coming Soon</h2>
    <p className="text-slate-400 text-sm max-w-sm mb-6">
      This feature will be implemented in Week {week} of the internship.
    </p>
    <div className="flex flex-wrap justify-center gap-2">
      {features.map((f) => (
        <span key={f} className="text-xs bg-slate-800 text-slate-400 px-3 py-1.5 rounded-lg border border-slate-700">
          {f}
        </span>
      ))}
    </div>
  </div>
);

export const VideoCallPage = () => (
  <div className="min-h-screen bg-slate-950 flex">
    <Sidebar />
    <div className="flex-1 ml-64 flex flex-col">
      <Navbar title="Video Call" />
      <main className="flex-1 p-6">
        <ComingSoonBadge week={2} features={["WebRTC Calls", "Join Room", "Toggle Audio/Video", "End Call"]} />
      </main>
    </div>
  </div>
);

export const DocumentsPage = () => (
  <div className="min-h-screen bg-slate-950 flex">
    <Sidebar />
    <div className="flex-1 ml-64 flex flex-col">
      <Navbar title="Documents" />
      <main className="flex-1 p-6">
        <ComingSoonBadge week={2} features={["Upload Documents", "PDF Preview", "E-Signature", "Version Control"]} />
      </main>
    </div>
  </div>
);