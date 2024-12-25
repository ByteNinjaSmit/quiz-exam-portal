import React from "react";
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerStyle = {
    marginTop: 'auto',
    width: '100%',
  };

  return (
    <footer className="bg-gray-100 text-gray-600 py-8" style={footerStyle}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Quick Links Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                "Home",
                "About",
                "Contact",
                "FAQ",
                "Terms of Service",
                "Privacy Policy"
              ].map((link) => (
                <li key={link}>
                  <button
                    className="hover:text-gray-900 hover:underline transition duration-300"
                    onClick={() => console.log(`Navigate to ${link}`)}
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FaMapMarkerAlt className="text-blue-500" />
                <span>123 University Ave, Education City, ST 12345</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaPhone className="text-blue-500" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaEnvelope className="text-blue-500" />
                <span>info@universityquiz.edu</span>
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              {[
                { icon: FaFacebook, label: "Facebook" },
                { icon: FaTwitter, label: "Twitter" },
                { icon: FaInstagram, label: "Instagram" },
                { icon: FaLinkedin, label: "LinkedIn" },
                { icon: FaYoutube, label: "YouTube" }
              ].map((social) => (
                <button
                  key={social.label}
                  className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-blue-50 transition duration-300"
                  onClick={() => console.log(`Navigate to ${social.label}`)}
                  aria-label={social.label}
                >
                  <social.icon className="text-xl text-blue-500" />
                </button>
              ))}
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Newsletter</h3>
            <p className="mb-4">Stay updated with our latest quizzes and news.</p>
            <div className="flex flex-col space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-sm font-bold">
            © {currentYear} ByteNinjaSmit Quiz App. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;