import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaExclamationTriangle, FaPhone } from "react-icons/fa";
import { MdEmail, MdLocationOn, MdAccessTime, MdSend } from "react-icons/md";

// Import the proxy-based contact service
import { submitContactForm } from "../services/contactServiceProxy";
// Import Telegram notification service
import { sendTelegramNotification } from "../services/telegramService";

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
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
          {icon}
        </div>
      )}
      <InputComponent
        type={type}
        name={name}
        placeholder={placeholder}
        className={`w-full py-3 px-4 ${icon ? "pl-12" : "px-4"} border-2 ${
          error
            ? "border-red-400 focus:border-red-500"
            : "border-gray-300 dark:border-gray-600 focus:border-primary"
        }
                   rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                   focus:outline-none focus:ring-4
                   ${error ? "focus:ring-red-100 dark:focus:ring-red-900/30" : "focus:ring-primary/10"}
                   transition-all duration-300 ease-in-out
                   shadow-sm hover:shadow-md
                   ${type === "textarea" ? "min-h-32 resize-none" : ""}`}
        value={value}
        onChange={onChange}
        required={required}
        whileFocus={{ scale: 1.005 }}
      />
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-red-500 text-sm mt-2 ml-1 flex items-center gap-1"
          >
            <FaExclamationTriangle className="text-xs" />
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
  const [error, setError] = useState(null); // General form error message

  // Validate form on input change for touched fields
  useEffect(() => {
    const validateForm = () => {
      const newErrors = {};

      Object.keys(touched).forEach((field) => {
        if (touched[field]) {
          const error = validateField(field, formState[field]);
          if (error) {
            newErrors[field] = error;
          }
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
        if (error) {
          formErrors[field] = error;
        }
      }
    });

    setErrors(formErrors);

    // If no errors, submit the form
    if (Object.keys(formErrors).length === 0) {
      setIsSubmitting(true);

      let timer;
      try {
        // Submit to Firebase using REST API service
        await submitContactForm(formState);

        // Send Telegram notification (non-blocking - don't wait for it)
        sendTelegramNotification(formState).catch((telegramError) => {
          // Log telegram error only in development, but don't fail the form submission
          if (process.env.NODE_ENV !== "production") {
            console.warn(
              "Failed to send Telegram notification:",
              telegramError
            );
          }
        });

        // Only log in development
        if (process.env.NODE_ENV !== "production") {
          if (process.env.NODE_ENV === "development") {
            if (process.env.NODE_ENV === "development") {
              console.log("Form submitted successfully:", formState);
            }
          }
        }

        // Show success message
        setSubmitStatus("success");

        // Reset form after 3 seconds
        timer = setTimeout(() => {
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
      } catch (error) {
        // Only log detailed error in development
        if (process.env.NODE_ENV !== "production") {
          console.error("Error submitting form:", error);
        }

        // Show specific error message if available
        if (
          error.message &&
          error.message !== "Failed to submit contact form"
        ) {
          setError(error.message);
        }

        setSubmitStatus("error");
        setIsSubmitting(false);
      }

      // Return cleanup function
      return () => {
        if (timer) {
          clearTimeout(timer);
        }
      };
    }
  };

  // Form submission status message
  const StatusMessage = () => {
    if (!submitStatus) {
      return null;
    }

    return (
      <motion.div
        className={`mt-6 p-4 rounded-xl ${
          submitStatus === "success"
            ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-2 border-green-200 dark:border-green-700"
            : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-2 border-red-200 dark:border-red-700"
        }`}
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: "spring", duration: 0.4 }}
      >
        <div className="flex items-start gap-3">
          {submitStatus === "success" ? (
            <>
              <FaCheckCircle className="mt-0.5 text-green-500 dark:text-green-400 text-xl flex-shrink-0" />
              <div>
                <p className="font-semibold mb-1">Message sent successfully!</p>
                <p className="text-sm opacity-90">
                  Thank you for reaching out. We'll get back to you within 24
                  hours.
                </p>
              </div>
            </>
          ) : (
            <>
              <FaExclamationTriangle className="mt-0.5 text-red-500 dark:text-red-400 text-xl flex-shrink-0" />
              <div>
                <p className="font-semibold mb-1">Oops! Something went wrong</p>
                <p className="text-sm opacity-90">
                  {error ||
                    "There was an error sending your message. Please try again or contact us directly at urtechy000@gmail.com."}
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      className="w-full lg:w-1/2 p-6 lg:p-8"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header with enhanced gradient */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
          <span className="bg-gradient-to-r from-primary via-primary-dark to-secondary bg-clip-text text-transparent drop-shadow-sm">
            Let's Start a Conversation
          </span>
        </h1>

        <motion.div
          className="h-1.5 w-32 bg-gradient-to-r from-primary to-secondary rounded-full mt-4 shadow-lg shadow-primary/20"
          initial={{ width: 0 }}
          animate={{ width: "8rem" }}
          transition={{ duration: 0.6, delay: 0.3 }}
        />

        <p className="text-gray-700 dark:text-gray-200 mt-6 text-base md:text-lg leading-relaxed font-medium">
          Have questions about our blog or looking to collaborate? We're here to
          help! Reach out for any inquiries, content suggestions, or partnership
          opportunities.
        </p>
      </motion.div>

      {/* Form Container with glass morphism effect */}
      <motion.div
        className="mt-8 bg-white dark:bg-gray-800 p-6 lg:p-8 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <motion.div
            className="p-3 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <MdSend className="text-white text-2xl" />
          </motion.div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              Send us a Message
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
              We'll respond within 24 hours
            </p>
          </div>
        </div>

        <AnimatePresence>{submitStatus && <StatusMessage />}</AnimatePresence>

        <motion.form
          className="mt-6 space-y-5"
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
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
                required
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
                required
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
            required
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
              className="w-full py-3 px-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary appearance-none transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
              value={formState.subject}
              onChange={handleChange}
              whileFocus={{ scale: 1.005 }}
            >
              <option value="" className="text-gray-500 dark:text-gray-400">
                Choose message subject
              </option>
              <option value="inquiry" className="text-gray-900 dark:text-white">
                General Inquiry
              </option>
              <option
                value="feedback"
                className="text-gray-900 dark:text-white"
              >
                Feedback
              </option>
              <option
                value="partnership"
                className="text-gray-900 dark:text-white"
              >
                Partnership Opportunity
              </option>
              <option value="content" className="text-gray-900 dark:text-white">
                Content Suggestion
              </option>
            </motion.select>
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-500 dark:text-gray-400"
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
            required
          />

          <motion.button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl flex items-center justify-center font-semibold text-lg transition-all duration-300 shadow-lg
                      ${
                        isSubmitting
                          ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500"
                          : "bg-gradient-to-r from-primary via-primary-dark to-secondary text-white hover:shadow-2xl hover:shadow-primary/30 active:scale-[0.98]"
                      }`}
            whileHover={
              !isSubmitting
                ? {
                    scale: 1.01,
                    y: -2,
                  }
                : {}
            }
            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-3">
                <svg
                  className="animate-spin h-5 w-5 text-gray-600"
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
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Sending...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>Send Message</span>
                <MdSend className="text-xl" />
              </div>
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
      text: "support@urtechy.com",
      link: "mailto:support@urtechy.com",
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
      className="w-full lg:w-1/2 p-6 lg:p-8"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="sticky top-8">
        <motion.div
          className="bg-gradient-to-br from-primary via-primary-dark to-secondary text-white rounded-3xl shadow-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Logo Section */}
          <motion.div
            className="flex justify-center pt-8 pb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.div
              className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl"
              whileHover={{ scale: 1.1, rotate: 10 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-black text-3xl">
                uT
              </span>
            </motion.div>
          </motion.div>

          {/* Image Container */}
          <motion.div
            className="px-8 pb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <motion.div
              className="w-full aspect-square bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl overflow-hidden border-4 border-white/20"
              whileHover={{ scale: 1.02 }}
            >
              <motion.img
                src="/iconified/apple-touch-icon-180x180.png"
                alt="urTechy Blogs Logo"
                className="w-3/4 h-3/4 object-contain"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 200 }}
              />
            </motion.div>
          </motion.div>

          {/* Text Section */}
          <motion.div
            className="px-8 pb-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-3">
              We're Here to Help
            </h3>
            <div className="h-1 w-24 bg-white/40 rounded-full mx-auto mb-4" />
            <p className="text-white/80 text-sm md:text-base">
              Our team is dedicated to providing you with the best support and
              answering all your questions
            </p>
          </motion.div>

          {/* Contact Details */}
          <motion.div
            className="px-8 pb-8 space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            {contactDetails.map((detail, index) => (
              <motion.div
                key={index}
                className={`flex items-center bg-white/10 backdrop-blur-md p-4 rounded-xl text-white border-l-4 border-white/40 shadow-lg hover:bg-white/20 transition-all duration-300 ${
                  detail.link ? "cursor-pointer" : ""
                }`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                whileHover={{
                  x: 5,
                  borderLeftWidth: 6,
                  transition: { duration: 0.2 },
                }}
                onClick={() =>
                  detail.link && window.open(detail.link, "_blank")
                }
              >
                <div className="mr-4 bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  {detail.icon}
                </div>
                <span className="text-sm md:text-base font-medium flex-1">
                  {detail.text}
                </span>
                {detail.link && (
                  <motion.div
                    className="ml-2 text-white/80"
                    whileHover={{ scale: 1.3, x: 3 }}
                  >
                    <svg
                      className="w-5 h-5"
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

          {/* Social Media Section */}
          <motion.div
            className="px-8 pb-8 pt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            <p className="text-center text-white/70 text-sm mb-4">
              Follow us on social media
            </p>
            <div className="flex justify-center gap-4">
              <motion.a
                href="https://x.com/Onlyblogs_"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 backdrop-blur-md p-4 rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20"
                whileHover={{ scale: 1.15, rotate: 5, y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </motion.a>
              <motion.a
                href="mailto:urtechy000@gmail.com"
                className="bg-white/10 backdrop-blur-md p-4 rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20"
                whileHover={{ scale: 1.15, rotate: -5, y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  className="w-6 h-6 text-white"
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
            </div>
          </motion.div>
        </motion.div>
      </div>
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
        className="py-12 px-4 sm:px-6 lg:px-8 min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Page Header */}
        <motion.div
          className="max-w-7xl mx-auto text-center mb-16"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-primary via-primary-dark to-secondary bg-clip-text text-transparent drop-shadow-sm">
                Contact Us
              </span>
            </h1>
          </motion.div>

          <motion.div
            className="h-1.5 w-32 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto mb-6 shadow-lg shadow-primary/20"
            initial={{ width: 0 }}
            animate={{ width: "8rem" }}
            transition={{ duration: 0.6, delay: 0.4 }}
          />

          <motion.p
            className="mt-4 max-w-2xl mx-auto text-lg text-gray-700 dark:text-gray-200 leading-relaxed font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            We'd love to hear from you! Send us a message and we'll respond as
            soon as possible.
          </motion.p>
        </motion.div>

        {/* Contact Form and Info Container */}
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-center items-stretch gap-8 lg:gap-10">
            <ContactForm />
            <ContactInfo />
          </div>
        </div>

        {/* Footer Message */}
        <motion.div
          className="max-w-7xl mx-auto mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
            <p className="text-gray-700 dark:text-gray-200 text-base mb-2 font-medium">
              <span className="font-bold text-primary">
                Thank you for visiting urTechy Blogs.
              </span>
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              We appreciate your interest and look forward to connecting with
              you!
            </p>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default Contact;
