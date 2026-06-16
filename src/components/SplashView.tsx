/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Sparkles, Feather } from 'lucide-react';

interface SplashViewProps {
  onComplete: () => void;
  accentColor: string;
}

export function SplashView({ onComplete, accentColor }: SplashViewProps) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0); // 0: Init, 1: Connecting, 2: Encrypting, 3: Ready

  useEffect(() => {
    // Play subtle synthetic startup sound
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        // Warm sub pad
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(110, ctx.currentTime); // Low A
        osc1.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 1.2);
        
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(165, ctx.currentTime); // E
        osc2.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 1.5);

        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start();
        osc2.start();

        // High glass chime
        setTimeout(() => {
          const chime = ctx.createOscillator();
          const chimeGain = ctx.createGain();
          chime.type = 'sine';
          chime.frequency.setValueAtTime(880, ctx.currentTime);
          chime.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.4);
          
          chimeGain.gain.setValueAtTime(0, ctx.currentTime);
          chimeGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.1);
          chimeGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.0);
          
          chime.connect(chimeGain);
          chimeGain.connect(ctx.destination);
          chime.start();
          chime.stop(ctx.currentTime + 1.2);
        }, 800);

        osc1.stop(ctx.currentTime + 2.2);
        osc2.stop(ctx.currentTime + 2.2);
      }
    } catch (e) {
      console.log("Audio feedback not supported or blocked by policy");
    }

    // Step progression
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        let step = Math.floor(Math.random() * 8) + 4;
        const next = Math.min(prev + step, 100);
        
        if (next < 35) setStage(0);
        else if (next < 65) setStage(1);
        else if (next < 90) setStage(2);
        else setStage(3);

        return next;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [onComplete]);

  const stagesText = [
    "Initializing premium secure core...",
    "Securing offline client local storage database...",
    "Decrypting personal document indices securely...",
    "System authenticated. Launching 12 Note Series..."
  ];

  return (
    <div id="splash_screen" className="absolute inset-0 flex flex-col items-center justify-center bg-black select-none z-50 p-6 overflow-hidden">
      {/* Cinematic subtle light glow behind logo */}
      <motion.div 
        className="absolute w-80 h-80 rounded-full blur-[100px] opacity-20"
        style={{ backgroundColor: accentColor }}
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Grid Pattern with dynamic opacity */}
      <div className="absolute inset-0 dots-pattern opacity-10 pointer-events-none" />

      {/* Floating Sparkles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute md:w-1.5 md:h-1.5 w-1 h-1 rounded-full bg-white opacity-40"
            style={{
              top: `${20 + i * 12}%`,
              left: `${15 + (i * 17) % 70}%`
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.8, 0.1],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 2.5 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center max-w-sm w-full text-center">
        {/* Animated Premium Logo Mark */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-8"
        >
          {/* Hexagonal Gold Outer Ring with Rotate */}
          <motion.div 
            className="w-24 h-24 rounded-2xl flex items-center justify-center relative p-[1px]"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, rgba(255, 255, 255, 0.05), ${accentColor})`
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          />

          {/* Absolute content (to avoid rotation on icons) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[88px] h-[88px] rounded-2xl bg-[#090a0f] flex flex-col items-center justify-center p-2 border border-white/5">
              <motion.div
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="relative"
              >
                <Feather className="w-10 h-10 text-white" style={{ color: accentColor }} />
                <motion.div 
                  className="absolute -top-1 -right-1"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mb-1"
        >
          <h1 className="text-3xl font-bold tracking-widest text-white font-display uppercase">
            12 Note Series
          </h1>
          <div className="h-[2px] w-12 bg-gradient-to-r mx-auto my-3" style={{ backgroundImage: `linear-gradient(to right, transparent, ${accentColor}, transparent)` }} />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-xs font-mono uppercase tracking-[0.2em] text-gray-400 mb-12"
        >
          Luxury Security Plaintext Notepad
        </motion.p>

        {/* Dynamic loading text description */}
        <div className="h-6 overflow-hidden mb-4 w-full">
          <AnimatePresence mode="wait">
            <motion.p
              key={stage}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-xs font-mono text-gray-400 tracking-wider inline-flex items-center gap-2 justify-center"
            >
              {stage === 2 ? (
                <ShieldCheck className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: accentColor }} />
              )}
              {stagesText[stage]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Premium Progress Bar */}
        <div id="splash_progress" className="w-64 h-[3px] bg-white/10 rounded-full overflow-hidden relative">
          <motion.div
            className="h-full rounded-full transition-all duration-100 ease-out"
            style={{ 
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${accentColor}, #ffffff)` 
            }}
          />
        </div>

        {/* Percentage Tracker */}
        <motion.span 
          className="text-[10px] font-mono text-gray-500 mt-2 tracking-widest"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {progress}% SECURED SECTOR LOADED
        </motion.span>
      </div>

      {/* Brand Watermark Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-8 flex items-center gap-2"
      >
        <span className="text-[9px] font-mono tracking-[0.3em] text-white uppercase">
          Enterprise Cryptographic Shield v1.12
        </span>
      </motion.div>
    </div>
  );
}
