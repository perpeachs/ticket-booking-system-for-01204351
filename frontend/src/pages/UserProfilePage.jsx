import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function UserProfilePage() {
  const navigate = useNavigate();
  // Mock user data (จะเปลี่ยนเป็น data จาก Flask API ภายหลัง)
  const [username, setUsername] = useState("john_doe");
  const [email, setEmail] = useState("john_doe@email.com");
  const [password, setPassword] = useState("password123");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Mock booked tickets
  const [bookedTickets, setBookedTickets] = useState([
    {
      id: 1,
      concertName: "Arctic Monkeys Live in Bangkok",
      date: "10 June 2026",
      zone: "VIP",
      quantity: 2,
      price: 5000,
      status: "success",
    },
    {
      id: 2,
      concertName: "Coldplay Music of the Spheres",
      date: "15 July 2026",
      zone: "A",
      quantity: 1,
      price: 3500,
      status: "canceled",
    },
    {
      id: 3,
      concertName: "Taylor Swift Eras Tour",
      date: "1 Jan 2025",
      zone: "B",
      quantity: 3,
      price: 2500,
      status: "expired",
    },
    {
      id: 4,
      concertName: "Ed Sheeran Mathematics Tour",
      date: "20 Aug 2026",
      zone: "A",
      quantity: 1,
      price: 4000,
      status: "pending",
    },
  ]);

  const handleSaveUsername = () => {
    setIsEditingUsername(false);
    setSaveMessage("Username updated successfully!");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const handleSaveEmail = () => {
    setIsEditingEmail(false);
    setSaveMessage("Email updated successfully!");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const handleSavePassword = () => {
    setIsEditingPassword(false);
    setSaveMessage("Password updated successfully!");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const handleCancelTicket = (ticketId) => {
    if (window.confirm("Are you sure you want to cancel this ticket?")) {
      setBookedTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId ? { ...t, status: "canceled", is_deleted: true } : t
        )
      );
      setSaveMessage("Ticket canceled successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">

      <div className="max-w-4xl mx-auto">

        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          My Profile
        </h1>

        {/* Success Message */}
        {saveMessage && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
            {saveMessage}
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
                    onClick={() => setIsEditingUsername(false)}
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
                    onClick={() => setIsEditingEmail(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-lg text-gray-800">
                    {email}
                  </span>
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
                <>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </>
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

        {/* Booked Tickets */}
        <div className="bg-white shadow-md rounded-xl p-6 mb-6">

          <h2 className="text-xl font-semibold mb-6 text-gray-700">
            My Booked Tickets
          </h2>

          <div className="space-y-4">
            {bookedTickets.filter((t) => t.status !== "canceled" && t.status !== "expired").map((ticket) => (
              <div
                key={ticket.id}
                className={`border rounded-lg p-4 flex items-center justify-between ${ticket.status === "completed"
                  ? "bg-gray-50 opacity-70"
                  : "bg-white"
                  }`}
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {ticket.concertName}
                  </h3>
                  <p className="text-gray-600">
                    📅 {ticket.date} &nbsp; | &nbsp; 🎫 Zone {ticket.zone} &nbsp; | &nbsp; 🎟️ Quantity: {ticket.quantity}
                  </p>
                  <p className="text-gray-600">
                    🪙 {ticket.price} THB
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${ticket.status === "success"
                      ? "bg-green-100 text-green-700"
                      : ticket.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-200 text-gray-600"
                      }`}
                  >
                    {ticket.status === "success" ? "Success" : ticket.status === "pending" ? "Pending" : "Canceled"}
                  </span>
                  {ticket.status === "success" && (
                    <button
                      onClick={() => handleCancelTicket(ticket.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-red-600 transition"
                    >
                      Cancel Ticket
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Transaction History Button */}
        <div className="bg-white shadow-md rounded-xl p-6">
          <button
            onClick={() => navigate("/history")}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            📜 View Transaction History
          </button>
        </div>

      </div>

    </div>
  );
}

export default UserProfilePage;