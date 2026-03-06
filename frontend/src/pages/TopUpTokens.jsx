import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:5000";

function TopUpTokens() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [balance, setBalance] = useState(0);
    const [selectedAmount, setSelectedAmount] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const topUpOptions = [100, 500, 1000, 2000, 5000, 10000];

    const paymentMethods = [
        { value: "credit_card", label: "Credit Card" },
        { value: "prompt_pay", label: "PromptPay" },
        { value: "bank_transfer", label: "Bank Transfer" },
    ];

    useEffect(() => {
        fetchBalance();
    }, [token]);

    const showSuccess = (msg) => {
        setSuccessMessage(msg);
        setErrorMessage("");
        setTimeout(() => setSuccessMessage(""), 3000);
    };

    const showError = (msg) => {
        setErrorMessage(msg);
        setSuccessMessage("");
        setTimeout(() => setErrorMessage(""), 3000);
    };

    const fetchBalance = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/user/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                setBalance(data.tokens);
            }
        } catch (err) {
            console.error("Failed to fetch balance:", err);
            showError("Failed to load balance");
        }
    };

    const handleTopUp = async () => {
        if (!selectedAmount || !paymentMethod) return;

        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const response = await fetch(`${API_BASE}/api/user/topup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    amount: selectedAmount,
                    payment_method: paymentMethod
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setBalance(data.new_balance);
                // Trigger refresh in header
                window.dispatchEvent(new Event("balanceUpdated"));

                showSuccess(
                    `Top-up successful! +${selectedAmount.toLocaleString()} tokens via ${paymentMethods.find((m) => m.value === paymentMethod)?.label
                    }`
                );
                setSelectedAmount(null);
                setPaymentMethod("");
            } else {
                showError(data.error || "Top-up failed. Please try again.");
            }
        } catch (err) {
            console.error("Top-up error:", err);
            showError("An error occurred. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-6 py-10">

            <div className="max-w-2xl mx-auto">

                <h1 className="text-3xl font-bold mb-8 text-gray-800">
                    Top-up Tokens
                </h1>

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                        {successMessage}
                    </div>
                )}

                {/* Error Message */}
                {errorMessage && (
                    <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                        {errorMessage}
                    </div>
                )}

                {/* Current Balance */}
                <div className="bg-white shadow-md rounded-xl p-6 mb-6 text-center">
                    <p className="text-gray-500 text-sm mb-1">Current Balance</p>
                    <p className="text-4xl font-bold text-yellow-600">
                        🪙 {balance.toLocaleString()}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">tokens</p>
                </div>

                {/* Select Amount */}
                <div className="bg-white shadow-md rounded-xl p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">
                        Select Amount
                    </h2>
                    <div className="grid grid-cols-3 gap-3">
                        {topUpOptions.map((amount) => (
                            <button
                                key={amount}
                                onClick={() => setSelectedAmount(amount)}
                                className={`py-3 rounded-lg font-semibold transition ${selectedAmount === amount
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                {amount.toLocaleString()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white shadow-md rounded-xl p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">
                        Payment Method
                    </h2>
                    <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select payment method</option>
                        {paymentMethods.map((method) => (
                            <option key={method.value} value={method.value}>
                                {method.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Confirm */}
                <div className="bg-white shadow-md rounded-xl p-6">
                    {selectedAmount && paymentMethod ? (
                        <div className="mb-4 text-center">
                            <p className="text-gray-600">
                                You are adding{" "}
                                <span className="font-bold text-blue-600">
                                    {selectedAmount.toLocaleString()} tokens
                                </span>{" "}
                                via{" "}
                                <span className="font-bold">
                                    {paymentMethods.find((m) => m.value === paymentMethod)?.label}
                                </span>
                            </p>
                            <p className="text-gray-500 text-sm mt-1">
                                New balance: 🪙 {(balance + selectedAmount).toLocaleString()}
                            </p>
                        </div>
                    ) : (
                        <p className="text-gray-400 text-center mb-4">
                            Select an amount and payment method to continue
                        </p>
                    )}

                    <button
                        disabled={!selectedAmount || !paymentMethod || loading}
                        onClick={handleTopUp}
                        className={`w-full py-3 rounded-lg text-white font-semibold transition ${selectedAmount && paymentMethod && !loading
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-gray-400 cursor-not-allowed"
                            }`}
                    >
                        {loading ? "Processing..." : "Confirm Top-up"}
                    </button>
                </div>

            </div>

        </div>
    );
}

export default TopUpTokens;
