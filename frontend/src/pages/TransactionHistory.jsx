import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "";

function TransactionHistory() {
    const navigate = useNavigate();

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchTransactions = async () => {
            try {

                const token = localStorage.getItem("token");

                const res = await fetch(`${API_BASE}/api/transactions`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await res.json();

                setTransactions(data);

            } catch (err) {
                console.error("Error fetching transactions:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();

    }, []);

    const getActionStyle = (action, details) => {
        switch (action) {
            case "topup_token":
                return { label: "Top-up Token", color: "bg-blue-100 text-blue-700", icon: "💳", border: "#3B82F6" };
            case "ticket":
                if (details?.status === "expired") {
                    return { label: "Ticket Expired", color: "bg-red-100 text-red-700", icon: "⏰", border: "#EF4444" };
                }
                return { label: "Ticket Booking", color: "bg-green-100 text-green-700", icon: "🎫", border: "#22C55E" };
            case "payment":
                if (details?.status === "failed") {
                    return { label: "Payment Failed", color: "bg-red-100 text-red-700", icon: "⚠️", border: "#EF4444" };
                }
                if (details?.status === "cancel_and_refund") {
                    return { label: "Cancel & Refund", color: "bg-orange-100 text-orange-700", icon: "↩️", border: "#F97316" };
                }
                return { label: "Payment Success", color: "bg-emerald-100 text-emerald-700", icon: "✅", border: "#10B981" };
            default:
                return { label: action, color: "bg-gray-100 text-gray-700", icon: "📄", border: "#9CA3AF" };
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const renderDetails = (action, details) => {
        switch (action) {
            case "topup_token":
                return (
                    <>
                        <p className="text-gray-600">
                            🪙 Amount: <span className="font-semibold text-blue-600">+{(details?.amount || 0).toLocaleString()} Tokens</span>
                        </p>
                        <p className="text-gray-600">
                            💳 Payment Method: {details?.payment_method || "Unknown"}
                        </p>
                        {details?.new_balance !== undefined && (
                            <p className="text-sm font-medium text-gray-500 mt-2 pt-2 border-t border-gray-100">
                                💰 New Balance: {details.new_balance.toLocaleString()} Tokens
                            </p>
                        )}
                    </>
                );
            case "ticket":
                return (
                    <>
                        <p className="text-gray-600">
                            🎪 Event: <span className="font-semibold">{details?.event_name || "Unknown Event"}</span>
                        </p>
                        <p className="text-gray-600">
                            📍 Zone: {details?.zone_name || "Unknown"} &nbsp; | &nbsp; 🎟️ Quantity: {details?.quantity || 0}
                        </p>
                        <p className="text-gray-600">
                            🪙 Price: {(details?.total_price || 0).toFixed(2)} THB
                        </p>
                        {details?.new_balance !== undefined && (
                            <p className="text-sm font-medium text-gray-500 mt-2 pt-2 border-t border-gray-100">
                                💰 New Balance: {details.new_balance.toLocaleString()} Tokens
                            </p>
                        )}
                    </>
                );
            case "payment":
                if (details.status === "success") {
                    return (
                        <>
                            <p className="text-gray-600">
                                🎪 Event: <span className="font-semibold">{details?.event_name || "Unknown Event"}</span>
                            </p>
                            <p className="text-gray-600">
                                📍 Zone: {details?.zone_name || "Unknown"} &nbsp; | &nbsp; 🎟️ Quantity: {details?.quantity || 0}
                            </p>
                            <p className="text-gray-600">
                                🪙 Amount Paid: <span className="font-semibold text-green-600">{(details?.amount_paid || 0).toFixed(2)} THB</span>
                            </p>
                            {details?.new_balance !== undefined && (
                                <p className="text-sm font-medium text-gray-500 mt-2 pt-2 border-t border-gray-100">
                                    💰 New Balance: {details.new_balance.toLocaleString()} Tokens
                                </p>
                            )}
                        </>
                    );
                }
                if (details.status === "cancel_and_refund") {
                    return (
                        <>
                            <p className="text-gray-600">
                                🎪 Event: <span className="font-semibold">{details?.event_name || "Unknown Event"}</span>
                            </p>
                            <p className="text-gray-600">
                                📍 Zone: {details?.zone_name || "Unknown"} &nbsp; | &nbsp; 🎟️ Quantity: {details?.quantity || 0}
                            </p>
                            <p className="text-gray-600">
                                🪙 Refunded: <span className="font-semibold text-green-600">+{(details?.refunded_tokens || 0).toFixed(2)} THB</span>
                            </p>
                            {details?.reason && (
                                <p className="text-gray-500 text-sm">
                                    📝 Reason: {details.reason}
                                </p>
                            )}
                            {details?.new_balance !== undefined && (
                                <p className="text-sm font-medium text-gray-500 mt-2 pt-2 border-t border-gray-100">
                                    💰 New Balance: {details.new_balance.toLocaleString()} Tokens
                                </p>
                            )}
                        </>
                    );
                }
                // failed
                return (
                    <>
                        <p className="text-gray-600">
                            🎪 Event: <span className="font-semibold">{details?.event_name || "Unknown Event"}</span>
                        </p>
                        <p className="text-gray-600">
                            📍 Zone: {details?.zone_name || "Unknown"} &nbsp; | &nbsp; 🎟️ Quantity: {details?.quantity || 0}
                        </p>
                        <p className="text-gray-600">
                            🪙 Attempted: <span className="font-semibold text-red-600">{(details?.amount_paid || 0).toFixed(2)} THB</span>
                        </p>
                        {details?.new_balance !== undefined && (
                            <p className="text-sm font-medium text-gray-500 mt-2 pt-2 border-t border-gray-100">
                                💰 New Balance: {details.new_balance.toLocaleString()} Tokens
                            </p>
                        )}
                    </>
                );
            default:
                return <p className="text-gray-600">{JSON.stringify(details)}</p>;
        }
    };

    const visibleTransactions = transactions.filter((t) => !t.is_deleted);

    return (
        <div className="min-h-screen bg-gray-50 px-6 py-10">

            <div className="max-w-4xl mx-auto">

                {/* Back Button */}
                <button
                    onClick={() => navigate("/profile")}
                    className="mb-6 text-blue-600 hover:text-blue-800 font-medium transition flex items-center gap-1"
                >
                    ← Back to Profile
                </button>

                <h1 className="text-3xl font-bold mb-8 text-gray-800">
                    Transaction History
                </h1>

                {visibleTransactions.length === 0 ? (
                    <div className="bg-white shadow-md rounded-xl p-6 text-center text-gray-500">
                        No transactions found.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {visibleTransactions.map((txn) => {
                            const style = getActionStyle(txn.action, txn.details);
                            return (
                                <div
                                    key={txn._id}
                                    className="bg-white shadow-md rounded-xl p-5 border-l-4"
                                    style={{ borderLeftColor: style.border }}
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{style.icon}</span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${style.color}`}>
                                                {style.label}
                                            </span>
                                        </div>
                                        <span className="text-sm text-gray-400">
                                            {formatDate(txn.created_at)}
                                        </span>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-1">
                                        {renderDetails(txn.action, txn.details)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

            </div>

        </div>
    );
}

export default TransactionHistory;
