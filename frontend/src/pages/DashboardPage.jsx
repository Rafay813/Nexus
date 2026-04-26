import Navbar from "../components/Shared/Navbar";
import Sidebar from "../components/Shared/Sidebar";
import InvestorDashboard from "../components/Dashboard/InvestorDashboard";
import EntrepreneurDashboard from "../components/Dashboard/EntrepreneurDashboard";
import useAuth from "../hooks/useAuth";

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <Navbar title="Dashboard" />
        <main className="flex-1 p-4 md:p-6">
          {user?.role === "investor" ? (
            <InvestorDashboard />
          ) : (
            <EntrepreneurDashboard />
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;