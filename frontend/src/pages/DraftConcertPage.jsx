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
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  // Edit modal state
  const [editingConcert, setEditingConcert] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    location: "",
    event_datetime: "",
    image_url: "",
    zones: [{ name: "", capacity: "", price: "" }],
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const toggleDescription = (concertId) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [concertId]: !prev[concertId],
    }));
  };

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

  // === Edit functions ===
  const openEditModal = (concert) => {
    setEditingConcert(concert);
    setEditForm({
      title: concert.name || "",
      description: concert.description || "",
      location: concert.location || "",
      event_datetime: concert.event_datetime || "",
      image_url: concert.image || "",
      zones:
        concert.zones && concert.zones.length > 0
          ? concert.zones.map((z) => ({
              name: z.name,
              capacity: String(z.capacity),
              price: String(z.price),
            }))
          : [{ name: "", capacity: "", price: "" }],
    });
    setEditError("");
  };

  const closeEditModal = () => {
    setEditingConcert(null);
    setEditForm({
      title: "",
      description: "",
      location: "",
      event_datetime: "",
      image_url: "",
      zones: [{ name: "", capacity: "", price: "" }],
    });
    setEditError("");
  };

  const updateEditZone = (index, field, value) => {
    const updated = [...editForm.zones];
    updated[index][field] = value;
    setEditForm({ ...editForm, zones: updated });
  };

  const addEditZoneRow = () => {
    setEditForm({
      ...editForm,
      zones: [...editForm.zones, { name: "", capacity: "", price: "" }],
    });
  };

  const removeEditZoneRow = (index) => {
    setEditForm({
      ...editForm,
      zones: editForm.zones.filter((_, i) => i !== index),
    });
  };

  const handleEditSave = async () => {
    if (!editingConcert) return;
    setEditSaving(true);
    setEditError("");

    const validZones = editForm.zones
      .filter((z) => z.name.trim() !== "")
      .map((z) => ({
        name: z.name.trim(),
        capacity: z.capacity !== "" ? parseInt(z.capacity) : 0,
        price: z.price !== "" ? parseFloat(z.price) : 0,
      }));

    try {
      const res = await fetch(
        `${API_BASE}/api/admin/concerts/${editingConcert.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: editForm.title,
            description: editForm.description,
            location: editForm.location,
            event_datetime: editForm.event_datetime,
            image_url: editForm.image_url,
            zones: validZones,
          }),
        },
      );

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage("Concert updated successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
        closeEditModal();
        // Refresh drafts
        setLoading(true);
        fetchDrafts();
      } else {
        setEditError(data.error || "Failed to update concert");
      }
    } catch {
      setEditError("Server error");
    } finally {
      setEditSaving(false);
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
                    onClick={() => openEditModal(concert)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition"
                  >
                    ✏️ Edit
                  </button>
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

      {/* ========== Edit Modal ========== */}
      {editingConcert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Edit Concert</h2>
              <button
                onClick={closeEditModal}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Edit Error */}
              {editError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {editError}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  required
                  placeholder="e.g. Arctic Monkeys Live in Bangkok"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Concert description..."
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Location & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) =>
                      setEditForm({ ...editForm, location: e.target.value })
                    }
                    placeholder="e.g. Impact Arena"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={editForm.event_datetime}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        event_datetime: e.target.value,
                      })
                    }
                    required
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Image URL (optional)
                </label>
                <input
                  type="text"
                  value={editForm.image_url}
                  onChange={(e) =>
                    setEditForm({ ...editForm, image_url: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Zones */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-600">
                    Ticket Zones
                  </label>
                  <button
                    type="button"
                    onClick={addEditZoneRow}
                    className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-700 transition"
                  >
                    + Add Zone
                  </button>
                </div>
                <div className="space-y-3">
                  {editForm.zones.map((zone, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={zone.name}
                        onChange={(e) =>
                          updateEditZone(index, "name", e.target.value)
                        }
                        placeholder="Zone name (e.g. VIP)"
                        className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        value={zone.capacity}
                        onChange={(e) =>
                          updateEditZone(index, "capacity", e.target.value)
                        }
                        placeholder="Capacity"
                        className="w-24 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        value={zone.price}
                        onChange={(e) =>
                          updateEditZone(index, "price", e.target.value)
                        }
                        placeholder="Price"
                        className="w-24 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {editForm.zones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEditZoneRow(index)}
                          className="text-red-500 hover:text-red-700 text-lg font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={closeEditModal}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={editSaving}
                className={`px-5 py-2 rounded-lg text-white text-sm font-medium transition ${
                  editSaving
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {editSaving ? "Saving..." : "💾 Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DraftConcertPage;
