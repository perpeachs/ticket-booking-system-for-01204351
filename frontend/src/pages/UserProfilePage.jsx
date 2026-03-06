import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:5000";

function UserProfilePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Original values to restore on cancel
  const [originalUsername, setOriginalUsername] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");

  // Load profile from API on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`${API_BASE}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setUsername(data.username);
          setEmail(data.email);
          setOriginalUsername(data.username);
          setOriginalEmail(data.email);
        }
      } catch {
        setErrorMessage("Failed to load profile");
      }
    }
    fetchProfile();
  }, [token]);

  const [bookedTickets, setBookedTickets] = useState([]);

  // Load booked tickets from API on mount
  useEffect(() => {
    async function fetchBookedTickets() {
      try {
        const res = await fetch(`${API_BASE}/api/user/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setBookedTickets(data);
        }
      } catch {
        setErrorMessage("Failed to load booked tickets");
      }
    }
    fetchBookedTickets();
  }, [token]);

  const showSuccess = (msg) => {
    setSaveMessage(msg);
    setErrorMessage("");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const showError = (msg) => {
    setErrorMessage(msg);
    setSaveMessage("");
    setTimeout(() => setErrorMessage(""), 3000);
  };

  const handleSaveUsername = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsEditingUsername(false);
        setOriginalUsername(username);
        showSuccess("Username updated successfully!");
      } else {
        showError(data.error || "Failed to update username");
      }
    } catch {
      showError("Server error");
    }
  };

  const handleSaveEmail = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsEditingEmail(false);
        setOriginalEmail(email);
        showSuccess("Email updated successfully!");
      } else {
        showError(data.error || "Failed to update email");
      }
    } catch {
      showError("Server error");
    }
  };

  const handleSavePassword = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/user/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsEditingPassword(false);
        setOldPassword("");
        setNewPassword("");
        setShowPassword(false);
        showSuccess("Password updated successfully!");
      } else {
        showError(data.error || "Failed to update password");
      }
    } catch {
      showError("Server error");
    }
  };

  const handleCancelTicket = async (ticketId) => {
    if (window.confirm("Are you sure you want to cancel this ticket?")) {
      try {
        const res = await fetch(`${API_BASE}/api/user/bookings/${ticketId}/cancel`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "canceled" }),
        });
        const data = await res.json();
        if (res.ok) {
          showSuccess("Ticket canceled successfully!");
          window.dispatchEvent(new Event("balanceUpdated"));
        } else {
          showError(data.error || "Failed to cancel ticket");
        }
      } catch {
        showError("Server error");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">My Profile</h1>

        {/* Success Message */}
        {saveMessage && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
            {saveMessage}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* Profile Info Card */}
        <div className="bg-white shadow-md rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-700">
            Account Information
          </h2>

          {/* Username */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Username
            </label>
            <div className="flex items-center gap-3">
              {isEditingUsername ? (
                <>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSaveUsername}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingUsername(false);
                      setUsername(originalUsername);
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-lg text-gray-800">
                    {username}
                  </span>
                  <button
                    onClick={() => setIsEditingUsername(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            <div className="flex items-center gap-3">
              {isEditingEmail ? (
                <>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSaveEmail}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingEmail(false);
                      setEmail(originalEmail);
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-lg text-gray-800">{email}</span>
                  <button
                    onClick={() => setIsEditingEmail(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Password
            </label>
            <div className="flex items-center gap-3">
              {isEditingPassword ? (
                <div className="flex flex-col gap-2 flex-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Current password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                    <button
                      onClick={handleSavePassword}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingPassword(false);
                        setShowPassword(false);
                        setOldPassword("");
                        setNewPassword("");
                      }}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="flex-1 text-lg text-gray-800">
                    ••••••••
                  </span>
                  <button
                    onClick={() => setIsEditingPassword(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Transaction History Button */}
        <div className="bg-white shadow-md rounded-xl p-6 mb-6 border border-gray-200">
          <button
            onClick={() => navigate("/history")}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            📜 View Transaction History
          </button>
        </div>


        {/* Booked Tickets */}
        <div className="bg-white shadow-md rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-700">
            My Booked Tickets
          </h2>

          <div className="space-y-4">
            {bookedTickets.length === 0 ? (
              <p className="text-gray-600">No booked tickets found.</p>
            ) : (
              bookedTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`border rounded-lg p-4 flex items-center justify-between ${
                    ticket.status === "expired"
                      ? "bg-gray-50 opacity-70"
                      : "bg-white"
                    }`}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {ticket.concertName}
                    </h3>
                    <p className="text-gray-600">
                      📅 {ticket.date} &nbsp; | &nbsp; 🎫 Zone {ticket.zone}{" "}
                      &nbsp; | &nbsp; 🎟️ Quantity: {ticket.quantity}
                    </p>
                    <p className="text-gray-600">🪙 {ticket.price} THB</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        ticket.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : ticket.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                    >
                      {ticket.status === "paid"
                        ? "Paid"
                        : ticket.status === "pending"
                          ? "Pending"
                          : "Completed"}
                    </span>
                    {ticket.status === "paid" && (
                      <button
                        onClick={() => handleCancelTicket(ticket.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-red-600 transition"
                      >
                        Cancel Ticket
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;
