import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { FaCheckCircle, FaExclamationTriangle, FaPhone } from "react-icons/fa";
import { MdEmail, MdLocationOn, MdAccessTime, MdSend } from "react-icons/md";
// Import the proxy-based contact service
import { submitContactForm } from "../services/contactServiceProxy";

// Form field validation
const validateField = (name, value) => {
  switch (name) {
    case "firstName":
    case "lastName":
      return value.trim().length >= 2 ? "" : "Must be at least 2 characters";
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ? ""
        : "Please enter a valid email";
    case "message":
      return value.trim().length >= 10
        ? ""
        : "Message must be at least 10 characters";
    default:
      return "";
  }
};

// Input field component with validation
const FormField = ({
  type,
  name,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  icon = null,
}) => {
  const InputComponent = type === "textarea" ? motion.textarea : motion.input;

  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <InputComponent
        type={type}
        name={name}
        placeholder={placeholder}
        className={`w-full p-2 ${icon ? "pl-10" : "pl-3"} border ${
          error ? "border-red-500" : "border-gray-300"
        }
                   rounded-md bg-gray-50 focus:outline-none focus:ring-2
                   ${error ? "focus:ring-red-500" : "focus:ring-urtechy-red"}
                   transition-all duration-200 ease-in-out
                   ${type === "textarea" ? "h-32 resize-none" : ""}`}
        value={value}
        onChange={onChange}
        required={required}
        whileFocus={{ scale: 1.01 }}
      />
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-red-500 text-xs mt-1 ml-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

// ContactForm Component
const ContactForm = () => {
  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null

  // Validate form on input change for touched fields
  useEffect(() => {
    const validateForm = () => {
      const newErrors = {};

      Object.keys(touched).forEach((field) => {
        if (touched[field]) {
          const error = validateField(field, formState[field]);
          if (error) newErrors[field] = error;
        }
      });

      setErrors(newErrors);
    };

    validateForm();
  }, [formState, touched]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched to show validation errors
    const allTouched = Object.keys(formState).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Validate all fields
    const formErrors = {};
    Object.keys(formState).forEach((field) => {
      if (
        field === "firstName" ||
        field === "lastName" ||
        field === "email" ||
        field === "message"
      ) {
        const error = validateField(field, formState[field]);
        if (error) formErrors[field] = error;
      }
    });

    setErrors(formErrors);

    // If no errors, submit the form
    if (Object.keys(formErrors).length === 0) {
      setIsSubmitting(true);

      try {
        // Submit to Firebase using REST API service
        await submitContactForm(formState);

        // Only log in development
        if (process.env.NODE_ENV !== "production") {
          console.log("Form submitted successfully:", formState);
        }

        // Show success message
        setSubmitStatus("success");

        // Reset form after 3 seconds
        const timer = setTimeout(() => {
          setFormState({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            subject: "",
            message: "",
          });
          setTouched({});
          setSubmitStatus(null);
          setIsSubmitting(false);
        }, 3000);

        // Clean up timer if component unmounts
        return () => clearTimeout(timer);
      } catch (error) {
        // Only log detailed error in development
        if (process.env.NODE_ENV !== "production") {
          console.error("Error submitting form:", error);
        }
        setSubmitStatus("error");
        setIsSubmitting(false);
      }
    }
  };

  // Form submission status message
  const StatusMessage = () => {
    if (!submitStatus) return null;

    return (
      <motion.div
        className={`mt-4 p-3 rounded-md ${
          submitStatus === "success"
            ? "bg-green-50 text-green-800"
            : "bg-red-50 text-red-800"
        }`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <div className="flex items-center">
          {submitStatus === "success" ? (
            <>
              <FaCheckCircle className="mr-2 text-green-500" />
              <span>
                Thank you! Your message has been sent successfully and stored in
                our database.
              </span>
            </>
          ) : (
            <>
              <FaExclamationTriangle className="mr-2 text-red-500" />
              <span>
                There was an error saving your message to our database. Please
                try again or contact us directly at urtechy000@gmail.com.
              </span>
            </>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      className="w-full md:w-1/2 p-4"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header with gradient text */}
      <motion.h1
        className="text-3xl md:text-4xl font-bold"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <span className="bg-gradient-to-r from-urtechy-red to-urtechy-orange bg-clip-text text-transparent">
          Get in Touch with Us
        </span>
      </motion.h1>

      <motion.div
        className="h-1 w-32 bg-gradient-to-r from-urtechy-red to-urtechy-orange rounded-full mt-2"
        initial={{ width: 0 }}
        animate={{ width: "8rem" }}
        transition={{ duration: 0.5, delay: 0.3 }}
      />

      <motion.p
        className="text-gray-600 mt-4 text-sm md:text-base"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        Have questions about our blog or looking to collaborate? We're here to
        help! Reach out for any inquiries, content suggestions, or partnership
        opportunities.
      </motion.p>

      {/* Form Container with enhanced styling */}
      <motion.div
        className="mt-6 bg-white p-6 rounded-lg shadow-lg border border-gray-100"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <motion.h2
          className="text-xl md:text-2xl font-bold text-[#1A3C34]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          Have Questions? We're Just a Message Away!
        </motion.h2>

        <motion.p
          className="text-gray-600 mt-2 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          Fill out the form below, and one of our team members will get back to
          you shortly. Your message will be securely stored in our Firebase
          database.
        </motion.p>

        <AnimatePresence>{submitStatus && <StatusMessage />}</AnimatePresence>

        <motion.form
          className="mt-4 space-y-4"
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full">
              <FormField
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formState.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.firstName}
                required={true}
              />
            </div>
            <div className="w-full">
              <FormField
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formState.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.lastName}
                required={true}
              />
            </div>
          </div>

          <FormField
            type="email"
            name="email"
            placeholder="you@gmail.com"
            value={formState.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
            required={true}
            icon={<MdEmail />}
          />

          <FormField
            type="tel"
            name="phone"
            placeholder="+1 (800) 555-1234"
            value={formState.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            icon={<FaPhone />}
          />

          <div className="relative">
            <motion.select
              name="subject"
              className="w-full p-2 pl-3 border border-gray-300 rounded-md bg-gray-50 text-gray-500 focus:outline-none focus:ring-2 focus:ring-urtechy-red appearance-none"
              value={formState.subject}
              onChange={handleChange}
              whileFocus={{ scale: 1.01 }}
            >
              <option value="">Choose message subject</option>
              <option value="inquiry">General Inquiry</option>
              <option value="feedback">Feedback</option>
              <option value="partnership">Partnership Opportunity</option>
              <option value="content">Content Suggestion</option>
            </motion.select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          <FormField
            type="textarea"
            name="message"
            placeholder="Leave us a message..."
            value={formState.message}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.message}
            required={true}
          />

          <motion.button
            type="submit"
            disabled={isSubmitting}
            className={`w-full p-3 rounded-md flex items-center justify-center transition-all duration-300
                      ${
                        isSubmitting
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-urtechy-red to-urtechy-orange text-white hover:shadow-lg"
                      }`}
            whileHover={
              !isSubmitting
                ? {
                    scale: 1.02,
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }
                : {}
            }
            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Sending...
              </div>
            ) : (
              <>
                Send Message
                <MdSend className="ml-2 text-lg" />
              </>
            )}
          </motion.button>
        </motion.form>
      </motion.div>
    </motion.div>
  );
};

// ContactInfo Component
const ContactInfo = () => {
  const contactDetails = [
    {
      icon: <MdEmail className="text-urtechy-red text-xl" />,
      text: "urtechy000@gmail.com",
      link: "mailto:urtechy000@gmail.com",
    },
    {
      icon: <MdLocationOn className="text-urtechy-red text-xl" />,
      text: "urTechy Blogs, Online",
      link: null,
    },
    {
      icon: <MdAccessTime className="text-urtechy-red text-xl" />,
      text: "Mon-Fri 9:00 AM - 6:00 PM (IST)",
      link: null,
    },
  ];

  return (
    <motion.div
      className="w-full md:w-1/2 p-4 bg-gradient-to-br from-[#4A7C6D] to-[#1A3C34] text-white rounded-lg mt-6 md:mt-0 shadow-xl"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Logo Placeholder */}
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <motion.div
          className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <span className="bg-gradient-to-r from-urtechy-red to-urtechy-orange bg-clip-text text-transparent font-bold text-2xl">
            uT
          </span>
        </motion.div>
      </motion.div>

      {/* Image Container with enhanced styling */}
      <motion.div
        className="mt-6 flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <motion.div
          className="w-48 md:w-64 h-48 md:h-64 bg-[#E0ECE8] rounded-lg flex items-center justify-center shadow-lg overflow-hidden relative"
          whileHover={{ scale: 1.02 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-urtechy-red/20 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />
          <motion.img
            src="/iconified/apple-touch-icon-180x180.png"
            alt="urTechy Blogs Logo"
            className="w-32 h-32 object-contain relative z-10"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 200 }}
          />
        </motion.div>
      </motion.div>

      {/* Text Overlay with enhanced styling */}
      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <motion.h3
          className="text-xl md:text-2xl font-bold"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Our team will always help you
        </motion.h3>
        <motion.div
          className="h-1 w-24 bg-[#E0ECE8] rounded-full mt-2 mx-auto"
          initial={{ width: 0 }}
          animate={{ width: "6rem" }}
          transition={{ duration: 0.5, delay: 0.7 }}
        />
      </motion.div>

      {/* Contact Details with enhanced styling */}
      <motion.div
        className="mt-6 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        {contactDetails.map((detail, index) => (
          <motion.div
            key={index}
            className={`flex items-center bg-white/10 backdrop-blur-sm p-3 rounded-lg text-white border-l-4 border-urtechy-red shadow-md ${
              detail.link ? "cursor-pointer" : ""
            }`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
            whileHover={{
              x: 5,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              transition: { duration: 0.2 },
            }}
            onClick={() => detail.link && window.open(detail.link, "_blank")}
          >
            <div className="mr-3 bg-white/10 p-2 rounded-full">
              {detail.icon}
            </div>
            <span className="text-sm md:text-base">{detail.text}</span>
            {detail.link && (
              <motion.div
                className="ml-auto text-white/70"
                whileHover={{ scale: 1.2 }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </motion.div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Social Media Icons - Optional */}
      <motion.div
        className="mt-8 flex justify-center space-x-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.3 }}
      >
        <motion.a
          href="https://x.com/Onlyblogs_"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors"
          whileHover={{ scale: 1.2, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg
            className="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
          </svg>
        </motion.a>
        <motion.a
          href="mailto:urtechy000@gmail.com"
          className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors"
          whileHover={{ scale: 1.2, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </motion.a>
      </motion.div>
    </motion.div>
  );
};

// Main Contact Component
const Contact = () => {
  return (
    <>
      <Head>
        <title>Contact Us | urTechy Blogs</title>
        <meta
          name="description"
          content="Get in touch with the urTechy Blogs team. We're here to answer your questions and help with any inquiries."
        />
        {/* Open Graph tags for better social sharing */}
        <meta property="og:title" content="Contact Us | urTechy Blogs" />
        <meta
          property="og:description"
          content="Get in touch with the urTechy Blogs team. We're here to answer your questions and help with any inquiries."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://blog.urtechy.com/contact" />
        <meta
          property="og:image"
          content="https://blog.urtechy.com/iconified/apple-touch-icon-180x180.png"
        />
      </Head>

      <motion.div
        className="py-8 px-4 sm:px-6 lg:px-8 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Page Header */}
        <motion.div
          className="max-w-7xl mx-auto text-center mb-12"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            <span className="block">Contact Us</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            We'd love to hear from you! Send us a message and we'll respond as
            soon as possible.
          </p>
          <motion.div
            className="h-1 w-24 bg-gradient-to-r from-urtechy-red to-urtechy-orange rounded-full mt-4 mx-auto"
            initial={{ width: 0 }}
            animate={{ width: "6rem" }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />
        </motion.div>

        {/* Contact Form and Info Container */}
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-center items-start gap-6 md:gap-8">
            <ContactForm />
            <ContactInfo />
          </div>
        </div>

        {/* Map or Additional Info - Optional */}
        <motion.div
          className="max-w-7xl mx-auto mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <p className="text-gray-500 text-sm">
            Thank you for visiting urTechy Blogs. We appreciate your interest
            and look forward to connecting with you!
          </p>
        </motion.div>
      </motion.div>
    </>
  );
};

export default Contact;
