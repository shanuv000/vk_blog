import React from "react";
import Head from "next/head";
import Image from "next/image";
import { motion } from "framer-motion";
import { FiActivity } from "react-icons/fi";
import ShowCricket from "../components/Cricket/ShowCricket";
import ball from "../public/cricket/ball.png";
import { CricketDataProvider, useCricketData } from "../store/CricketDataContext";

/**
 * LiveCricket page component
 * Premium mobile-first design with glassmorphism effects
 * CricketDataProvider ensures cricket APIs only fetch on this page
 */

// Inner component that uses cricket data
const LiveCricketContent = () => {
  const { isLiveScore } = useCricketData();

  return (
    <>
      <Head>
        <title>Live Cricket Scores & Updates | urTechy Blogs</title>
        <meta
          name="description"
          content="Follow your favorite cricket teams with live scores, comprehensive match details, and up-to-the-minute tournament standings for IPL, World Cup, and all major cricket events."
        />
        <meta
          name="keywords"
          content="cricket, live scores, IPL, World Cup, cricket matches, tournament standings, cricket updates, real-time cricket, match details"
        />
      </Head>

      {/* Premium Dark Background */}
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#16213e] relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" 
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(244, 63, 94, 0.15) 0%, transparent 50%),
                               radial-gradient(circle at 75% 75%, rgba(245, 158, 11, 0.15) 0%, transparent 50%)`
            }}
          />
        </div>

        {/* Floating Orbs */}
        <motion.div
          className="absolute top-20 right-10 w-32 h-32 md:w-64 md:h-64 rounded-full bg-gradient-to-r from-rose-500/20 to-amber-500/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-40 left-10 w-40 h-40 md:w-72 md:h-72 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="relative z-10 w-full mx-auto px-4 py-6 md:py-12">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center mb-8 md:mb-12"
          >
            {/* Glassmorphism Header Card */}
            <div className="relative w-full max-w-2xl">
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-rose-500/30 to-amber-500/30 rounded-2xl blur-xl"
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 md:p-8">
                {/* Logo and Title */}
                <div className="flex items-center justify-center gap-4 mb-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-amber-500 rounded-full blur-md opacity-50" />
                    <Image
                      src={ball}
                      alt="Cricket Ball"
                      width={48}
                      height={48}
                      quality={85}
                      sizes="48px"
                      className="relative w-12 h-12"
                      priority
                    />
                  </motion.div>
                  
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold">
                    <span className="bg-gradient-to-r from-rose-400 via-amber-400 to-rose-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                      Cricket Hub
                    </span>
                  </h1>
                </div>

                {/* Decorative Line */}
                <div className="flex justify-center mb-4">
                  <motion.div 
                    className="h-1 w-24 bg-gradient-to-r from-rose-500 to-amber-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: 96 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  />
                </div>

                {/* Live Indicator */}
                {isLiveScore && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-center mb-4"
                  >
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 rounded-full border border-emerald-500/30">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                      <span className="text-emerald-400 font-semibold text-sm">
                        LIVE MATCHES
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Description */}
                <p className="text-center text-slate-300 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
                  Follow your favorite teams with{" "}
                  <span className="text-rose-400 font-semibold">live scores</span>,{" "}
                  match details, and{" "}
                  <span className="text-amber-400 font-semibold">tournament standings</span>{" "}
                  for{" "}
                  <span className="text-emerald-400 font-semibold">IPL</span>,{" "}
                  <span className="text-cyan-400 font-semibold">World Cup</span>, and more.
                </p>

                {/* Quick Stats */}
                <div className="flex justify-center gap-6 mt-6">
                  <motion.div 
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-2xl font-bold text-rose-400">
                      <FiActivity className="inline-block mr-1" />
                      24/7
                    </div>
                    <div className="text-xs text-slate-400">Updates</div>
                  </motion.div>
                  <div className="w-px h-12 bg-white/10" />
                  <motion.div 
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-2xl font-bold text-amber-400">50+</div>
                    <div className="text-xs text-slate-400">Leagues</div>
                  </motion.div>
                  <div className="w-px h-12 bg-white/10" />
                  <motion.div 
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-2xl font-bold text-emerald-400">Live</div>
                    <div className="text-xs text-slate-400">Scores</div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Cricket Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <ShowCricket />
          </motion.div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </>
  );
};

// Wrapper component with CricketDataProvider
// Cricket APIs ONLY fetch when this page is mounted
const LiveCricket = () => {
  return (
    <CricketDataProvider>
      <LiveCricketContent />
    </CricketDataProvider>
  );
};

export default LiveCricket;
