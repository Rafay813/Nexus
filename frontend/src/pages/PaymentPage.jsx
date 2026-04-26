// frontend/src/pages/PaymentPage.jsx
import { useState, useEffect, useCallback } from "react";
import { getBalance, getStripeKey } from "../api/paymentAPI";
import PaymentForm from "../components/Payment/PaymentForm";
import TransactionHistory from "../components/Payment/TransactionHistory";
import Sidebar from "../components/Shared/Sidebar";
import Navbar from "../components/Shared/Navbar";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import toast from "react-hot-toast";

const PaymentPage = () => {
  const [balance,       setBalance]       = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [refresh,       setRefresh]       = useState(0);
  const [stripePromise, setStripePromise] = useState(null);

  // Load Stripe publishable key from backend
  useEffect(() => {
    getStripeKey()
      .then((res) => {
        const stripe = loadStripe(res.data.data.publishableKey);
        setStripePromise(stripe);
      })
      .catch(() => toast.error("Failed to load payment system."));
  }, []);

  const fetchBalance = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBalance();
      setBalance(res.data.data.balance);
    } catch {
      toast.error("Failed to load balance.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBalance(); }, [fetchBalance, refresh]);

  const handleSuccess = () => setRefresh((r) => r + 1);

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <Sidebar />

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <Navbar title="Payment" />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-white">Payment Center</h1>
            <p className="text-slate-400 text-sm mt-1">Manage your deposits, withdrawals and transfers</p>
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 mb-6 shadow-xl">
            <p className="text-indigo-200 text-sm font-medium mb-1">Available Balance</p>
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mt-1" />
            ) : (
              <p className="text-4xl font-bold text-white">
                ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            )}
            <p className="text-indigo-200 text-xs mt-3">💳 Nexus Wallet</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Deposits",    icon: "⬇️", color: "text-green-400" },
              { label: "Withdrawals", icon: "⬆️", color: "text-red-400"   },
              { label: "Transfers",   icon: "↔️", color: "text-blue-400"  },
            ].map((s) => (
              <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-center">
                <p className="text-xl mb-1">{s.icon}</p>
                <p className={`text-xs font-medium ${s.color}`}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-white font-semibold mb-3">Make a Transaction</h2>
              {stripePromise ? (
                <Elements stripe={stripePromise}>
                  <PaymentForm balance={balance} onSuccess={handleSuccess} />
                </Elements>
              ) : (
                <div className="flex justify-center items-center h-40">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            <div>
              <h2 className="text-white font-semibold mb-3">Transaction History</h2>
              <TransactionHistory key={refresh} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PaymentPage;