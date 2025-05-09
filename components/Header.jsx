import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FaBars, FaTimes } from "react-icons/fa";
import { RiArrowDropDownLine } from "react-icons/ri";
import { IoMdArrowDropdown } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import { getDirectCategories } from "../services/direct-api";
import { useData } from "../store/HandleApiContext";

const Header = () => {
  // Use direct API for categories
  const [categories, setCategories] = useState([]);
  const { isLiveScore: isLive } = useData();

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await getDirectCategories();
        if (result && result.length > 0) {
          setCategories(result);
        } else {
          // Fallback to default categories if API returns empty
          setCategories([
            { name: "Web Development", slug: "web-dev" },
            { name: "Technology", slug: "technology" },
            { name: "Programming", slug: "programming" },
            { name: "Mobile Apps", slug: "mobile-apps" },
            { name: "UI/UX", slug: "ui-ux" },
          ]);
        }
      } catch (error) {
        console.error("Error fetching categories for header:", error);
        // Fallback to default categories on error
        setCategories([
          { name: "Web Development", slug: "web-dev" },
          { name: "Technology", slug: "technology" },
          { name: "Programming", slug: "programming" },
          { name: "Mobile Apps", slug: "mobile-apps" },
          { name: "UI/UX", slug: "ui-ux" },
        ]);
      }
    };

    fetchCategories();
  }, []);

  // Header visibility state
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdowns, setActiveDropdowns] = useState({
    desktop: null,
    mobile: null,
  });

  // Refs for dropdown handling
  const dropdownRefs = useRef({});

  // Dropdown data structure
  const dropdownData = {
    Blog:
      categories && categories.length > 0
        ? categories.map((category) => ({
            name: category.name.toUpperCase(),
            href: `/category/${category.slug}`,
          }))
        : [
            { name: "WEB DEVELOPMENT", href: "/category/web-dev" },
            { name: "TECHNOLOGY", href: "/category/technology" },
            { name: "PROGRAMMING", href: "/category/programming" },
            { name: "MOBILE APPS", href: "/category/mobile-apps" },
            { name: "UI/UX", href: "/category/ui-ux" },
          ],
  };

  // Handle header visibility on scroll
  const controlHeader = () => {
    if (typeof window !== "undefined") {
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(window.scrollY);
    }
  };

  // Handle clicks outside of dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      const activeDropdown = activeDropdowns.desktop;
      if (
        activeDropdown &&
        dropdownRefs.current[activeDropdown] &&
        !dropdownRefs.current[activeDropdown].contains(event.target)
      ) {
        setActiveDropdowns((prev) => ({ ...prev, desktop: null }));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdowns.desktop]);

  // Add scroll event listener
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", controlHeader);
      return () => window.removeEventListener("scroll", controlHeader);
    }
  }, [lastScrollY]);

  // Navigation items
  const navItems = [
    { name: "Blog", key: "blog", isDropdown: true },
    { name: "Cricket", href: "/livecricket", key: "cricket", isLive: isLive },
    { name: "About", href: "/about", key: "about" },
    { name: "Contact", href: "/contact", key: "contact" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (!isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  };

  const handleDropdownToggle = (name, type) => {
    console.log(`Toggling dropdown: ${name} (${type})`);
    console.log(`Current dropdown data:`, dropdownData[name]);

    setActiveDropdowns((prev) => {
      const newState = {
        ...prev,
        [type]: prev[type] === name ? null : name,
      };
      console.log(`New dropdown state:`, newState);
      return newState;
    });
  };

  // Animation variants for logo only

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, delay: 0.2, type: "spring", stiffness: 100 },
    },
  };

  const liveTextVariants = {
    pulse: {
      scale: [1, 1.1, 1],
      rotate: [0, 10, -10, 0],
      color: ["#ffffff", "#ff0000", "#ffffff"],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: "mirror",
      },
    },
  };

  return (
    <header
      className={`${
        isVisible ? "top-0" : "-top-24"
      } w-full z-30 flex justify-between items-center px-4 sm:px-6 lg:px-8 py-3 bg-secondary shadow-md transition-all duration-300 fixed`}
    >
      {/* Logo */}
      <div className="flex items-center flex-shrink-0">
        <Link href="/" className="flex items-center">
          <motion.img
            src="/iconified/logo4.ico"
            alt="urTechy Blogs Logo"
            className="h-7 sm:h-9"
            initial="hidden"
            animate="visible"
            variants={logoVariants}
          />
          <motion.h1
            className="text-lg sm:text-xl font-bold ml-2 whitespace-nowrap"
            initial="hidden"
            animate="visible"
            variants={logoVariants}
          >
            <span className="text-primary">ur</span>
            <span className="text-primary-light">Techy</span>
            <span className="text-text-primary"> Blogs</span>
          </motion.h1>
        </Link>
      </div>

      {/* Mobile Menu Icon */}
      <div className="lg:hidden">
        <button
          onClick={toggleMobileMenu}
          className="text-text-primary hover:text-primary focus:outline-none"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Navigation Items (Desktop) */}
      <nav className="hidden lg:flex items-center space-x-1 xl:space-x-6">
        {navItems.map((item) =>
          item.isDropdown ? (
            <div
              className="relative"
              key={item.key}
              ref={(el) => (dropdownRefs.current[item.name] = el)}
            >
              <button
                onClick={() => handleDropdownToggle(item.name, "desktop")}
                className={`text-text-primary hover:text-primary px-3 py-2 text-sm font-medium flex items-center transition-colors duration-200 ${
                  activeDropdowns.desktop === item.name ? "text-primary" : ""
                }`}
                aria-expanded={activeDropdowns.desktop === item.name}
                aria-haspopup="true"
              >
                {item.name}
                <RiArrowDropDownLine
                  size={20}
                  className={`ml-1 transition-transform duration-200 ${
                    activeDropdowns.desktop === item.name ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {activeDropdowns.desktop === item.name && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 z-50 mt-1 w-56 origin-top-right rounded-lg bg-secondary-light p-2 shadow-lg ring-1 ring-secondary focus:outline-none max-h-96 overflow-y-auto"
                  >
                    <div className="py-1 grid grid-cols-1">
                      {dropdownData[item.name] &&
                      dropdownData[item.name].length > 0 ? (
                        dropdownData[item.name].map((dropdownItem, index) => (
                          <Link
                            key={index}
                            href={dropdownItem.href}
                            onClick={() =>
                              setActiveDropdowns((prev) => ({
                                ...prev,
                                desktop: null,
                              }))
                            }
                            className="block px-3 py-2 text-sm rounded-md text-text-primary hover:bg-secondary-dark hover:text-primary transition-colors duration-150"
                          >
                            {dropdownItem.name}
                          </Link>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-text-secondary">
                          No categories found
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              key={item.key}
              href={item.href}
              className="text-text-primary hover:text-primary px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center"
            >
              {item.isLive && isLive ? (
                <motion.span
                  className="text-primary mr-1"
                  variants={liveTextVariants}
                  animate="pulse"
                >
                  Live
                </motion.span>
              ) : null}
              {item.name}
            </Link>
          )
        )}
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={toggleMobileMenu}
            />

            {/* Drawer Content */}
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
              className="fixed inset-y-0 right-0 w-4/5 max-w-sm bg-secondary shadow-xl z-50 lg:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Drawer Header */}
                <div className="flex justify-between items-center p-4 border-b border-secondary-light">
                  <Link
                    href="/"
                    onClick={toggleMobileMenu}
                    className="flex items-center"
                  >
                    <img
                      src="/iconified/logo4.ico"
                      alt="Logo"
                      className="h-8"
                    />
                    <h1 className="text-lg font-bold ml-2">
                      <span className="text-primary">ur</span>
                      <span className="text-primary-light">Techy</span>
                    </h1>
                  </Link>
                  <button
                    onClick={toggleMobileMenu}
                    className="text-text-primary hover:text-primary p-1"
                    aria-label="Close menu"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>

                {/* Scrollable Navigation */}
                <div className="flex-grow overflow-y-auto">
                  <nav className="p-4">
                    {navItems.map((item) => (
                      <div key={item.key} className="py-1">
                        {item.isDropdown ? (
                          <div className="w-full">
                            <button
                              onClick={() =>
                                handleDropdownToggle(item.name, "mobile")
                              }
                              className="w-full text-left text-text-primary font-medium py-3 text-base flex items-center justify-between"
                              aria-expanded={
                                activeDropdowns.mobile === item.name
                              }
                            >
                              {item.name}
                              <IoMdArrowDropdown
                                size={20}
                                className={`transform transition-transform ${
                                  activeDropdowns.mobile === item.name
                                    ? "rotate-180"
                                    : "rotate-0"
                                }`}
                              />
                            </button>

                            <AnimatePresence>
                              {activeDropdowns.mobile === item.name && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-1 pl-4 border-l-2 border-secondary-light space-y-1">
                                    {dropdownData[item.name] &&
                                    dropdownData[item.name].length > 0 ? (
                                      dropdownData[item.name].map(
                                        (subItem, index) => (
                                          <Link
                                            key={index}
                                            href={subItem.href}
                                            onClick={toggleMobileMenu}
                                            className="block py-2 pl-2 text-sm text-text-secondary hover:text-primary"
                                          >
                                            {subItem.name}
                                          </Link>
                                        )
                                      )
                                    ) : (
                                      <div className="py-2 pl-2 text-sm text-text-secondary">
                                        No categories found
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ) : (
                          <Link
                            href={item.href}
                            onClick={toggleMobileMenu}
                            className="w-full text-text-primary hover:text-primary font-medium py-3 text-base flex items-center"
                          >
                            {item.isLive && isLive ? (
                              <motion.span
                                className="text-primary mr-1"
                                variants={liveTextVariants}
                                animate="pulse"
                              >
                                Live
                              </motion.span>
                            ) : null}
                            {item.name}
                          </Link>
                        )}
                        <div className="border-b border-secondary-light mt-1"></div>
                      </div>
                    ))}
                  </nav>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
