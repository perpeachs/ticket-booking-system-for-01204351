import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const API_BASE = "http://127.0.0.1:5000";

function BookingPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [concert, setConcert] = useState(location.state);
  const token = localStorage.getItem("token");

  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let currentConcert = concert;
        // Fetch concert if state is missing or incomplete
        if (!currentConcert || !currentConcert.zones) {
          const res = await fetch(`${API_BASE}/api/concerts/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            currentConcert = await res.json();
            setConcert(currentConcert);
          } else {
            setError("Failed to load concert details");
            return;
          }
        }

        if (currentConcert && currentConcert.zones) {
          setZones(currentConcert.zones);
        }
      } catch (err) {
        console.error("Fetch booking data error:", err);
        setError("An error occurred while loading booking details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
        // Emit custom event to refresh balance/profile in header
        window.dispatchEvent(new CustomEvent("profileUpdated"));
        navigate("/concert");
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
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/concert")}
          className="mb-8 flex items-center text-blue-600 font-medium hover:text-blue-700 transition"
        >
          <span className="mr-2">←</span> Back to Concerts
        </button>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-10 text-white">
            <h1 className="text-4xl font-extrabold mb-2">Book Your Tickets</h1>
            <p className="text-blue-100 text-lg opacity-90">Secure your spot for an unforgettable experience</p>
          </div>

          <div className="p-8 lg:p-12 flex flex-col lg:flex-row gap-12">
            {/* Left Column: Concert Info */}
            <div className="lg:w-5/12">
              {concert ? (
                <div className="space-y-6">
                  <div className="relative group rounded-xl overflow-hidden shadow-lg">
                    <img
                      src={concert.image}
                      alt={concert.name}
                      className="w-full h-64 object-cover transform group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-blue-600 text-xs font-bold shadow-sm">
                      Upcoming
                    </div>
                  </div>

                  <div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">{concert.name}</h2>
                    <p className="text-gray-500 leading-relaxed mb-4">{concert.description}</p>

                    <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="flex items-center text-gray-700">
                        <span className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-lg text-blue-600 mr-3 text-sm">📅</span>
                        <span className="font-medium">{concert.date}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <span className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-lg text-blue-600 mr-3 text-sm">📍</span>
                        <span className="font-medium">{concert.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-pulse space-y-4">
                  <div className="bg-gray-200 h-64 rounded-xl"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              )}
            </div>

            {/* Right Column: Booking Form */}
            <div className="lg:w-7/12">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 flex items-center">
                  <span className="mr-2">⚠️</span> {error}
                </div>
              )}

              <div className="space-y-8">
                {/* Zone Selection */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg mr-3 text-sm text-gray-500">1</span>
                    Select Your Zone
                  </h3>

                  {loading ? (
                    <div className="grid grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {zones.map((zone) => (
                        <button
                          key={zone.id}
                          disabled={zone.capacity === 0}
                          onClick={() => setSelectedZone(zone)}
                          className={`relative p-5 rounded-xl border-2 text-left transition-all duration-200 group
                            ${selectedZone?.id === zone.id
                              ? "border-blue-500 bg-blue-50/50 ring-4 ring-blue-50"
                              : zone.capacity === 0
                                ? "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                                : "border-gray-100 hover:border-blue-200 hover:bg-gray-50"}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className={`font-bold text-lg ${selectedZone?.id === zone.id ? "text-blue-700" : "text-gray-800"}`}>
                              {zone.name}
                            </span>
                            {selectedZone?.id === zone.id && (
                              <span className="text-blue-500">✓</span>
                            )}
                          </div>
                          <div className="text-2xl font-black text-gray-900 mb-1">
                            ฿{zone.price.toLocaleString()}
                          </div>
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {zone.capacity > 0 ? `${zone.capacity} seats available` : "Sold Out"}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quantity & Summary */}
                {selectedZone && (
                  <div className="space-y-6 pt-4 border-t border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg mr-3 text-sm text-gray-500">2</span>
                      Ticket Quantity
                    </h3>

                    <div className="flex items-center justify-between bg-gray-50 p-6 rounded-2xl">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Quantity</span>
                        <div className="flex items-center gap-6">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 hover:bg-gray-100 transition shadow-sm"
                          >
                            -
                          </button>
                          <span className="text-3xl font-black text-gray-900 w-8 text-center">{quantity}</span>
                          <button
                            onClick={() => setQuantity(Math.min(6, quantity + 1))}
                            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 hover:bg-gray-100 transition shadow-sm"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-xs text-gray-500 mt-2">Maximum 6 tickets per person</span>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Total Amount</span>
                        <div className="text-4xl font-black text-blue-600 tracking-tight">
                          ฿{totalPrice.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {selectedZone.capacity < quantity && (
                      <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center">
                        <span className="mr-2 text-lg">!</span> Not enough seats available in this zone.
                      </div>
                    )}

                    <button
                      disabled={submitting || selectedZone.capacity < quantity}
                      onClick={handleBooking}
                      className={`w-full py-5 rounded-2xl text-white font-black text-xl shadow-xl transition-all duration-300 transform
                        ${!submitting && selectedZone.capacity >= quantity
                          ? "bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-blue-200 hover:-translate-y-1 active:scale-95"
                          : "bg-gray-400 cursor-not-allowed opacity-50"}`}
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : "Book Ticket Now"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;