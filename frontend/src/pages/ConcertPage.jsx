import React from "react";
import { useNavigate } from "react-router-dom";

function ConcertPage() {
  const navigate = useNavigate();

  // mock data (ภายหลังเปลี่ยนเป็น data จาก Flask API ได้)
  const concerts = [
    {
      id: 1,
      name: "Arctic Monkeys Live in Bangkok",
      date: "10 June 2026",
      location: "Impact Arena",
      image: "https://picsum.photos/400/250?random=1",
      status: "available",
    },
    {
      id: 2,
      name: "Coldplay Music of the Spheres",
      date: "15 July 2026",
      location: "Rajamangala Stadium",
      image: "https://picsum.photos/400/250?random=2",
      status: "available",
    },
    {
      id: 3,
      name: "Taylor Swift Eras Tour",
      date: "1 Jan 2025",
      location: "National Stadium",
      image: "https://picsum.photos/400/250?random=3",
      status: "ended",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Concerts
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        
        {concerts.map((concert) => (
          <div
            key={concert.id}
            className={`rounded-xl shadow-md overflow-hidden bg-white
            ${
              concert.status === "ended"
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