import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const API_BASE = "http://127.0.0.1:5000";

function BookingPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const concert = location.state;
  const token = localStorage.getItem("token");

  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/concerts/${id}/zones`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setZones(data);
        } else {
          setError("Failed to load zones");
        }
      } catch (err) {
        console.error("Fetch zones error:", err);
        setError("An error occurred while fetching zones");
      } finally {
        setLoading(false);
      }
    };

    fetchZones();
  }, [id, token]);

  const handleBooking = async () => {
    if (!selectedZone) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          zone_id: selectedZone.id,
          quantity: parseInt(quantity),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.status === "paid") {
          alert("Booking successful! Payment completed.");
        } else {
          alert("Booking created! Status is pending. Please check your tokens or history.");
        }
        navigate("/concerts");
      } else {
        setError(data.error || "Booking failed");
      }
    } catch (err) {
      console.error("Booking error:", err);
      setError("An error occurred while processing your booking");
    } finally {
      setSubmitting(false);
    }
  };

  const totalPrice = selectedZone ? selectedZone.price * quantity : 0;

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">

      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl p-6">

        {/* Concert Info */}
        <h1 className="text-3xl font-bold mb-4 text-gray-800">
          Booking Ticket
        </h1>

        <h2 className="text-xl mb-6 text-gray-700">
          {concert?.name || "Loading concert..."}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Seat Map Image */}
        <img
          src="https://picsum.photos/600/300?random=10"
          alt="Seat Map"
          className="w-full rounded-lg mb-6 shadow-sm"
        />

        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500 animate-pulse">Loading zones...</p>
          </div>
        ) : (
          <>
            {/* Zone Selection */}
            <div className="mb-6">

              <label className="block text-lg font-semibold mb-2">
                Select Zone
              </label>

              <select
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedZone?.name || ""}
                onChange={(e) =>
                  setSelectedZone(
                    zones.find((z) => z.name === e.target.value)
                  )
                }
              >
                <option value="">Select Zone</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.name} disabled={zone.capacity === 0}>
                    {zone.name} - {zone.price} THB ({zone.capacity} left)
                  </option>
                ))}

              </select>

            </div>

            {/* Quantity Selection */}
            {selectedZone && (
              <div className="mb-6">
                <label className="block text-lg font-semibold mb-2">
                  Quantity (Max 6)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(6, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-24 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  {selectedZone.capacity < quantity && (
                    <span className="text-red-500 text-sm">
                      Not enough seats available!
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Price Display */}
            {selectedZone && (
              <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex justify-between items-center">
                  <span className="text-lg text-gray-700">Total Price:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {totalPrice.toLocaleString()} THB
                  </span>
                </div>
              </div>
            )}

            {/* Pay Button */}
            <button
              disabled={!selectedZone || submitting || selectedZone.capacity < quantity}
              className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-md transition-all
              ${selectedZone && !submitting && selectedZone.capacity >= quantity
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98]"
                  : "bg-gray-400 cursor-not-allowed"
                }`}
              onClick={handleBooking}
            >
              {submitting ? "Processing..." : "Confirm Booking"}
            </button>
          </>
        )}
      </div>

    </div>
  );
}

export default BookingPage;