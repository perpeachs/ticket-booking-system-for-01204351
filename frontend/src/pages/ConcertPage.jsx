import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:5000";

function ConcertPage() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchConcerts = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/concerts`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setConcerts(data);
        } else {
          setError("Failed to load concerts");
        }
      } catch (err) {
        console.error("Fetch concerts error:", err);
        setError("An error occurred while fetching concerts");
      } finally {
        setLoading(false);
      }
    };

    fetchConcerts();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">

      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Concerts
      </h1>

      {loading && (
        <div className="text-center py-10">
          <p className="text-xl text-gray-600 animate-pulse">Loading concerts...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8">
          {error}
        </div>
      )}

      {!loading && !error && concerts.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          <p className="text-xl">No concerts found.</p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">

        {concerts.map((concert) => (
          <div
            key={concert.id}
            className={`rounded-xl shadow-md overflow-hidden bg-white
            ${concert.status === "ended"
                ? "opacity-60 grayscale"
                : "hover:shadow-lg transition"
              }`}
          >

            {/* Image */}
            <img
              src={concert.image}
              alt={concert.name}
              className="w-full h-48 object-cover"
            />

            {/* Content */}
            <div className="p-4">

              <h2 className="text-xl font-semibold mb-2">
                {concert.name}
              </h2>

              <p className="text-gray-600">
                📅 {concert.date}
              </p>

              <p className="text-gray-600 mb-4">
                📍 {concert.location}
              </p>

              {/* Button */}
              {concert.status === "available" ? (
                <button
                  onClick={() =>
                    navigate(`/booking/${concert.id}`, {
                      state: concert,
                    })
                  }
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Buy Ticket
                </button>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-400 text-white py-2 rounded-lg cursor-not-allowed"
                >
                  Unavailable
                </button>
              )}

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}

export default ConcertPage;