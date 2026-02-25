import React from "react";

function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-4xl mx-auto px-6 py-16">

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          About Us
        </h1>

        {/* Card */}
        <div className="bg-white shadow-md rounded-xl p-8 space-y-6">

          <p className="text-gray-700 leading-relaxed">
            This website is created by a Computer Engineering student from the Faculty of Engineering as part of a course requirement :{" "}
            <span className="font-semibold text-blue-600">
              Database and System
            </span>
          </p>

          <p className="text-gray-700 leading-relaxed">
            The purpose of this website is to study and develop a Full-Stack Web Application, covering Frontend, Backend, and Database, as well as system design and integration with multiple types of databases.
          </p>

          {/* Tech Stack */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-3">
              Tech Stack
            </h2>

            <div className="flex flex-wrap gap-3">

              <span className="bg-blue-100 text-blue-500 px-3 py-1 rounded-full text-sm font-semibold">
                React
              </span>

              <span className="bg-cyan-100 text-cyan-500 px-3 py-1 rounded-full text-sm font-semibold">
                TailwindCSS
              </span>

              <span className="bg-green-100 text-green-500 px-3 py-1 rounded-full text-sm font-semibold">
                Flask
              </span>

              <span className="bg-orange-100 text-orange-500 px-3 py-1 rounded-full text-sm font-semibold">
                MySQL
              </span>

              <span className="bg-green-100 text-green-500 px-3 py-1 rounded-full text-sm font-semibold">
                MongoDB
              </span>

            </div>
          </div>

          {/* Thank you */}
          <div className="border-t pt-6">
            <p className="text-gray-700 leading-relaxed">
              We appreciate everyone who visited our website.
              This website is part of our learning and developing skills in Software Development,
              Database Design, and System Integration.

            </p>
            <p className="text-gray-700 leading-relaxed">
              ** If there are any errors or mistakes, I would like to sincerely apologize. 🙏🏼 **
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default AboutPage;


