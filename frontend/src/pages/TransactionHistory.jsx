import React from "react";
import { useNavigate } from "react-router-dom";

function TransactionHistory() {
    const navigate = useNavigate();

    // Mock data (จะเปลี่ยนเป็น data จาก MongoDB API ภายหลัง)
    const transactions = [
        {
            _id: "txn001",
            user_id: 5,
            action: "topup_token",
            details: {
                amount: 1000,
                payment_method: "Credit Card",
                reference_code: "TXN987654321",
            },
            created_at: "2026-03-01T10:00:00Z",
            is_deleted: false,
        },
        {
            _id: "txn002",
            user_id: 5,
            action: "book_ticket",
            details: {
                event_id: 101,
                zone_name: "VIP",
                tokens_deducted: 500,
            },
            created_at: "2026-03-05T14:30:00Z",
            is_deleted: false,
        },
        {
            _id: "txn003",
            user_id: 5,
            action: "cancel_ticket",
            details: {
                booking_id: 1055,
                event_id: 101,
                refunded_tokens: 400,
                reason: "ผู้จัดงานเปลี่ยนวันแสดง",
            },
            created_at: "2026-03-07T09:15:00Z",
            is_deleted: false,
        },
    ];

    const getActionStyle = (action) => {
        switch (action) {
            case "topup_token":
                return { label: "Top-up Token", color: "bg-blue-100 text-blue-700", icon: "💳" };
            case "book_ticket":
                return { label: "Book Ticket", color: "bg-green-100 text-green-700", icon: "🎫" };
            case "cancel_ticket":
                return { label: "Cancel Ticket", color: "bg-red-100 text-red-700", icon: "❌" };
            default:
                return { label: action, color: "bg-gray-100 text-gray-700", icon: "📄" };
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
                            🪙 Amount: <span className="font-semibold">{details.amount} Tokens</span>
                        </p>
                        <p className="text-gray-600">
                            💳 Payment: {details.payment_method}
                        </p>
                        <p className="text-gray-500 text-sm">
                            Ref: {details.reference_code}
                        </p>
                    </>
                );
            case "book_ticket":
                return (
                    <>
                        <p className="text-gray-600">
                            🎪 Event ID: {details.event_id}
                        </p>
                        <p className="text-gray-600">
                            📍 Zone: {details.zone_name}
                        </p>
                        <p className="text-gray-600">
                            🪙 Tokens Deducted: <span className="font-semibold text-red-600">-{details.tokens_deducted}</span>
                        </p>
                    </>
                );
            case "cancel_ticket":
                return (
                    <>
                        <p className="text-gray-600">
                            🎫 Booking ID: {details.booking_id}
                        </p>
                        <p className="text-gray-600">
                            🎪 Event ID: {details.event_id}
                        </p>
                        <p className="text-gray-600">
                            🪙 Refunded: <span className="font-semibold text-green-600">+{details.refunded_tokens}</span>
                        </p>
                        {details.reason && (
                            <p className="text-gray-500 text-sm">
                                📝 Reason: {details.reason}
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
                    📜 Transaction History
                </h1>

                {visibleTransactions.length === 0 ? (
                    <div className="bg-white shadow-md rounded-xl p-6 text-center text-gray-500">
                        No transactions found.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {visibleTransactions.map((txn) => {
                            const style = getActionStyle(txn.action);
                            return (
                                <div
                                    key={txn._id}
                                    className="bg-white shadow-md rounded-xl p-5 border-l-4"
                                    style={{
                                        borderLeftColor:
                                            txn.action === "topup_token" ? "#3B82F6"
                                                : txn.action === "book_ticket" ? "#22C55E"
                                                    : "#EF4444",
                                    }}
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
