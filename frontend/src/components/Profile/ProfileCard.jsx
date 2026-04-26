import { MapPin, Phone, Globe, Link, Mail } from "lucide-react";
import { formatDate } from "../../utils/formatDate";

const ProfileCard = ({ user }) => {
  if (!user) return null;

  const isInvestor      = user.role === "investor";
  const profile         = isInvestor ? user.investorProfile : user.entrepreneurProfile;
  const initials        = user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
      {/* Header */}
      <div className={`h-24 ${isInvestor ? "bg-gradient-to-r from-emerald-900/60 to-slate-800" : "bg-gradient-to-r from-purple-900/60 to-slate-800"}`} />

      <div className="px-6 pb-6">
        {/* Avatar */}
        <div className="-mt-10 mb-4">
          <div className={`w-20 h-20 rounded-2xl border-4 border-slate-900 flex items-center justify-center text-white text-2xl font-bold
            ${isInvestor ? "bg-emerald-700" : "bg-purple-700"}`}>
            {initials}
          </div>
        </div>

        {/* Name & role */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-white text-xl font-bold">{user.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize border
                ${isInvestor
                  ? "bg-emerald-900/50 text-emerald-400 border-emerald-800/50"
                  : "bg-purple-900/50 text-purple-400 border-purple-800/50"}`}>
                {user.role}
              </span>
              {(profile?.firmName || profile?.startupName) && (
                <span className="text-slate-400 text-sm">
                  {profile?.firmName || profile?.startupName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-slate-400 text-sm mb-4 leading-relaxed">{user.bio}</p>
        )}

        {/* Contact info */}
        <div className="space-y-2 mb-4">
          {user.email && (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Mail size={14} className="flex-shrink-0" />
              <span>{user.email}</span>
            </div>
          )}
          {user.location && (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <MapPin size={14} className="flex-shrink-0" />
              <span>{user.location}</span>
            </div>
          )}
          {user.phone && (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Phone size={14} className="flex-shrink-0" />
              <span>{user.phone}</span>
            </div>
          )}
        </div>

        {/* Role-specific info */}
        {isInvestor && profile && (
          <div className="pt-4 border-t border-slate-800 space-y-3">
            {(profile.minInvestment || profile.maxInvestment) && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Investment Range</p>
                <p className="text-emerald-400 font-semibold text-sm">
                  ${profile.minInvestment?.toLocaleString()} – ${profile.maxInvestment?.toLocaleString()}
                </p>
              </div>
            )}
            {profile.investmentStages?.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-2">Investment Stages</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.investmentStages.map((s) => (
                    <span key={s} className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-md border border-slate-700">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {profile.industriesOfInterest?.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-2">Industries</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.industriesOfInterest.map((i) => (
                    <span key={i} className="text-xs bg-emerald-900/30 text-emerald-400 px-2 py-1 rounded-md border border-emerald-800/30">{i}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!isInvestor && profile && (
          <div className="pt-4 border-t border-slate-800 space-y-3">
            {profile.startupStage && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Stage</span>
                <span className="text-xs bg-purple-900/40 text-purple-300 px-2.5 py-1 rounded-full border border-purple-800/40">{profile.startupStage}</span>
              </div>
            )}
            {profile.fundingGoal > 0 && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Funding Progress</span>
                  <span className="text-white">{Math.round(((profile.fundingRaised || 0) / profile.fundingGoal) * 100)}%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${Math.min(((profile.fundingRaised || 0) / profile.fundingGoal) * 100, 100)}%` }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Links */}
        {(profile?.linkedIn || profile?.website) && (
          <div className="pt-4 border-t border-slate-800 flex gap-3">
            {profile?.linkedIn && (
              <a href={profile.linkedIn} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 transition-colors">
                <Linkedin size={14} /> LinkedIn
              </a>
            )}
            {profile?.website && (
              <a href={profile.website} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 transition-colors">
                <Globe size={14} /> Website
              </a>
            )}
          </div>
        )}

        <p className="text-xs text-slate-600 mt-4">Member since {formatDate(user.createdAt)}</p>
      </div>
    </div>
  );
};

export default ProfileCard;