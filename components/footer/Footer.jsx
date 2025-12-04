import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaInstagram,
  FaPinterest,
  FaFacebook,
  FaXTwitter,
  FaDiscord,
} from "react-icons/fa6";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary mt-12 rounded-lg shadow-lg overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
          {/* Left side - Links */}
          <div className="flex flex-col space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex items-center mb-4"
            >
              <img
                src="/iconified/logo4.ico"
                alt="urTechy Logo"
                className="h-8 w-8 mr-2"
              />
              <h3 className="text-xl font-bold">
                <span className="text-primary">ur</span>
                <span className="text-primary-light">Techy</span>
                <span className="text-text-primary"> Blogs</span>
              </h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold mb-3 text-text-primary">
                Quick Links
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-text-secondary hover:text-primary transition-colors duration-200"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-text-secondary hover:text-primary transition-colors duration-200"
                  >
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-text-secondary hover:text-primary transition-colors duration-200"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Right side - Social & Copyright */}
          <div className="flex flex-col justify-between">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <h4 className="text-lg font-semibold mb-4 text-text-primary">
                Connect With Us
              </h4>
              <div className="flex space-x-4">
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  href="https://www.instagram.com/lifepoem8/"
                  title="Instagram"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 transition-colors duration-300 shadow-md"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <FaInstagram className="w-5 h-5 text-white" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  href="https://discord.gg/SquXBvz3Q"
                  title="Discord"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-[#5865F2] hover:bg-[#4752C4] transition-colors duration-300 shadow-md"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Discord"
                >
                  <FaDiscord className="w-5 h-5 text-white" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  href="https://in.pinterest.com/smattyvaibhav/key-to-success/"
                  title="Pinterest"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 transition-colors duration-300 shadow-md"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Pinterest"
                >
                  <FaPinterest className="w-5 h-5 text-white" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  href="https://x.com/Onlyblogs_"
                  title="Twitter"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-black hover:bg-gray-800 transition-colors duration-300 shadow-md"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                >
                  <FaXTwitter className="w-5 h-5 text-white" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  href="https://www.facebook.com/shanuv00000"
                  title="Facebook"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors duration-300 shadow-md"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <FaFacebook className="w-5 h-5 text-white" />
                </motion.a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-text-secondary text-sm"
            >
              <p>© {currentYear} urTechy Blogs. All rights reserved.</p>
              <p className="mt-2">Contact: info@urtechy.com</p>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
