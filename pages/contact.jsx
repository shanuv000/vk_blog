import React, { useState } from "react";
import Footer from "../components/footer/Footer";

const Contact = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", { firstName, lastName, email, message });
    setFirstName("");
    setLastName("");
    setEmail("");
    setMessage("");
  };

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-transparent min-h-screen flex items-center justify-center">
        <div className="w-full max-w-lg bg-white bg-transparent shadow-lg rounded-lg p-8">
          <h2 className="text-3xl font-extrabold text-center text-gray-800 dark:text-gray-100 mb-8">
            Get in Touch
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label
                  htmlFor="first-name"
                  className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                >
                  First Name
                </label>
                <input
                  id="first-name"
                  type="text"
                  placeholder="Enter your first name"
                  className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 dark:text-black-500 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-150 ease-in-out"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="last-name"
                  className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                >
                  Last Name
                </label>
                <input
                  id="last-name"
                  type="text"
                  placeholder="Enter your last name"
                  className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 dark:text-black-500 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-150 ease-in-out"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email address"
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 dark:text-black-500 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-150 ease-in-out"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="message"
                className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
              >
                Message
              </label>
              <textarea
                id="message"
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 dark:text-black-500 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-150 ease-in-out h-48 resize-none"
                placeholder="Enter your message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="flex items-center justify-center">
              <button
                className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transition duration-150 ease-in-out"
                type="submit"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* <Footer /> */}
    </>
  );
};

export default Contact;
