import React from "react";
import Link from "next/link";
import {
  FaInstagram,
  FaPinterest,
  FaFacebook,
  FaXTwitter,
} from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="dark:text-coolGray-50 bg-black mt-4 rounded">
      <div className="container flex flex-col p-4 mx-auto md:p-8 lg:flex-row divide-coolGray-400">
        <ul className="self-center py-6 space-y-4 text-center sm:flex sm:space-y-0 sm:justify-around sm:space-x-4 lg:flex-1 lg:justify-start">
          <li className="text-white hover:text-blue-400">
            <Link href="/about">About</Link>
          </li>
          <li className="text-white hover:text-blue-400">
            <Link href="/terms">Term & Conditions</Link>
          </li>
          <li className="text-white hover:text-blue-400">
            <Link href="/contact">Contact</Link>
          </li>
        </ul>
        <div className="flex flex-col justify-center pt-6 lg:pt-0">
          <div className="flex justify-center space-x-4">
            <a
              href="https://www.instagram.com/lifepoem8/"
              title="Instagram"
              className="flex items-center justify-center w-8 h-8 rounded-full sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 transition-colors duration-300"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram className="w-4 h-4 text-white" />
            </a>
            <a
              href="https://in.pinterest.com/smattyvaibhav/key-to-success/"
              title="Pinterest"
              className="flex items-center justify-center w-8 h-8 rounded-full sm:w-10 sm:h-10 bg-red-600 hover:bg-red-700 transition-colors duration-300"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Pinterest"
            >
              <FaPinterest className="w-4 h-4 text-white" />
            </a>
            <a
              href="https://x.com/Onlyblogs_"
              title="Twitter"
              className="flex items-center justify-center w-8 h-8 rounded-full sm:w-10 sm:h-10 bg-black hover:bg-gray-800 transition-colors duration-300"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <FaXTwitter className="w-4 h-4 text-white" />
            </a>
            <a
              href="https://www.facebook.com/shanuv00000"
              title="Facebook"
              className="flex items-center justify-center w-8 h-8 rounded-full sm:w-10 sm:h-10 bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FaFacebook className="w-4 h-4 text-white" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
