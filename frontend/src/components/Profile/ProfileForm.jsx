import { useState } from "react";
import { useForm } from "react-hook-form";
import { Save, User, MapPin, Phone, FileText } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { updateMyProfileAPI } from "../../api/profileapi";
import toast from "react-hot-toast";

const ProfileForm = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("basic"); // basic | role

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name:     user?.name     || "",
      bio:      user?.bio      || "",
      location: user?.location || "",
      phone:    user?.phone    || "",
      // Investor fields
      investorProfile: {
        firmName:              user?.investorProfile?.firmName              || "",
        minInvestment:         user?.investorProfile?.minInvestment         || "",
        maxInvestment:         user?.investorProfile?.maxInvestment         || "",
        industriesOfInterest:  user?.investorProfile?.industriesOfInterest?.join(", ") || "",
        investmentStages:      user?.investorProfile?.investmentStages?.join(", ")      || "",
        preferredRegions:      user?.investorProfile?.preferredRegions?.join(", ")      || "",
        linkedIn:              user?.investorProfile?.linkedIn              || "",
        website:               user?.investorProfile?.website              || "",
      },
      // Entrepreneur fields
      entrepreneurProfile: {
        startupName:   user?.entrepreneurProfile?.startupName   || "",
        startupStage:  user?.entrepreneurProfile?.startupStage  || "",
        industry:      user?.entrepreneurProfile?.industry      || "",
        fundingGoal:   user?.entrepreneurProfile?.fundingGoal   || "",
        fundingRaised: user?.entrepreneurProfile?.fundingRaised || "",
        teamSize:      user?.entrepreneurProfile?.teamSize      || 1,
        businessModel: user?.entrepreneurProfile?.businessModel || "",
        revenueModel:  user?.entrepreneurProfile?.revenueModel  || "",
        traction:      user?.entrepreneurProfile?.traction      || "",
        linkedIn:      user?.entrepreneurProfile?.linkedIn      || "",
        website:       user?.entrepreneurProfile?.website       || "",
      },
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Convert comma-separated strings back to arrays for investor
      if (user?.role === "investor") {
        const ip = data.investorProfile;
        ip.industriesOfInterest = ip.industriesOfInterest
          ? ip.industriesOfInterest.split(",").map((s) => s.trim()).filter(Boolean)
          : [];
        ip.investmentStages = ip.investmentStages
          ? ip.investmentStages.split(",").map((s) => s.trim()).filter(Boolean)
          : [];
        ip.preferredRegions = ip.preferredRegions
          ? ip.preferredRegions.split(",").map((s) => s.trim()).filter(Boolean)
          : [];
        ip.minInvestment = Number(ip.minInvestment) || 0;
        ip.maxInvestment = Number(ip.maxInvestment) || 0;
      }
      if (user?.role === "entrepreneur") {
        const ep = data.entrepreneurProfile;
        ep.fundingGoal   = Number(ep.fundingGoal)   || 0;
        ep.fundingRaised = Number(ep.fundingRaised) || 0;
        ep.teamSize      = Number(ep.teamSize)      || 1;
      }

      const res = await updateMyProfileAPI(data);
      updateUser(res.data.data.profile);
      toast.success("Profile updated successfully!");
    } catch (err) {
      const msg = err.response?.data?.message || "Update failed.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 focus:border-indigo-500 text-white text-sm placeholder-slate-500 outline-none transition-colors";
  const labelClass = "block text-sm font-medium text-slate-300 mb-1.5";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Tab switcher */}
      <div className="flex gap-1 bg-slate-800 p-1 rounded-lg w-fit">
        {["basic", "role"].map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize
              ${tab === t ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}>
            {t === "basic" ? "Basic Info" : `${user?.role === "investor" ? "Investor" : "Startup"} Profile`}
          </button>
        ))}
      </div>

      {/* Basic info tab */}
      {tab === "basic" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}><User size={14} className="inline mr-1" />Full Name</label>
            <input {...register("name")} className={inputClass} placeholder="Your name" />
          </div>
          <div>
            <label className={labelClass}><Phone size={14} className="inline mr-1" />Phone</label>
            <input {...register("phone")} className={inputClass} placeholder="+1 234 567 8900" />
          </div>
          <div>
            <label className={labelClass}><MapPin size={14} className="inline mr-1" />Location</label>
            <input {...register("location")} className={inputClass} placeholder="City, Country" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}><FileText size={14} className="inline mr-1" />Bio</label>
            <textarea {...register("bio")} rows={4} className={`${inputClass} resize-none`}
              placeholder="Tell investors/entrepreneurs about yourself..." />
            <p className="text-xs text-slate-500 mt-1">Max 500 characters</p>
          </div>
        </div>
      )}

      {/* Role-specific tab */}
      {tab === "role" && user?.role === "investor" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Firm / Company Name</label>
            <input {...register("investorProfile.firmName")} className={inputClass} placeholder="Acme Ventures" />
          </div>
          <div>
            <label className={labelClass}>LinkedIn URL</label>
            <input {...register("investorProfile.linkedIn")} className={inputClass} placeholder="https://linkedin.com/in/..." />
          </div>
          <div>
            <label className={labelClass}>Min Investment ($)</label>
            <input {...register("investorProfile.minInvestment")} type="number" className={inputClass} placeholder="50000" />
          </div>
          <div>
            <label className={labelClass}>Max Investment ($)</label>
            <input {...register("investorProfile.maxInvestment")} type="number" className={inputClass} placeholder="500000" />
          </div>
          <div>
            <label className={labelClass}>Investment Stages <span className="text-slate-500">(comma separated)</span></label>
            <input {...register("investorProfile.investmentStages")} className={inputClass} placeholder="Seed, Series A, Series B" />
          </div>
          <div>
            <label className={labelClass}>Industries of Interest <span className="text-slate-500">(comma separated)</span></label>
            <input {...register("investorProfile.industriesOfInterest")} className={inputClass} placeholder="FinTech, HealthTech, SaaS" />
          </div>
          <div>
            <label className={labelClass}>Preferred Regions <span className="text-slate-500">(comma separated)</span></label>
            <input {...register("investorProfile.preferredRegions")} className={inputClass} placeholder="USA, Europe, Asia" />
          </div>
          <div>
            <label className={labelClass}>Website</label>
            <input {...register("investorProfile.website")} className={inputClass} placeholder="https://yourfirm.com" />
          </div>
        </div>
      )}

      {tab === "role" && user?.role === "entrepreneur" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Startup Name</label>
            <input {...register("entrepreneurProfile.startupName")} className={inputClass} placeholder="My Startup Inc." />
          </div>
          <div>
            <label className={labelClass}>Startup Stage</label>
            <select {...register("entrepreneurProfile.startupStage")} className={inputClass}>
              <option value="">Select stage</option>
              {["Idea", "MVP", "Pre-Seed", "Seed", "Series A", "Growth"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Industry</label>
            <input {...register("entrepreneurProfile.industry")} className={inputClass} placeholder="FinTech, HealthTech..." />
          </div>
          <div>
            <label className={labelClass}>Team Size</label>
            <input {...register("entrepreneurProfile.teamSize")} type="number" min="1" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Funding Goal ($)</label>
            <input {...register("entrepreneurProfile.fundingGoal")} type="number" className={inputClass} placeholder="500000" />
          </div>
          <div>
            <label className={labelClass}>Funds Raised ($)</label>
            <input {...register("entrepreneurProfile.fundingRaised")} type="number" className={inputClass} placeholder="0" />
          </div>
          <div>
            <label className={labelClass}>Business Model</label>
            <input {...register("entrepreneurProfile.businessModel")} className={inputClass} placeholder="B2B SaaS subscription" />
          </div>
          <div>
            <label className={labelClass}>Revenue Model</label>
            <input {...register("entrepreneurProfile.revenueModel")} className={inputClass} placeholder="Monthly recurring revenue" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Traction</label>
            <textarea {...register("entrepreneurProfile.traction")} rows={3} className={`${inputClass} resize-none`}
              placeholder="1000 users, $10k MRR, 20% MoM growth..." />
          </div>
          <div>
            <label className={labelClass}>LinkedIn URL</label>
            <input {...register("entrepreneurProfile.linkedIn")} className={inputClass} placeholder="https://linkedin.com/in/..." />
          </div>
          <div>
            <label className={labelClass}>Website</label>
            <input {...register("entrepreneurProfile.website")} className={inputClass} placeholder="https://mystartup.com" />
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <button type="submit" disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold text-sm transition-colors">
          {loading ? (
            <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <><Save size={16} /> Save Changes</>
          )}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;