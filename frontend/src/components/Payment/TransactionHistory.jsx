// frontend/src/components/Payment/TransactionHistory.jsx
import { useState, useEffect, useCallback } from "react";
import { getTransactions } from "../../api/paymentAPI";
import toast from "react-hot-toast";

const TYPE_STYLE = {
  deposit:  { color: "text-green-400",  bg: "bg-green-500/10  border-green-500/30",  icon: "⬇️", label: "Deposit"  },
  withdraw: { color: "text-red-400",    bg: "bg-red-500/10    border-red-500/30",    icon: "⬆️", label: "Withdraw" },
  transfer: { color: "text-blue-400",   bg: "bg-blue-500/10   border-blue-500/30",   icon: "↔️", label: "Transfer" },
};

const STATUS_STYLE = {
  pending:   "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  completed: "bg-green-500/20  text-green-400  border-green-500/30",
  failed:    "bg-red-500/20    text-red-400    border-red-500/30",
};

const FILTERS = ["all", "deposit", "withdraw", "transfer"];

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [filter,       setFilter]       = useState("all");
  const [loading,      setLoading]      = useState(true);
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filter !== "all") params.type = filter;
      const res = await getTransactions(params);
      setTransactions(res.data.data);
      setTotalPages(res.data.pages);
    } catch {
      toast.error("Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-slate-700">
        <h2 className="text-white font-bold text-base">Transaction History</h2>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-3 py-1 rounded-lg text-xs capitalize transition-colors ${
                filter === f
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-700 text-slate-400 hover:text-white border border-slate-600"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">💳</p>
          <p className="text-slate-400">No transactions yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-700/50">
          {transactions.map((tx) => {
            const style = TYPE_STYLE[tx.type] || TYPE_STYLE.deposit;
            return (
              <div key={tx._id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-700/30 transition-colors">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg shrink-0 ${style.bg}`}>
                  {style.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {tx.description || style.label}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">{formatDate(tx.createdAt)}</p>
                  {tx.recipient && (
                    <p className="text-slate-400 text-xs">→ {tx.recipient.name}</p>
                  )}
                </div>

                {/* Amount */}
                <div className="text-right shrink-0">
                  <p className={`font-bold text-sm ${
                    tx.type === "deposit" ? "text-green-400" : "text-red-400"
                  }`}>
                    {tx.type === "deposit" ? "+" : "-"}${tx.amount.toLocaleString()}
                  </p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_STYLE[tx.status]}`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-700">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-xs rounded-lg transition-colors"
          >
            ← Prev
          </button>
          <span className="text-slate-400 text-xs">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-xs rounded-lg transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;