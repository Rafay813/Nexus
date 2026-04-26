// frontend/src/components/Payment/PaymentForm.jsx
import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { createDeposit, confirmDeposit, withdraw, transfer } from "../../api/paymentAPI";
import toast from "react-hot-toast";

const TABS = ["deposit", "withdraw", "transfer"];

const CARD_STYLE = {
  style: {
    base: {
      color: "#f1f5f9",
      fontFamily: "inherit",
      fontSize: "14px",
      "::placeholder": { color: "#64748b" },
    },
    invalid: { color: "#ef4444" },
  },
};

const PaymentForm = ({ balance, onSuccess }) => {
  const stripe   = useStripe();
  const elements = useElements();

  const [tab,     setTab]     = useState("deposit");
  const [amount,  setAmount]  = useState("");
  const [email,   setEmail]   = useState("");
  const [desc,    setDesc]    = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => { setAmount(""); setEmail(""); setDesc(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt < 1) return toast.error("Enter a valid amount (min $1).");

    setLoading(true);
    try {
      // ── Deposit — real Stripe card charge ──────────────────────────────
      if (tab === "deposit") {
        if (!stripe || !elements) {
          return toast.error("Stripe not loaded yet.");
        }

        // 1. Create payment intent on backend
        const intentRes = await createDeposit({ amount: amt });
        const { clientSecret } = intentRes.data.data;

        // 2. Confirm card payment with Stripe
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        });

        if (error) {
          toast.error(error.message || "Payment failed.");
          setLoading(false);
          return;
        }

        // 3. Confirm on backend → updates balance
        await confirmDeposit({ paymentIntentId: paymentIntent.id });
        toast.success(`$${amt} deposited successfully!`);

      // ── Withdraw ────────────────────────────────────────────────────────
      } else if (tab === "withdraw") {
        await withdraw({ amount: amt, description: desc });
        toast.success(`$${amt} withdrawn successfully!`);

      // ── Transfer ────────────────────────────────────────────────────────
      } else if (tab === "transfer") {
        if (!email) return toast.error("Recipient email is required.");
        await transfer({ amount: amt, recipientEmail: email, description: desc });
        toast.success(`$${amt} transferred to ${email}!`);
      }

      reset();
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Transaction failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-slate-900 rounded-xl p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); reset(); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              tab === t
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {t === "deposit"  && "⬇️ "}
            {t === "withdraw" && "⬆️ "}
            {t === "transfer" && "↔️ "}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Amount */}
        <div>
          <label className="block text-slate-300 text-sm mb-1">Amount (USD) *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          {tab === "withdraw" && (
            <p className="text-slate-500 text-xs mt-1">
              Available: <span className="text-white">${balance?.toFixed(2) || "0.00"}</span>
            </p>
          )}
        </div>

        {/* Stripe Card Element — deposit only */}
        {tab === "deposit" && (
          <div>
            <label className="block text-slate-300 text-sm mb-1">Card Details *</label>
            <div className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-3 focus-within:border-indigo-500 transition-colors">
              <CardElement options={CARD_STYLE} />
            </div>
            {/* Stripe test card hint */}
            <p className="text-slate-500 text-xs mt-1">
              🧪 Test card: <span className="text-slate-300 font-mono">4242 4242 4242 4242</span> · Any future date · Any CVC
            </p>
          </div>
        )}

        {/* Recipient email — transfer only */}
        {tab === "transfer" && (
          <div>
            <label className="block text-slate-300 text-sm mb-1">Recipient Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="recipient@email.com"
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}

        {/* Description — withdraw & transfer */}
        {(tab === "withdraw" || tab === "transfer") && (
          <div>
            <label className="block text-slate-300 text-sm mb-1">Description</label>
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Optional note..."
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || (tab === "deposit" && !stripe)}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            <>
              {tab === "deposit"  && "⬇️ Deposit"}
              {tab === "withdraw" && "⬆️ Withdraw"}
              {tab === "transfer" && "↔️ Transfer"}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;