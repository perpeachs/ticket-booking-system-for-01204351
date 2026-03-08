import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:5000";

function AddConcertPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventDatetime, setEventDatetime] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [zones, setZones] = useState([{ name: "", capacity: "", price: "" }]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const addZoneRow = () => {
    setZones([...zones, { name: "", capacity: "", price: "" }]);
  };

  const removeZoneRow = (index) => {
    setZones(zones.filter((_, i) => i !== index));
  };

  const updateZone = (index, field, value) => {
    const updated = [...zones];
    updated[index][field] = value;
    setZones(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Validate zones
    const validZones = zones
      .filter((z) => z.name.trim() !== "")
      .map((z) => ({
        name: z.name.trim(),
        capacity: z.capacity !== "" ? parseInt(z.capacity) : 0,
        price: z.price !== "" ? parseFloat(z.price) : 0,
      }));

    try {
      const res = await fetch(`${API_BASE}/api/admin/concerts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          location,
          event_datetime: eventDatetime,
          image_url: imageUrl,
          zones: validZones,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(
          "Concert created as draft! You can publish it from the Drafts page.",
        );
        setTitle("");
        setDescription("");
        setLocation("");
        setEventDatetime("");
        setImageUrl("");
        setZones([{ name: "", capacity: "", price: "" }]);
      } else {
        setErrorMessage(data.error || "Failed to create concert");
      }
    } catch {
      setErrorMessage("Server error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Add New Concert</h1>
          <button
            onClick={() => navigate("/admin/drafts")}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            View Drafts
          </button>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Concert Information */}
          <div className="bg-white shadow-md rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Concert Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Arctic Monkeys Live in Bangkok"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Concert description..."
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
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
                    value={eventDatetime}
                    onChange={(e) => setEventDatetime(e.target.value)}
                    required
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Image URL (optional)
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Zones */}
          <div className="bg-white shadow-md rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-700">
                Ticket Zones
              </h2>
              <button
                type="button"
                onClick={addZoneRow}
                className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition"
              >
                + Add Zone
              </button>
            </div>

            <div className="space-y-3">
              {zones.map((zone, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={zone.name}
                    onChange={(e) => updateZone(index, "name", e.target.value)}
                    placeholder="Zone name (e.g. VIP)"
                    className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={zone.capacity}
                    onChange={(e) =>
                      updateZone(index, "capacity", e.target.value)
                    }
                    placeholder="Capacity"
                    className="w-28 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={zone.price}
                    onChange={(e) => updateZone(index, "price", e.target.value)}
                    placeholder="Price"
                    className="w-28 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {zones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeZoneRow(index)}
                      className="text-red-500 hover:text-red-700 text-lg font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Create Concert (as Draft)
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddConcertPage;
