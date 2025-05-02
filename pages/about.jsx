import React, { useState } from "react";
// import Footer from "../components/footer/Footer";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faClipboard } from "@fortawesome/free-solid-svg-icons";
import { faTwitter } from "@fortawesome/free-brands-svg-icons"; // Import the Twitter icon

const About = () => {
  const [showEmail, setShowEmail] = useState(false);

  return (
    <section className="bg-white dark:bg-gray-900 dark:text-gray-100">
      <div className="container mx-auto flex flex-col items-center px-4 py-16 text-center md:py-32 md:px-10 lg:px-32 xl:max-w-3xl">
        <h1 className="text-4xl font-bold leading-none sm:text-5xl">
          Welcome To{" "}
          <span className="text-indigo-500 dark:text-indigo-400">
            urTechy Blogs
          </span>
        </h1>

        <p className="px-8 mt-8 mb-6 text-lg leading-relaxed text-gray-700 dark:text-gray-300">
          urTechy Blogs is a professional blog platform. Here we provide you
          with interesting content that you will like very much. We're dedicated
          to offering you the best of blogs, with a focus on dependability and
          quality. We're working to turn our passion for blogging into a booming
          online website. We hope you enjoy our blog as much as we enjoy
          offering it to you.
        </p>

        <p className="px-8 mb-8 text-lg text-gray-700 dark:text-gray-300">
          We will keep posting important content on our website for all of you.
          Please give your support and love.
        </p>

        <p className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-200">
          Thanks for visiting our site!
        </p>

        <div className="flex space-x-4">
          <button
            onClick={() => setShowEmail(!showEmail)}
            className="px-4 py-2 flex items-center justify-center text-lg font-semibold rounded bg-indigo-500 text-white hover:bg-indigo-600 transition duration-150 ease-in-out"
          >
            <FontAwesomeIcon icon={faEnvelope} className="h-6 w-6" />
          </button>

          {showEmail && (
            <div className="flex space-x-4">
              <button
                onClick={() => window.open("mailto:shanuvatika@gmail.com")}
                className="px-4 py-2 flex items-center justify-center text-lg font-semibold rounded bg-indigo-500 text-white hover:bg-indigo-600 transition duration-150 ease-in-out"
              >
                Send Mail
              </button>
              <button
                className="px-4 py-2 flex items-center justify-center text-lg font-semibold rounded bg-indigo-500 text-white hover:bg-indigo-600 transition duration-150 ease-in-out"
                onClick={() =>
                  navigator.clipboard.writeText("shanuvatika@gmail.com")
                }
              >
                <FontAwesomeIcon icon={faClipboard} className="h-6 w-6" />
              </button>
            </div>
          )}

          <a
            href="https://x.com/Onlyblogs_"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 flex items-center justify-center text-lg font-semibold rounded bg-indigo-500 text-white hover:bg-indigo-600 transition duration-150 ease-in-out"
          >
            <FontAwesomeIcon icon={faTwitter} className="h-6 w-6" />{" "}
            {/* Use the Twitter icon */}
          </a>
        </div>
      </div>

      <section className="py-6 bg-gray-800 dark:bg-gray-700">
        <div className="container mx-auto flex flex-col items-center justify-center p-4 space-y-8 md:p-10 lg:space-y-0 lg:flex-row lg:justify-between">
          <h1 className="text-3xl font-semibold leading-tight text-center text-gray-200 lg:text-left">
            Got any queries?
          </h1>
          <Link href="/contact">
            <button className="px-8 py-3 text-lg font-semibold rounded bg-indigo-500 text-white transition duration-150 ease-in-out hover:bg-indigo-600">
              Contact
            </button>
          </Link>
        </div>
      </section>
    </section>
  );
};

export default About;
