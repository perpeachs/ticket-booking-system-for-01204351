import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "";

function ConcertPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  const toggleDescription = (concertId) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [concertId]: !prev[concertId],
    }));
  };

  useEffect(() => {
    const fetchConcerts = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/concerts`, {
          headers: {
            Authorization: `Bearer ${token}`,
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
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Concerts</h1>

        {/* Loading */}
        {loading && (
          <div className="text-center py-10">
            <p className="text-xl text-gray-600 animate-pulse">
              Loading concerts...
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && concerts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500 mb-4">No concerts available.</p>
            <p className="text-gray-400">
              Check back later for upcoming events!
            </p>
          </div>
        )}

        {/* Concert Cards */}
        <div className="space-y-4">
          {concerts.map((concert) => (
            <div
              key={concert.id}
              className={`bg-white shadow-md rounded-xl overflow-hidden flex ${
                concert.status === "ended"
                  ? "opacity-60 grayscale"
                  : "hover:shadow-lg transition"
              }`}
            >
              {/* Image */}
              <img
                src={concert.image}
                alt={concert.name}
                className="w-48 h-auto object-cover"
              />

              {/* Content */}
              <div className="flex-1 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-1">
                      {concert.name}
                    </h2>
                    {concert.description && (
                      <div className="mb-2">
                        <p
                          className={`text-gray-500 text-sm whitespace-pre-line ${
                            !expandedDescriptions[concert.id]
                              ? "line-clamp-2 overflow-hidden"
                              : ""
                          }`}
                        >
                          {concert.description}
                        </p>
                        {concert.description.length > 100 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDescription(concert.id);
                            }}
                            className="text-blue-500 hover:text-blue-700 text-xs font-medium mt-1 transition-colors duration-200 cursor-pointer"
                          >
                            {expandedDescriptions[concert.id]
                              ? "Show less"
                              : "...Read more"}
                          </button>
                        )}
                      </div>
                    )}
                    <p className="text-gray-600 text-md">
                      📅 {concert.date} &nbsp;|&nbsp; 📍 {concert.location}
                    </p>
                    {concert.zones && concert.zones.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {concert.zones.map((z) => (
                          <span
                            key={z.id}
                            className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-medium"
                          >
                            {z.name} - {z.price.toLocaleString()} THB (
                            {z.capacity} seats)
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      concert.status === "available"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {concert.status === "available" ? "Available" : "Ended"}
                  </span>
                </div>

                {/* Action */}
                <div className="mt-16">
                  {concert.status === "available" ? (
                    <button
                      onClick={() =>
                        navigate(`/booking/${concert.id}`, {
                          state: concert,
                        })
                      }
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                    >
                      🎫 Buy Ticket
                    </button>
                  ) : (
                    <button
                      disabled
                      className="bg-gray-400 text-white px-6 py-2 rounded-lg text-sm font-medium cursor-not-allowed"
                    >
                      Unavailable
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ConcertPage;
