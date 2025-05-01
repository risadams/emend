/**
 * @module emend
 * @version 1.1.0
 * @license MIT
 * @author Ris Adams <emend@risadams.com>
 * @description A lightweight JavaScript library for protecting mailto anchor links from web scrapers.
 * @copyright Copyright © 2021-2025 Ris Adams. All rights reserved.
 * 
 * Emend provides email address protection by encoding mailto links to prevent harvesting by spambots.
 * It works by obfuscating email addresses in mailto: links, making them unreadable to automated scrapers
 * while maintaining functionality for human users.
 * 
 * Features:
 * - Encode and protect standard mailto: links
 * - Support for explicitly marked mailto: links with custom prefix
 * - Configurable behavior through options
 * - No dependencies, pure vanilla JavaScript
 */

/**
 * Creates a new encoder function that uses XOR encryption with a salt.
 * 
 * The cipher function transforms email addresses into hex-encoded strings
 * that are unreadable to automated scrapers but can be decoded when needed.
 * 
 * @private
 * @param {string} salt - The salt to use for the encoder. Acts as an encryption key.
 * @returns {function} - A function that encrypts strings using the provided salt.
 */
const cipher = (salt) => {
  /**
   * Converts a text string into an array of character codes.
   * @private
   * @param {string} text - The input text to convert
   * @returns {number[]} - Array of character codes
   */
  const str2chr = (text) => text.split('').map(c => c.charCodeAt(0));
  
  /**
   * Converts a number to a two-character hex string.
   * @private
   * @param {number} n - The number to convert to hex
   * @returns {string} - Two-character hex representation
   */
  const byteHex = (n) => ("0" + Number(n).toString(16)).substr(-2);
  
  /**
   * Applies the XOR operation with the salt to a character code.
   * @private
   * @param {number} code - The character code to encrypt
   * @returns {number} - The encrypted character code
   */
  const applySalt = (code) => str2chr(salt).reduce((a, b) => a ^ b, code);

  // Return the encryption function
  return (text) => text.split('')
    .map(str2chr)
    .map(applySalt)
    .map(byteHex)
    .join('');
};

/**
 * Creates a new decoder function that reverses the cipher encryption.
 * 
 * The decipher function converts the hex-encoded strings back to the
 * original email addresses when needed.
 * 
 * @private
 * @param {string} salt - The salt used for encoding. Must match the encoder salt.
 * @returns {function} - A function that decrypts strings using the provided salt.
 */
const decipher = (salt) => {
  /**
   * Converts a text string into an array of character codes.
   * @private
   * @param {string} rawVal - The input text to convert
   * @returns {number[]} - Array of character codes
   */
  const str2chr = (rawVal) => rawVal.split('').map(c => c.charCodeAt(0));
  
  /**
   * Applies the XOR operation with the salt to a character code.
   * @private
   * @param {number} code - The character code to decrypt
   * @returns {number} - The decrypted character code
   */
  const applySalt = (code) => str2chr(salt).reduce((a, b) => a ^ b, code);

  // Return the decryption function
  return (text) => String(text).match(/.{1,2}/g)
    .map(hex => parseInt(hex, 16))
    .map(applySalt)
    .map(charCode => String.fromCharCode(charCode))
    .join('');
};

/**
 * Default configuration options for Emend.
 * 
 * @private
 * @constant
 * @type {Object}
 * @property {string} explicitPrefix - Prefix character used to mark explicit mailto links
 * @property {string} salt - Encryption key used for encoding/decoding
 * @property {boolean} explicitOnly - When true, only protects explicitly marked mailto links
 * @property {number} domRemoveDelay - Milliseconds to wait before removing the temporary link element
 * @property {number} sendClickDelay - Milliseconds to wait before triggering the click event
 */
const DEFAULT_OPTIONS = {
  explicitPrefix: '@',
  salt: '',
  explicitOnly: false,
  domRemoveDelay: 1200,
  sendClickDelay: 500
};

/**
 * @class Emend
 * A lightweight JavaScript library for protecting mailto anchor links from web scrapers.
 * Emend works by encoding email addresses in mailto: links to prevent them from being
 * harvested by spam bots, while still making them usable for human visitors.
 */
class Emend {
  /**
   * @private
   * @type {string} - The version number of the library
   */
  #version = '1.1.0';
  
  /**
   * @private
   * @type {Object} - Configuration options
   */
  #options;
  
  /**
   * @private
   * @type {Function} - The encryption function
   */
  #cipher;
  
  /**
   * @private
   * @type {Function} - The decryption function
   */
  #decipher;

  /**
   * Creates a new Emend instance with the specified options.
   * 
   * @constructor
   * @param {Object} [options={}] - Initial configuration options
   * @param {string} [options.explicitPrefix='@'] - Character used to mark explicit mailto links
   * @param {string} [options.salt=''] - Encryption key used for encoding/decoding
   * @param {boolean} [options.explicitOnly=false] - Only protect explicitly marked mailto links
   * @param {number} [options.domRemoveDelay=1200] - Delay before removing temporary DOM elements
   * @param {number} [options.sendClickDelay=500] - Delay before triggering click events
   */
  constructor(options = {}) {
    this.#options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Initializes Emend by scanning the document for mailto links and protecting them.
   * This method should be called after the DOM has loaded.
   * 
   * @public
   * @param {Object} [options={}] - Configuration options that override constructor options
   * @param {string} [options.explicitPrefix] - Character used to mark explicit mailto links
   * @param {string} [options.salt] - Encryption key used for encoding/decoding
   * @param {boolean} [options.explicitOnly] - Only protect explicitly marked mailto links
   * @param {number} [options.domRemoveDelay] - Delay before removing temporary DOM elements
   * @param {number} [options.sendClickDelay] - Delay before triggering click events
   * @returns {Emend} The Emend instance for chaining
   * 
   * @example
   * // Initialize with default options
   * emend.init();
   * 
   * @example
   * // Initialize with custom options
   * emend.init({
   *   salt: 'YOUR_SECRET_KEY',
   *   explicitPrefix: '#',
   *   explicitOnly: true
   * });
   */
  init(options = {}) {
    this.#options = { ...this.#options, ...options };
    this.#cipher = cipher(this.#options.salt);
    this.#decipher = decipher(this.#options.salt);

    const anchors = document.querySelectorAll('a');
    anchors.forEach(anchor => {
      const href = anchor.getAttribute('href');
      if (!href || href.indexOf('mailto:') !== 0) return;

      const explicitMailto = `mailto:${this.#options.explicitPrefix}`;
      
      if (href.indexOf(explicitMailto) === 0) {
        // Handle explicitly marked mailto links
        anchor.setAttribute('data-emended-mailto', href.replace(explicitMailto, ''));
        anchor.href = '#';
      } else if (!this.#options.explicitOnly) {
        // Handle normal mailto links when not in explicit only mode
        this.protect(anchor);
      }

      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        this.sendMail(e.target);
      });
    });

    return this;
  }

  /**
   * Encrypts a string and returns the encrypted result.
   * This is primarily used to encode email addresses.
   * 
   * @public
   * @param {string} valueToEncrypt - The string to encrypt (typically an email address)
   * @returns {string} The encrypted string in hex format
   * 
   * @example
   * const encoded = emend.encode('user@example.com');
   * // Returns something like: '7124312b362a282e6f65363a282e6429'
   */
  encode(valueToEncrypt) {
    return this.#cipher(valueToEncrypt.replace('mailto:', ''));
  }

  /**
   * Decrypts a previously encrypted string.
   * 
   * @public
   * @param {string} encodedValue - The encrypted string to decrypt
   * @returns {string} The decrypted string (typically an email address)
   * 
   * @example
   * const decoded = emend.decode('7124312b362a282e6f65363a282e6429');
   * // Returns: 'user@example.com'
   */
  decode(encodedValue) {
    return this.#decipher(encodedValue);
  }

  /**
   * Protects an anchor element by encoding its mailto link.
   * 
   * @public
   * @param {HTMLElement} element - The anchor element to protect
   * @returns {HTMLElement} The protected anchor element (for chaining)
   * 
   * @example
   * // Manually protect a specific link
   * const link = document.getElementById('email-link');
   * emend.protect(link);
   */
  protect(element) {
    const val = element.getAttribute('href').replace('mailto:', '');
    element.setAttribute('data-emended-mailto', this.encode(val));
    element.setAttribute('href', '#');
    return element;
  }

  /**
   * Decodes an emended anchor element and triggers a mailto link.
   * Creates a hidden temporary anchor and simulates a click event
   * to prevent browsers from blocking the mailto operation.
   * 
   * @public
   * @param {HTMLElement} element - The anchor element to decode
   * 
   * @example
   * // Manually trigger the mailto action for a protected link
   * const link = document.getElementById('protected-email');
   * emend.sendMail(link);
   */
  sendMail(element) {
    if (!element.hasAttribute('data-emended-mailto')) return;
    
    const mailto = `mailto:${this.decode(element.getAttribute('data-emended-mailto'))}`;
    
    // Create a temporary dom element and simulate a click to launch the mailto link
    const dom = document.createElement('a');
    dom.style.visibility = 'hidden';
    dom.style.position = 'absolute';
    dom.href = mailto;
    document.body.appendChild(dom);
    
    setTimeout(() => dom.click(), this.#options.sendClickDelay);
    setTimeout(() => document.body.removeChild(dom), this.#options.domRemoveDelay);
  }

  /**
   * Gets the current version of the Emend library.
   * 
   * @public
   * @returns {string} The version number
   * 
   * @example
   * const version = emend.version;
   * console.log(`Using Emend version ${version}`);
   */
  get version() {
    return this.#version;
  }
}

// Create a singleton instance
const emend = new Emend();

// Export as module
export default emend;
export { Emend };
