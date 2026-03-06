import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-white mb-3">KU Ticket</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your one-stop platform for discovering and booking concert tickets
              at Kasetsart University. Enjoy your favorite artists with ease.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/home"
                  className="text-gray-400 hover:text-white transition text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/concert"
                  className="text-gray-400 hover:text-white transition text-sm"
                >
                  Concerts
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-gray-400 hover:text-white transition text-sm"
                >
                  My Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-400 hover:text-white transition text-sm"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>
          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Contact
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <span>📍</span>
                <span>Kasetsart University, Bangkok, Thailand</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📧</span>
                <span>support@kuticket.com</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span>
                <span>+66 2-797-0999</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} KU Ticket. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm">
            Made by Computer Engineering, Kasetsart University.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
