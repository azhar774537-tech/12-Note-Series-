/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wifi, Battery, Signal, Maximize2, Minimize2, Smartphone, Monitor, Info, Sparkles } from 'lucide-react';

interface DeviceFrameProps {
  children: React.ReactNode;
  themeType: string;
  accentColor: string;
}

export function DeviceFrame({ children, themeType, accentColor }: DeviceFrameProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [deviceTime, setDeviceTime] = useState("");
  const [notifExpanded, setNotifExpanded] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(88);

  useEffect(() => {
    // Update local clock for internal android system
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // safety
      setDeviceTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Soft random discharge simulation for battery
  useEffect(() => {
    const batteryInterval = setInterval(() => {
      setBatteryLevel(prev => Math.max(5, prev - 1));
    }, 180000);
    return () => clearInterval(batteryInterval);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0A0A0B] text-white p-4 font-sans select-none relative overflow-hidden transition-colors duration-1000">
      {/* Dynamic ambient grid background */}
      <div className="absolute inset-0 dots-pattern opacity-10 pointer-events-none" />

      {/* Floating abstract glowing luxury fluid background gradient */}
      <div 
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[160px] opacity-10 pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[140px] opacity-5 pointer-events-none bg-blue-600" />

      {/* Top Floating Control Rail for Interactive Switching */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-4 z-30 px-2">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full animate-pulse bg-emerald-500" />
              <h1 className="text-sm font-semibold uppercase tracking-widest font-display text-slate-100">
                12 Note Series Sandbox
              </h1>
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              Android Flagship Simulation Mode
            </p>
          </div>
        </div>

        {/* View Toggle Controller */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setIsFullscreen(false)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono transition-all uppercase cursor-pointer ${!isFullscreen ? 'bg-white/10 text-white font-medium shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Flagship Phone</span>
          </button>
          
          <button
            onClick={() => setIsFullscreen(true)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono transition-all uppercase cursor-pointer ${isFullscreen ? 'bg-white/10 text-white font-medium shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablet Canvas</span>
          </button>
        </div>
      </div>

      {/* Main Container Wrapper */}
      <div className="w-full flex-1 flex items-center justify-center relative">
        <AnimatePresence mode="wait">
          {!isFullscreen ? (
            /* FLAGSHIP PHONE BEZEL FRAME */
            <motion.div
              key="phone_frame"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="relative w-[375px] h-[780px] rounded-[48px] bg-black p-[11px] shadow-2xl shadow-black/80 flex flex-col overflow-hidden border-4 border-slate-850/90"
              style={{
                boxShadow: `0 25px 60px -15px rgba(0,0,0,0.9), 0 0 45px -5px ${accentColor}1C`
              }}
            >
              {/* Matte Titanium Side Accents */}
              <div className="absolute top-[120px] -left-1/2 w-1.5 h-16 bg-slate-800 rounded-r opacity-60" />
              <div className="absolute top-[200px] -left-1/2 w-1.5 h-20 bg-slate-800 rounded-r opacity-60" />
              <div className="absolute top-[200px] -right-1/2 w-1.5 h-20 bg-slate-800 rounded-l opacity-60" />

              {/* SCREEN INSIDE PHONE FRAME */}
              <div className="w-full h-full rounded-[40px] overflow-hidden bg-black flex flex-col relative border border-slate-900">
                
                {/* 1. Android Status Bar (Interactive Notch) */}
                <header className="h-[44px] px-6 flex items-center justify-between bg-[#08080C] text-white select-none z-40 shrink-0 font-display">
                  {/* Left Dynamic Clock */}
                  <span className="text-[12px] font-semibold tracking-wide text-slate-100">{deviceTime.split(" ")[0]}</span>

                  {/* Central Pill Notch - Clicking reveals quick status info! */}
                  <button 
                    onClick={() => setNotifExpanded(!notifExpanded)}
                    className="relative cursor-pointer focus:outline-none"
                  >
                    <motion.div 
                      layoutId="phone_notch"
                      className="h-[20px] bg-black rounded-full flex items-center justify-center px-4 border border-white/5 transition-all"
                      animate={{ 
                        width: notifExpanded ? 180 : 76,
                        backgroundColor: notifExpanded ? '#11131a' : '#000000'
                      }}
                    >
                      {notifExpanded ? (
                        <div className="flex items-center gap-2 text-[8px] font-mono text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          <span>12 Note Sandbox Encrypted</span>
                        </div>
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#1A1C23] border border-white/10" />
                      )}
                    </motion.div>
                  </button>

                  {/* Right Icons: Network, Wifi, Battery */}
                  <div className="flex items-center gap-1.5 text-slate-200">
                    <Signal className="w-3.5 h-3.5 text-slate-300" />
                    <Wifi className="w-3.5 h-3.5 text-slate-300" />
                    <div className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded-md">
                      <span className="text-[9px] font-mono tracking-tighter text-slate-300">{batteryLevel}%</span>
                      <Battery className="w-3.5 h-3.5" style={{ color: batteryLevel < 20 ? '#EF4444' : '#10B981' }} />
                    </div>
                  </div>
                </header>

                {/* Micro notification panel expansion drop */}
                <AnimatePresence>
                  {notifExpanded && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="absolute top-11 inset-x-4 bg-[#11131a]/95 backdrop-blur-xl border border-white/10 p-3.5 rounded-2xl z-40 text-left shadow-xl"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-white">System Diagnostics</span>
                      </div>
                      <div className="space-y-1.5 text-[10px] font-mono text-slate-400">
                        <p className="flex justify-between"><span>Crypto State:</span> <span className="text-emerald-400 font-semibold">AES-256 (Sandbox Active)</span></p>
                        <p className="flex justify-between"><span>Database:</span> <span>SQLite / IndexedDB (100% Offline)</span></p>
                        <p className="flex justify-between"><span>Build Target:</span> <span className="text-[#C5A880]">Android AAB v1.12</span></p>
                        <p className="flex justify-between"><span>Device Model:</span> <span>Titanium Note Z</span></p>
                      </div>
                      <button 
                        onClick={() => setNotifExpanded(false)}
                        className="w-full mt-2 text-center text-[9px] text-slate-500 hover:text-slate-300 py-1"
                      >
                        Tap to collapse diagnostic tray
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 2. Embedded Children App Screen */}
                <div className="flex-1 w-full bg-black relative flex flex-col overflow-hidden">
                  {children}
                </div>

                {/* 3. Android Navigation Gesture Handle at bottom */}
                <footer className="h-[14px] bg-[#000000] flex justify-center items-center relative z-40 shrink-0">
                  <div className="w-[110px] h-[4px] bg-slate-700/80 rounded-full" />
                </footer>
              </div>
            </motion.div>
          ) : (
            /* TABLET / FOLDABLE CANVAS STUNNING GRID LAYOUT */
            <motion.div
              key="tablet_canvas"
              initial={{ scale: 1.02, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.02, opacity: 0 }}
              className="w-full max-w-5xl h-[780px] bg-black rounded-3xl overflow-hidden shadow-2xl relative border border-slate-800 flex flex-col"
              style={{
                boxShadow: `0 25px 60px -15px rgba(0,0,0,0.9), 0 0 30px -10px ${accentColor}1A`
              }}
            >
              {/* Laptop or Slate top notch simulation */}
              <div className="h-2.5 bg-[#08080C] w-full flex justify-center">
                <div className="w-16 h-1 bg-white/10 rounded-full my-0.5" />
              </div>

              {/* Screen Body */}
              <div className="flex-1 relative flex flex-col overflow-hidden bg-black">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Small informative prompt */}
      <span className="text-[10px] font-mono tracking-widest text-slate-600 mt-4 text-center uppercase max-w-md hidden md:inline">
        🔒 All note series transactions remain zero-knowledge client encrypted. Offline-First Architecture.
      </span>
    </div>
  );
}
