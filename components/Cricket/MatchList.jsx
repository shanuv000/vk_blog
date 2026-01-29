import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { BiCommentDetail, BiChevronDown, BiChevronUp, BiLoaderAlt } from "react-icons/bi";
import { FiRefreshCw, FiExternalLink } from "react-icons/fi";
import { IoLocationOutline, IoCalendarOutline, IoTrophyOutline } from "react-icons/io5";
import ball from "../../public/cricket/ball.png";
import Scorecard from "./Scorecard";

/**
 * Format match date to rich readable format
 */
function formatMatchDate(match) {
  if (match.matchStartTime?.startDateISO) {
    try {
      const date = new Date(match.matchStartTime.startDateISO);
      return date.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      // Fall through
    }
  }

  if (match.time && match.time !== 'N/A' && match.time !== 'LIVE') {
    return match.time;
  }

  if (match.matchStartTime) {
    const parts = [];
    if (match.matchStartTime.date) parts.push(match.matchStartTime.date);
    if (match.matchStartTime.time) parts.push(match.matchStartTime.time);
    if (parts.length > 0) return parts.join(' • ');
  }

  return null;
}

/**
 * MatchList component - Premium dark theme design
 */
const MatchList = ({
  title,
  matches = [],
  error,
  loading,
  onRefresh,
  isRefreshing,
  headings = [],
  selectedHeading,
  setSelectedHeading,
}) => {
  const [expandedMatchId, setExpandedMatchId] = useState(null);
  const [loadingScorecard, setLoadingScorecard] = useState({});
  const [matchScorecards, setMatchScorecards] = useState({});

  const filteredMatches = matches || [];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const toggleScorecard = async (matchId) => {
    // If closing
    if (expandedMatchId === matchId) {
      setExpandedMatchId(null);
      return;
    }

    // Opening new match
    setExpandedMatchId(matchId);

    // If we already have data, don't fetch again
    if (matchScorecards[matchId]) {
      return;
    }

    // Fetch data
    try {
      setLoadingScorecard((prev) => ({ ...prev, [matchId]: true }));
      const response = await axios.get(`/api/scores/match/${matchId}`);

      // The API returns { data: { ...scorecardData } } or just the data depending on proxy
      // Based on our proxy implementation, it returns the upstream data directly or wrapped.
      // Let's handle both.
      const scorecardData = response.data.data?.data || response.data.data || response.data;

      // Check if we got valid innings data
      if (scorecardData) {
        setMatchScorecards((prev) => ({
          ...prev,
          [matchId]: scorecardData.innings || []
        }));
      }
    } catch (err) {
      console.error("Failed to fetch scorecard", err);
    } finally {
      setLoadingScorecard((prev) => ({ ...prev, [matchId]: false }));
    }
  };

  // Empty state
  if (!loading && (!matches || matches.length === 0)) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">
            {title}
            <div className="h-1 w-16 bg-gradient-to-r from-rose-500 to-amber-500 mt-2 rounded-full" />
          </h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onRefresh}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <FiRefreshCw className="w-5 h-5" />
          </motion.button>
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-rose-500/30 rounded-full blur-xl" />
            <Image
              src={ball}
              alt="Cricket"
              width={64}
              height={64}
              quality={70}
              className="relative w-16 h-16 opacity-60"
            />
          </div>
          <p className="text-lg font-medium text-slate-400 text-center mb-4">
            No matches available at the moment
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRefresh}
            className="px-6 py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-xl font-medium shadow-lg shadow-rose-500/25"
          >
            Refresh
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-white">
          {title}
          <div className="h-1 w-20 bg-gradient-to-r from-rose-500 to-amber-500 mt-2 rounded-full" />
        </h3>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          onClick={onRefresh}
          className={`p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all ${isRefreshing ? "animate-spin" : ""
            }`}
          disabled={isRefreshing}
        >
          <FiRefreshCw className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Tournament Selector */}
      {headings.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Tournament
          </label>
          <div className="relative">
            <select
              value={selectedHeading}
              onChange={(e) => setSelectedHeading(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all"
              disabled={loading || isRefreshing}
            >
              {headings.map((heading, index) => (
                <option key={index} value={heading} className="bg-slate-800 text-white">
                  {heading}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-white">
              Unable to load cricket data
            </h4>
          </div>
          <p className="text-slate-400 mb-4">
            We're having trouble connecting. Try refreshing or check other sources.
          </p>
          <div className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRefresh}
              className="px-4 py-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-lg font-medium"
            >
              Try Again
            </motion.button>
            <a
              href="https://www.espncricinfo.com/live-cricket-score"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors flex items-center gap-2"
            >
              ESPNCricinfo <FiExternalLink className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      ) : loading ? (
        /* Premium Skeleton Loader - Instant visual feedback */
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

              {/* Card Header Skeleton */}
              <div className="border-b border-white/10 bg-white/5 px-4 py-3 flex items-center justify-between">
                <div className="h-4 w-32 bg-white/10 rounded-lg" />
                <div className="h-6 w-20 bg-emerald-500/20 rounded-full" />
              </div>

              {/* Card Content Skeleton */}
              <div className="p-4">
                {/* Team 1 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10" />
                    <div className="h-4 w-24 bg-white/10 rounded-lg" />
                  </div>
                  <div className="h-6 w-16 bg-rose-500/20 rounded-lg" />
                </div>

                {/* Team 2 */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10" />
                    <div className="h-4 w-28 bg-white/10 rounded-lg" />
                  </div>
                  <div className="h-5 w-14 bg-white/10 rounded-lg" />
                </div>

                {/* Info Tags */}
                <div className="flex gap-3">
                  <div className="h-6 w-32 bg-white/5 rounded-lg" />
                  <div className="h-6 w-24 bg-white/5 rounded-lg" />
                </div>
              </div>
            </div>
          ))}

          {/* Loading Text */}
          <p className="text-center text-sm text-slate-500 mt-4">
            Fetching latest updates...
          </p>
        </div>
      ) : filteredMatches.length === 0 ? (
        /* No Matches for Tournament */
        <div className="flex flex-col items-center justify-center py-12">
          <Image
            src={ball}
            alt="Cricket"
            width={64}
            height={64}
            quality={70}
            className="w-16 h-16 opacity-30 mb-4"
          />
          <p className="text-lg font-medium text-center mb-4">
            <span className="text-slate-400">No matches in </span>
            <span className="text-amber-400 font-semibold">this tournament</span>
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRefresh}
            className="px-6 py-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-xl font-medium"
          >
            Refresh
          </motion.button>
        </div>
      ) : (
        /* Match List */
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {filteredMatches.map((match, index) => (
            <motion.div
              key={match.matchId || `${match.heading}-${index}`}
              variants={item}
              className="relative group"
            >
              {/* Card Glow */}
              <div className={`absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${match.matchStatus === "live"
                ? "bg-emerald-500/20"
                : match.matchStatus === "completed"
                  ? "bg-slate-500/20"
                  : "bg-amber-500/20"
                }`} />

              {/* Match Card */}
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300">
                {/* Match Header */}
                <div className="border-b border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm md:text-base font-bold text-white truncate pr-2">
                      {match.title && match.title !== "N/A" ? match.title : match.heading || "Cricket Match"}
                    </h4>

                    {/* Status Badge */}
                    {match.matchStatus === "live" && (
                      <div className="flex items-center px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30 shrink-0">
                        <span className="relative flex h-2 w-2 mr-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-bold text-emerald-400">LIVE</span>
                      </div>
                    )}
                    {match.matchStatus === "completed" && (
                      <div className="flex items-center px-3 py-1 bg-slate-500/20 rounded-full border border-slate-500/30 shrink-0">
                        <IoTrophyOutline className="w-3 h-3 mr-1 text-slate-400" />
                        <span className="text-xs font-bold text-slate-400">COMPLETED</span>
                      </div>
                    )}
                    {match.matchStatus === "upcoming" && (
                      <div className="flex items-center px-3 py-1 bg-amber-500/20 rounded-full border border-amber-500/30 shrink-0">
                        <IoCalendarOutline className="w-3 h-3 mr-1 text-amber-400" />
                        <span className="text-xs font-bold text-amber-400">UPCOMING</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Match Content */}
                <div className="p-4">
                  {/* Teams */}
                  <div className="flex flex-col gap-3 mb-4">
                    {/* Batting Team */}
                    {match.playingTeamBat && match.playingTeamBat !== "N/A" && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {match.team1Icon ? (
                            <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden ring-2 ring-rose-500/30">
                              <Image
                                src={match.team1Icon}
                                alt={match.playingTeamBat}
                                width={40}
                                height={40}
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm ring-2 ring-rose-500/30">
                              {match.playingTeamBat.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <span className="font-semibold text-white">
                            {match.playingTeamBat}
                          </span>
                        </div>
                        <span className="text-xl font-bold text-rose-400">
                          {match.liveScorebat}
                        </span>
                      </div>
                    )}

                    {/* Bowling Team */}
                    {match.playingTeamBall && match.playingTeamBall !== "N/A" && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {match.team2Icon ? (
                            <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden ring-2 ring-slate-500/30">
                              <Image
                                src={match.team2Icon}
                                alt={match.playingTeamBall}
                                width={40}
                                height={40}
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-slate-500/30">
                              {match.playingTeamBall.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium text-slate-300">
                            {match.playingTeamBall}
                          </span>
                        </div>
                        {match.liveScoreball && match.liveScoreball !== "N/A" && (
                          <span className="text-lg font-bold text-slate-400">
                            {match.liveScoreball}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Result for completed matches */}
                  {match.matchStatus === "completed" && match.result && (
                    <div className="mb-4 px-4 py-2 bg-gradient-to-r from-rose-500/10 to-amber-500/10 rounded-xl border border-rose-500/20">
                      <p className="text-sm font-semibold text-rose-400 text-center">
                        {match.result}
                      </p>
                    </div>
                  )}

                  {/* Match Info */}
                  <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                    {/* Date/Time */}
                    {formatMatchDate(match) && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-lg">
                        <IoCalendarOutline className="w-3 h-3" />
                        <span>{formatMatchDate(match)}</span>
                      </div>
                    )}

                    {/* Location */}
                    {match.location && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-lg">
                        <IoLocationOutline className="w-3 h-3" />
                        <span className="truncate max-w-[150px]">{match.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Commentary */}
                  {match.liveCommentary && (
                    <div className="mt-3 flex items-start gap-2 px-3 py-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                      <BiCommentDetail className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-amber-300">
                        {match.liveCommentary}
                      </span>
                    </div>
                  )}

                  {/* Scorecard Toggle */}
                  {(match.hasScorecard || match.matchStatus === 'live' || match.matchStatus === 'completed') && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <motion.button
                        onClick={() => toggleScorecard(match.matchId)}
                        className="flex items-center text-sm font-medium text-rose-400 hover:text-rose-300 transition-colors"
                        whileTap={{ scale: 0.95 }}
                        disabled={loadingScorecard[match.matchId]}
                      >
                        {loadingScorecard[match.matchId] ? (
                          <>Loading... <BiLoaderAlt className="ml-1 w-5 h-5 animate-spin" /></>
                        ) : expandedMatchId === match.matchId ? (
                          <>Hide Scorecard <BiChevronUp className="ml-1 w-5 h-5" /></>
                        ) : (
                          <>View Scorecard <BiChevronDown className="ml-1 w-5 h-5" /></>
                        )}
                      </motion.button>
                      <AnimatePresence>
                        {expandedMatchId === match.matchId && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {matchScorecards[match.matchId] ? (
                              <Scorecard scorecard={matchScorecards[match.matchId]} />
                            ) : (
                              match.scorecard && match.scorecard.length > 0 ? (
                                <Scorecard scorecard={match.scorecard} />
                              ) : (
                                !loadingScorecard[match.matchId] &&
                                <div className="p-4 text-center text-slate-400 text-sm italic">
                                  No detailed scorecard available yet.
                                </div>
                              )
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Quick Links */}
                  {match.links && Object.keys(match.links).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(match.links).map(
                          ([linkTitle, linkUrl], linkIndex) => (
                            <Link key={linkIndex} href={linkUrl || "#"} legacyBehavior>
                              <a
                                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {linkTitle}
                                <FiExternalLink className="w-3 h-3" />
                              </a>
                            </Link>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default MatchList;
