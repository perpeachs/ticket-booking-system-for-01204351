import React from "react";
import { Link } from "react-router-dom";
import bg from "../assets/bg-homepage.avif";

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section with Background */}
      <section className="relative h-[500px] flex items-center justify-center">

        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              `url(${bg})`,
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/* Content */}
        <div className="relative z-10 text-center px-6">

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            KU Ticket
          </h1>

          <p className="text-gray-200 text-lg md:text-xl mb-8">
            Discover concerts in Kasetsart University, book tickets, and enjoy your favorite artists.
          </p>

    <Link
      to="/concert"
      className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition"
    >
      Browse Concerts
    </Link>

  </div>

</section>

      {/* Feature Section */}
      <section className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-6">
        
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
          <h2 className="text-xl font-semibold mb-2">
            Find Concerts
          </h2>
          <p className="text-gray-600">
            Explore concerts from your favorite artists.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
          <h2 className="text-xl font-semibold mb-2">
            Easy Booking
          </h2>
          <p className="text-gray-600">
            Book tickets quickly and securely.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
          <h2 className="text-xl font-semibold mb-2">
            Manage Profile
          </h2>
          <p className="text-gray-600">
            View and manage your bookings easily.
          </p>
        </div>

      </section>

    </div>
  );
}

export default HomePage;