import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import { RiArrowDropDownLine } from "react-icons/ri";
import { FaDiscord } from "react-icons/fa6";
import { useIsLiveCricket } from "../hooks/useCricketData";
import { getDirectCategories } from "../services/direct-api";
import { CATEGORY_HIERARCHY } from "../utils/categoryHierarchy";

const Header = () => {
  // Use direct API for categories
  const [categories, setCategories] = useState([]);

  // Safely get live cricket status only when on cricket page
  const isLive = useIsLiveCricket();

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
  const scrollThrottleRef = useRef(false);



  // Handle header visibility on scroll - OPTIMIZED with throttling
  const controlHeader = useCallback(() => {
    // Use requestAnimationFrame throttling to prevent excessive updates
    if (scrollThrottleRef.current) return;
    
    scrollThrottleRef.current = true;
    requestAnimationFrame(() => {
      if (typeof window !== "undefined") {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        setLastScrollY(currentScrollY);
      }
      scrollThrottleRef.current = false;
    });
  }, [lastScrollY]);

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

  // Add scroll event listener - OPTIMIZED with passive option
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", controlHeader, { passive: true });
      return () => window.removeEventListener("scroll", controlHeader);
    }
  }, [controlHeader]);

  // Main categories to show inline (top 5)
  const mainCategories = CATEGORY_HIERARCHY.slice(0, 5);
  
  // Remaining categories for "More" dropdown
  const moreCategories = CATEGORY_HIERARCHY.slice(5);

  // Navigation items - now with inline categories
  const navItems = [
    // Main category links (inline)
    ...mainCategories.map((cat) => ({
      name: cat.name,
      href: `/category/${cat.slug}`,
      key: cat.slug,
      icon: cat.icon,
      isCategory: true,
    })),
    // More dropdown for remaining categories
    { name: "More", key: "more", isDropdown: true },
    // Cricket with live indicator
    { name: "Cricket", href: "/livecricket", key: "cricket", isLive: isLive },
    // About & Contact
    { name: "About", href: "/about", key: "about" },
    { name: "Contact", href: "/contact", key: "contact" },
  ];

  // Dropdown data for "More" and subcategories
  const dropdownData = {
    More: moreCategories.map((cat) => ({
      name: cat.name,
      href: `/category/${cat.slug}`,
      icon: cat.icon,
      isParent: true,
    })),
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (!isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  };

  const handleDropdownToggle = (name, type) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`Toggling dropdown: ${name} (${type})`);
      console.log(`Current dropdown data:`, dropdownData[name]);
    }

    setActiveDropdowns((prev) => {
      const newState = {
        ...prev,
        [type]: prev[type] === name ? null : name,
      };
      if (process.env.NODE_ENV === "development") {
        console.log(`New dropdown state:`, newState);
      }
      return newState;
    });
  };

  // Minimal animation for live indicator only (removed logo animations for faster load)
  const liveTextVariants = {
    pulse: {
      opacity: [1, 0.6, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <>
      <header
        className={`${
          isVisible ? "top-0" : "-top-24"
        } w-full z-30 flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4 bg-secondary/95 backdrop-blur-sm border-b border-border transition-all duration-200 fixed`}
        style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)" }}
      >
        {/* Logo - No animations for instant load */}
        <div className="flex items-center flex-shrink-0">
          <Link href="/" className="flex items-center group">
            <img
              src="/iconified/logo4.ico"
              alt="urTechy Blogs Logo"
              className="h-8 sm:h-10 transition-transform duration-200 group-hover:scale-105"
            />
            <h1 className="text-lg sm:text-xl font-bold ml-3 whitespace-nowrap">
              <span className="text-primary">ur</span>
              <span className="text-primary-light">Techy</span>
              <span className="text-text-primary"> Blogs</span>
            </h1>
          </Link>
        </div>

        {/* Mobile Menu Icon & Discord Icon (Mobile) */}
        <div className="lg:hidden flex items-center space-x-4">
          <motion.a
            href="https://discord.gg/SquXBvz3Q"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#5865F2] hover:text-[#4752C4] transition-colors"
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
            /* OPTIMIZED: Removed infinite animation - now only animates on interaction */
          >
            <FaDiscord size={24} />
          </motion.a>
          <button
            onClick={toggleMobileMenu}
            className="text-text-primary hover:text-primary focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Navigation Items (Desktop) */}
        <nav className="hidden lg:flex items-center space-x-2 xl:space-x-4">
          {/* Discord Icon (Desktop) */}
          <motion.a
            href="https://discord.gg/SquXBvz3Q"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#5865F2] hover:text-[#4752C4] transition-colors mr-2"
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
            /* OPTIMIZED: Removed infinite animation - now only animates on interaction */
            title="Join our Discord"
          >
            <FaDiscord size={28} />
          </motion.a>
          {navItems.map((item) =>
            item.isDropdown ? (
              <div
                className="relative"
                key={item.key}
                ref={(el) => (dropdownRefs.current[item.name] = el)}
              >
                <button
                  onClick={() => handleDropdownToggle(item.name, "desktop")}
                  className={`text-text-primary hover:text-primary px-4 py-2 text-sm font-medium flex items-center transition-colors duration-150 rounded-lg hover:bg-secondary-light ${
                    activeDropdowns.desktop === item.name
                      ? "text-primary bg-secondary-light"
                      : ""
                  }`}
                  aria-expanded={activeDropdowns.desktop === item.name}
                  aria-haspopup="true"
                >
                  {item.name}
                  <RiArrowDropDownLine
                    size={20}
                    className={`ml-1 transition-transform duration-150 ${
                      activeDropdowns.desktop === item.name ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {activeDropdowns.desktop === item.name && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-xl bg-secondary-light border border-border p-2 shadow-card max-h-[500px] overflow-y-auto"
                    >
                      <div className="py-1 grid grid-cols-1 gap-0.5">
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
                              className={`block px-4 py-2.5 text-sm rounded-lg text-text-primary hover:bg-secondary hover:text-primary transition-colors duration-150 ${
                                dropdownItem.isParent
                                  ? "font-semibold border-b border-border/50 mb-1"
                                  : "text-sm pl-6"
                              }`}
                            >
                              {dropdownItem.icon && (
                                <span className="mr-2">
                                  {dropdownItem.icon}
                                </span>
                              )}
                              {dropdownItem.name}
                            </Link>
                          ))
                        ) : (
                          <div className="px-4 py-2.5 text-sm text-text-secondary">
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
                className="text-text-primary hover:text-primary px-4 py-2 text-sm font-medium transition-colors duration-150 flex items-center rounded-lg hover:bg-secondary-light"
              >
                {item.isLive && isLive ? (
                  <motion.span
                    className="flex items-center mr-2"
                    variants={liveTextVariants}
                    animate="pulse"
                  >
                    <span className="w-2 h-2 bg-primary rounded-full mr-1.5" />
                    <span className="text-primary font-semibold">Live</span>
                  </motion.span>
                ) : null}
                {item.name}
              </Link>
            )
          )}
        </nav>
      </header>

      {/* Mobile Menu Drawer - Rendered outside header for proper z-index */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] lg:hidden"
              onClick={toggleMobileMenu}
            />

            {/* Drawer Content */}
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
              className="fixed inset-y-0 right-0 w-4/5 max-w-sm bg-secondary border-l border-border shadow-card-hover z-[110] lg:hidden overflow-hidden"
            >
              <div className="flex flex-col h-full">
                {/* Drawer Header */}
                <div className="flex justify-between items-center p-5 border-b border-border bg-secondary-dark">
                  <Link
                    href="/"
                    onClick={toggleMobileMenu}
                    className="flex items-center"
                  >
                    <img
                      src="/iconified/logo4.ico"
                      alt="Logo"
                      className="h-9"
                    />
                    <h1 className="text-lg font-bold ml-3">
                      <span className="text-primary">ur</span>
                      <span className="text-primary-light">Techy</span>
                    </h1>
                  </Link>
                  <button
                    onClick={toggleMobileMenu}
                    className="text-text-primary hover:text-primary p-2 rounded-lg hover:bg-secondary-light transition-colors duration-150"
                    aria-label="Close menu"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>

                {/* Scrollable Navigation */}
                <div className="flex-grow overflow-y-auto bg-secondary">
                  <nav className="p-5">
                    {navItems.map((item) => (
                      <div key={item.key} className="mb-2">
                        {item.isDropdown ? (
                          <div className="w-full">
                            <button
                              onClick={() =>
                                handleDropdownToggle(item.name, "mobile")
                              }
                              className="w-full text-left text-text-primary font-medium py-3 px-3 text-base flex items-center justify-between rounded-lg hover:bg-secondary-light transition-colors duration-150"
                              aria-expanded={
                                activeDropdowns.mobile === item.name
                              }
                            >
                              {item.name}
                              <IoMdArrowDropdown
                                size={20}
                                className={`transform transition-transform duration-150 ${
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
                                  transition={{ duration: 0.15 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-2 pl-4 border-l-2 border-primary/30 space-y-0.5">
                                    {dropdownData[item.name] &&
                                    dropdownData[item.name].length > 0 ? (
                                      dropdownData[item.name].map(
                                        (subItem, index) => (
                                          <Link
                                            key={index}
                                            href={subItem.href}
                                            onClick={toggleMobileMenu}
                                            className={`block py-2.5 pl-3 rounded-lg hover:bg-secondary-light transition-colors duration-150 ${
                                              subItem.isParent
                                                ? "text-base font-semibold text-text-primary hover:text-primary border-b border-border/30 mb-1"
                                                : "text-sm text-text-secondary hover:text-primary"
                                            }`}
                                          >
                                            {subItem.icon && (
                                              <span className="mr-2">
                                                {subItem.icon}
                                              </span>
                                            )}
                                            {subItem.name}
                                          </Link>
                                        )
                                      )
                                    ) : (
                                      <div className="py-2.5 pl-3 text-sm text-text-tertiary">
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
                            className="block w-full text-text-primary hover:text-primary font-medium py-3 px-3 text-base rounded-lg hover:bg-secondary-light transition-colors duration-150"
                          >
                            {item.isLive && isLive ? (
                              <motion.span
                                className="flex items-center mr-2"
                                variants={liveTextVariants}
                                animate="pulse"
                              >
                                <span className="w-2 h-2 bg-primary rounded-full mr-1.5" />
                                <span className="text-primary font-semibold">
                                  Live
                                </span>
                              </motion.span>
                            ) : null}
                            {item.name}
                          </Link>
                        )}
                      </div>
                    ))}
                  </nav>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
