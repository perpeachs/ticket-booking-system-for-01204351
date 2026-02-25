import React, { useState } from "react";
import { useLocation } from "react-router-dom";

function BookingPage() {
  const location = useLocation();
  const concert = location.state;

  const zones = [
    { name: "VIP", price: 5000 },
    { name: "A", price: 3500 },
    { name: "B", price: 2500 },
    { name: "C", price: 1500 },
  ];

  const [selectedZone, setSelectedZone] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">

      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl p-6">

        {/* Concert Info */}
        <h1 className="text-3xl font-bold mb-4">
          Booking Ticket
        </h1>

        <h2 className="text-xl mb-6 text-gray-700">
          {concert?.name}
        </h2>

        {/* Seat Map Image */}
        <img
          src="https://picsum.photos/600/300?random=10"
          alt="Seat Map"
          className="w-full rounded-lg mb-6"
        />

        {/* Zone Selection */}
        <div className="mb-6">

          <label className="block text-lg font-semibold mb-2">
            Select Zone
          </label>

          <select
            className="w-full border rounded-lg px-3 py-2"
            onChange={(e) =>
              setSelectedZone(
                zones.find((z) => z.name === e.target.value)
              )
            }
          >
            <option>Select Zone</option>

            {zones.map((zone) => (
              <option key={zone.name} value={zone.name}>
                {zone.name} - {zone.price} THB
              </option>
            ))}

          </select>

        </div>

        {/* Price Display */}
        {selectedZone && (
          <div className="mb-6 text-lg">
            Price:{" "}
            <span className="font-bold text-blue-600">
              {selectedZone.price} THB
            </span>
          </div>
        )}

        {/* Pay Button */}
        <button
          disabled={!selectedZone}
          className={`w-full py-3 rounded-lg text-white font-semibold
          ${
            selectedZone
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          onClick={() =>
            alert(
              `Payment successful for ${selectedZone.name} zone`
            )
          }
        >
          Pay Now
        </button>

      </div>

    </div>
  );
}

export default BookingPage;