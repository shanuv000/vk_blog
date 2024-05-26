import React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faPinterest,
  faTwitter,
  faFacebook,
  faGoogle,
} from "@fortawesome/free-brands-svg-icons";

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
              className="flex items-center justify-center w-8 h-8 rounded-full sm:w-10 sm:h-10 dark:bg-violet-400 dark:text-coolGray-900"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon icon={faInstagram} className="w-4 h-4" />
            </a>
            <a
              href="https://in.pinterest.com/smattyvaibhav/key-to-success/"
              title="Pinterest"
              className="flex items-center justify-center w-8 h-8 rounded-full sm:w-10 sm:h-10 dark:bg-violet-400 dark:text-coolGray-900"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon icon={faPinterest} className="w-4 h-4" />
            </a>
            <a
              href="https://x.com/Onlyblogs_"
              title="Twitter"
              className="flex items-center justify-center w-8 h-8 rounded-full sm:w-10 sm:h-10 dark:bg-violet-400 dark:text-coolGray-900"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon icon={faTwitter} className="w-4 h-4" />
            </a>
            <a
              href="https://www.facebook.com/shanuv00000"
              title="Facebook"
              className="flex items-center justify-center w-8 h-8 rounded-full sm:w-10 sm:h-10 dark:bg-violet-400 dark:text-coolGray-900"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon icon={faFacebook} className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
