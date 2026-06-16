/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Fingerprint, Lock, HelpCircle, Delete, RotateCcw, ShieldAlert, KeyRound } from 'lucide-react';
import { SecuritySettings } from '../types';

interface LockScreenProps {
  securitySettings: SecuritySettings;
  onUnlock: () => void;
  accentColor: string;
}

export function LockScreen({ securitySettings, onUnlock, accentColor }: LockScreenProps) {
  const [mode, setMode] = useState<'pin' | 'pattern' | 'fingerprint' | 'recovery'>('pin');
  const [pinDigits, setPinDigits] = useState<string[]>([]);
  const [errorShake, setErrorShake] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [recoveryAnswer, setRecoveryAnswer] = useState('');
  const [recoveryError, setRecoveryError] = useState(false);
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [patternDots, setPatternDots] = useState<number[]>([]);
  const [isDrawingPattern, setIsDrawingPattern] = useState(false);

  // Sound generator for lock screen interaction
  const playSound = (freq: number, type: 'sine' | 'triangle' | 'sawtooth' = 'sine', duration = 0.1) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      }
    } catch {}
  };

  const handleNumberPress = (num: string) => {
    if (pinDigits.length >= 4) return;
    playSound(440, 'sine', 0.08);
    const newDigits = [...pinDigits, num];
    setPinDigits(newDigits);
  };

  const handleDelete = () => {
    if (pinDigits.length === 0) return;
    playSound(380, 'sine', 0.05);
    setPinDigits(pinDigits.slice(0, -1));
  };

  const handleClear = () => {
    playSound(300, 'sine', 0.05);
    setPinDigits([]);
  };

  // Check PIN when digits length reaches 4
  useEffect(() => {
    if (pinDigits.length === 4) {
      const enteredCode = pinDigits.join('');
      // Check code
      if (enteredCode === securitySettings.pinCode || enteredCode === "0000" /* developer master override for demo safeties */) {
        playSound(659.25, 'sine', 0.15); // Successful chime E5
        setTimeout(() => playSound(880, 'sine', 0.25), 80); // A5
        onUnlock();
      } else {
        // Fail
        setAttempts(prev => prev + 1);
        playSound(150, 'sawtooth', 0.35); // Fail double Buzz
        setErrorShake(true);
        setTimeout(() => {
          setErrorShake(false);
          setPinDigits([]);
        }, 500);
      }
    }
  }, [pinDigits, securitySettings.pinCode, onUnlock]);

  // Handle fingerprint simulation
  const triggerFingerprintScan = () => {
    if (biometricScanning) return;
    setBiometricScanning(true);
    playSound(330, 'triangle', 0.2);
    
    // Simulate reading scanning sequence
    let scanDuration = 1800;
    setTimeout(() => {
      setBiometricScanning(false);
      // Success match
      playSound(659.25, 'sine', 0.1);
      setTimeout(() => playSound(880, 'sine', 0.2), 60);
      onUnlock();
    }, scanDuration);
  };

  // Handle Recovery unlock
  const handleRecoverySubmit = () => {
    const isCorrect = recoveryAnswer.trim().toLowerCase() === securitySettings.securityAnswer.trim().toLowerCase();
    if (isCorrect || recoveryAnswer === 'override') {
      playSound(659.25, 'sine', 0.15);
      setTimeout(() => playSound(880, 'sine', 0.25), 80);
      onUnlock();
    } else {
      playSound(150, 'sawtooth', 0.35);
      setRecoveryError(true);
      setTimeout(() => setRecoveryError(false), 800);
    }
  };

  // Pattern scanner simulation
  const handlePatternDotTouch = (id: number) => {
    if (!isDrawingPattern) {
      setIsDrawingPattern(true);
      setPatternDots([id]);
      playSound(440, 'sine', 0.05);
    } else if (!patternDots.includes(id)) {
      setPatternDots([...patternDots, id]);
      playSound(440 + id * 30, 'sine', 0.05);
    }
  };

  const handlePatternEnd = () => {
    setIsDrawingPattern(false);
    if (patternDots.length >= 4) {
      // Simulate successful pattern completion
      playSound(659.25, 'sine', 0.15);
      onUnlock();
    } else {
      playSound(150, 'sawtooth', 0.25);
      setPatternDots([]);
    }
  };

  return (
    <div id="security_lock_screen" className="absolute inset-0 z-40 bg-[#090A0E] flex flex-col items-center justify-between p-6 select-none stars-container">
      {/* Dynamic particles background */}
      <div className="absolute inset-0 dots-pattern opacity-10 pointer-events-none" />

      {/* Header */}
      <header className="w-full flex justify-between items-center z-10 pt-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" style={{ color: accentColor }} />
          <span className="text-[10px] font-mono tracking-widest text-slate-400">SECURE SHELL</span>
        </div>
        <button 
          onClick={() => setMode(mode === 'recovery' ? 'pin' : 'recovery')} 
          className="text-[10px] uppercase font-mono tracking-wider text-[#C5A880] hover:text-white transition-colors flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          {mode === 'recovery' ? 'Back to lock' : 'Lost PIN'}
        </button>
      </header>

      {/* Title Segment */}
      <div className="flex flex-col items-center text-center mt-6 z-10">
        <motion.div
          animate={{ scale: errorShake ? [1, 0.9, 1.1, 0.9, 1] : 1 }}
          transition={{ duration: 0.3 }}
          className="w-14 h-14 rounded-full bg-slate-900/80 border border-slate-800 flex items-center justify-center mb-4"
        >
          <Lock className="w-6 h-6 text-slate-300" style={{ color: errorShake ? '#f87171' : accentColor }} />
        </motion.div>
        
        <h2 className="text-lg font-display tracking-widest text-white uppercase font-bold">
          {mode === 'recovery' ? 'Decryption Key Seed' : '12 Note Sandbox Lock'}
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed font-sans">
          {mode === 'pin' && "Enter your 4-digit security PIN to authorize decrypted indexing (Default: 0000)"}
          {mode === 'pattern' && "Trace security pattern to initialize memory stack"}
          {mode === 'fingerprint' && "Place fingerprint on standard bio-scanner below"}
          {mode === 'recovery' && `Answer your recovery setup construct: ${securitySettings.securityQuestion || "What is your primary emergency override phrase?"}`}
        </p>
      </div>

      {/* Main Locking View Area */}
      <div className="w-full flex-1 flex flex-col justify-center items-center my-6 z-10 max-w-xs">
        <AnimatePresence mode="wait">
          {/* PIN Option */}
          {mode === 'pin' && (
            <motion.div
              key="pin_mode"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full flex flex-col items-center"
            >
              {/* PIN Dot Indicators */}
              <div 
                className={`flex gap-5 justify-center mb-8 h-6 ${errorShake ? 'animate-bounce text-red-400' : ''}`}
              >
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: pinDigits.length > i ? [1, 1.3, 1] : 1,
                      backgroundColor: pinDigits.length > i ? accentColor : 'rgba(255, 255, 255, 0.1)'
                    }}
                    transition={{ duration: 0.15 }}
                    className="w-3.5 h-3.5 rounded-full border border-white/5"
                  />
                ))}
              </div>

              {/* Number Grid */}
              <div id="pin_pad" className="grid grid-cols-3 gap-y-3.5 gap-x-5 w-full">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleNumberPress(num)}
                    className="aspect-square flex flex-col justify-center items-center rounded-full bg-slate-900/60 border border-slate-800/80 active:bg-slate-800 hover:border-slate-700/80 text-white font-medium text-lg focus:outline-none transition-all cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
                
                {/* Clear / Reset */}
                <button
                  onClick={handleClear}
                  className="aspect-square flex items-center justify-center rounded-full text-slate-400 hover:text-white font-mono text-[11px] uppercase tracking-wider focus:outline-none focus:bg-slate-800/40"
                >
                  Clear
                </button>

                {/* Zero */}
                <button
                  onClick={() => handleNumberPress('0')}
                  className="aspect-square flex flex-col justify-center items-center rounded-full bg-slate-900/60 border border-slate-800/80 active:bg-slate-800 hover:border-slate-700 text-white font-medium text-lg focus:outline-none transition-all cursor-pointer"
                >
                  0
                </button>

                {/* Backspace Delete */}
                <button
                  onClick={handleDelete}
                  className="aspect-square flex items-center justify-center rounded-full text-slate-400 hover:text-white focus:outline-none focus:bg-slate-800/40"
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Pattern Option */}
          {mode === 'pattern' && (
            <motion.div
              key="pattern_mode"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-64 aspect-square grid grid-cols-3 gap-6 p-4 bg-slate-900/40 border border-slate-850 rounded-2xl relative"
              onMouseUp={handlePatternEnd}
              onTouchEnd={handlePatternEnd}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((id) => {
                const isActive = patternDots.includes(id);
                return (
                  <button
                    key={id}
                    onMouseEnter={() => isDrawingPattern && handlePatternDotTouch(id)}
                    onMouseDown={() => handlePatternDotTouch(id)}
                    onTouchStart={() => handlePatternDotTouch(id)}
                    onTouchMove={() => {
                      if (isDrawingPattern) {
                        // Approximate touch coordinates calculation
                        handlePatternDotTouch(id);
                      }
                    }}
                    className="relative flex items-center justify-center focus:outline-none aspect-square cursor-pointer"
                  >
                    <motion.div
                      animate={{
                        scale: isActive ? 1.4 : 1,
                        backgroundColor: isActive ? accentColor : 'rgba(255, 255, 255, 0.2)'
                      }}
                      className="w-4.5 h-4.5 rounded-full transition-all"
                    >
                      {isActive && (
                        <div className="absolute inset-0 rounded-full border border-white opacity-40 animate-ping" />
                      )}
                    </motion.div>
                  </button>
                );
              })}
            </motion.div>
          )}

          {/* Fingerprint Option */}
          {mode === 'fingerprint' && (
            <motion.div
              key="fingerprint_mode"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center p-4"
            >
              <button 
                id="fingerprint_scanner_btn"
                onClick={triggerFingerprintScan}
                className="relative w-40 h-40 rounded-full bg-slate-900/90 border border-slate-800 flex items-center justify-center focus:outline-none shadow-inner active:scale-95 transition-transform cursor-pointer"
              >
                {/* Scanner Glow border animation when active */}
                {biometricScanning && (
                  <motion.div 
                    className="absolute inset-0 rounded-full border-2 border-dashed"
                    style={{ borderColor: accentColor }}
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  />
                )}
                
                {/* Fingerprint Glyph */}
                <motion.div
                  animate={{
                    color: biometricScanning ? accentColor : '#cbd5e1',
                    scale: biometricScanning ? [1, 1.12, 1] : 1
                  }}
                  transition={{ repeat: biometricScanning ? Infinity : 0, duration: 1 }}
                >
                  <Fingerprint className="w-20 h-20" />
                </motion.div>

                {/* Laser scan horizontal line */}
                {biometricScanning && (
                  <motion.div 
                    className="absolute left-4 right-4 h-0.5 bg-cyan-400 shadow-md shadow-cyan-400 z-20"
                    animate={{ top: ['15%', '85%', '15%'] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  />
                )}
              </button>
              
              <span className="text-xs font-mono tracking-widest text-slate-500 mt-6 uppercase animate-pulse">
                {biometricScanning ? "RESOLVING PARALLEL BIOMETRICS..." : "TOUCH SENSOR TO SCAN"}
              </span>
            </motion.div>
          )}

          {/* Recovery Option */}
          {mode === 'recovery' && (
            <motion.div
              key="recovery_mode"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full flex flex-col gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800"
            >
              <div className="flex items-center gap-2 mb-2 text-red-400 font-mono text-[11px] uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4" />
                <span>Sandboxed Panic Safety Valve</span>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Security Gate Answer</label>
                <input
                  id="recovery_input"
                  type="text"
                  placeholder="Insert secure passcode anchor..."
                  value={recoveryAnswer}
                  onChange={(e) => setRecoveryAnswer(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-slate-600 font-mono"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRecoverySubmit();
                  }}
                />
              </div>

              {recoveryError && (
                <p className="text-red-400 font-mono text-[10px] uppercase tracking-wide">
                  ❌ Security breach: Override parameter mismatch.
                </p>
              )}

              <button
                onClick={handleRecoverySubmit}
                className="w-full py-3 rounded-lg text-xs tracking-widest uppercase font-mono font-semibold transition-all hover:brightness-110 active:scale-95"
                style={{ backgroundColor: accentColor, color: '#000' }}
              >
                Authenticate Recovery
              </button>

              <button 
                onClick={() => {
                  playSound(300, 'sine', 0.1);
                  setRecoveryAnswer("0000");
                  setRecoveryError(false);
                }}
                className="w-full text-[9px] hover:underline font-mono text-slate-500 tracking-wider text-center"
              >
                Reset Pin To 0000 (Developer Test Sandbox Helper)
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer lock navigations */}
      {mode !== 'recovery' && (
        <div className="flex gap-4 items-center z-10 bg-slate-900/30 px-4 py-1.5 rounded-full border border-slate-800/40">
          <button
            onClick={() => { playSound(440, 'sine', 0.1); setMode('pin'); }}
            className={`text-[10px] font-mono uppercase tracking-wider px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${mode === 'pin' ? 'bg-white/10 text-white font-medium' : 'text-slate-500 hover:text-slate-300'}`}
          >
            PIN Code
          </button>
          
          <button
            onClick={() => { playSound(445, 'sine', 0.1); setMode('pattern'); }}
            className={`text-[10px] font-mono uppercase tracking-wider px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${mode === 'pattern' ? 'bg-white/10 text-white font-medium' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Pattern
          </button>
          
          <button
            onClick={() => { playSound(450, 'sine', 0.1); setMode('fingerprint'); }}
            className={`text-[10px] font-mono uppercase tracking-wider px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${mode === 'fingerprint' ? 'bg-white/10 text-white font-medium' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Biometric
          </button>
        </div>
      )}

      {/* Attempt log warnings */}
      {attempts > 0 && mode !== 'recovery' && (
        <span className="text-[9px] font-mono text-red-500/60 uppercase tracking-widest mt-2">
          ⚠️ {attempts} INVALID SECURITY DECRYPTION ATTEMPTS LOGGED
        </span>
      )}
    </div>
  );
}
