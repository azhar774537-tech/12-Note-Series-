/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Premium Encrypted Local Storage Utility
 * Uses a dynamic key-based scrambling algorithm (simulating secure AES-256 local encryption)
 * to ensure that raw text content stored in localStorage remains unintelligible gibberish 
 * if inspected.
 */

// Custom salt for encryption
const MASTER_SALT = "12_NOTE_SERIES_SECURE_SALT_99x#a";

/**
 * Encrypts a string using a dynamic key.
 * If no custom PIN is provided, a fallback built-in key is used.
 */
export function encryptText(text: string, pin: string = "1212"): string {
  if (!text) return "";
  
  const key = `${pin}_${MASTER_SALT}`;
  let result = "";
  
  // Custom scrambling algorithm helper
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const keyChar = key.charCodeAt(i % key.length);
    // XOR + modular shift
    const shifted = (charCode ^ keyChar) + 13;
    result += String.fromCharCode(shifted);
  }
  
  // Base64 encode the output to make it safely storeable in JSON
  try {
    return btoa(encodeURIComponent(result));
  } catch (e) {
    // Fallback if there are specialized characters
    return btoa(unescape(encodeURIComponent(result)));
  }
}

/**
 * Decrypts a scrambled Base64 string back using the dynamic key.
 */
export function decryptText(encryptedText: string, pin: string = "1212"): string {
  if (!encryptedText) return "";
  
  try {
    // Base64 decode
    let scrambled = "";
    try {
      scrambled = decodeURIComponent(atob(encryptedText));
    } catch {
      scrambled = decodeURIComponent(escape(atob(encryptedText)));
    }
    
    const key = `${pin}_${MASTER_SALT}`;
    let result = "";
    
    for (let i = 0; i < scrambled.length; i++) {
      const charCode = scrambled.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      // reverse shift + reverse XOR
      const unshifted = (charCode - 13) ^ keyChar;
      result += String.fromCharCode(unshifted);
    }
    
    return result;
  } catch (e) {
    console.error("Decryption failed. Invalid key or corrupted data.", e);
    return "[CORRUPTED DECRYPTION KEY]";
  }
}

/**
 * Generates a mock fingerprint authentication option.
 * Checks if the device hypothetical fingerprint scanner resolves correctly.
 */
export function checkBiometricSupport(): boolean {
  // Web browser context simulation
  return typeof window !== 'undefined' && ('PublicKeyCredential' in window);
}
