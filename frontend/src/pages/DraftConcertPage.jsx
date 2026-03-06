import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:5000";

function DraftConcertPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchDrafts = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/concerts/drafts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setDrafts(data);
      } else {
        setError(data.error || "Failed to load drafts");
      }
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  const handlePublish = async (concertId) => {
    if (
      !window.confirm(
        "Are you sure you want to publish this concert? Users will be able to see and book it.",
      )
    )
      return;

    try {
      const res = await fetch(
        `${API_BASE}/api/admin/concerts/${concertId}/publish`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage("Concert published successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
        // Remove from drafts list
        setDrafts((prev) => prev.filter((d) => d.id !== concertId));
      } else {
        setError(data.error || "Failed to publish");
        setTimeout(() => setError(""), 3000);
      }
    } catch {
      setError("Server error");
    }
  };

  const handleDelete = async (concertId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this draft? This cannot be undone.",
      )
    )
      return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/concerts/${concertId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage("Draft deleted successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
        setDrafts((prev) => prev.filter((d) => d.id !== concertId));
      } else {
        setError(data.error || "Failed to delete");
        setTimeout(() => setError(""), 3000);
      }
    } catch {
      setError("Server error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Draft Concerts</h1>
          <button
            onClick={() => navigate("/admin/add-concert")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Add New Concert
          </button>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-10">
            <p className="text-xl text-gray-600 animate-pulse">
              Loading drafts...
            </p>
          </div>
        )}

        {/* Empty state */}
        {!loading && drafts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500 mb-4">
              No draft concerts found.
            </p>
            <p className="text-gray-400">
              Create a new concert to get started.
            </p>
          </div>
        )}

        {/* Draft Cards */}
        <div className="space-y-4">
          {drafts.map((concert) => (
            <div
              key={concert.id}
              className="bg-white shadow-md rounded-xl overflow-hidden flex"
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
                      <p className="text-gray-500 text-sm mb-2">
                        {concert.description}
                      </p>
                    )}
                    <p className="text-gray-600 text-md">
                      📅 {concert.date} &nbsp;|&nbsp; 📍 {concert.location}
                    </p>
                    {concert.zones && concert.zones.length > 0 && (
                      <div className="flex gap-2 mt-2">
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

                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                    Draft
                  </span>
                </div>

                {/* Actions */}
                <div className="pt-16 flex gap-3">
                  <button
                    onClick={() => handlePublish(concert.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                  >
                    🚀 Publish
                  </button>
                  <button
                    onClick={() => handleDelete(concert.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DraftConcertPage;
