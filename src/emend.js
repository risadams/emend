/**
 * Creates a new encoder.
 * @param {string} salt - The salt to use for the encoder.
 * @returns {function} - The encoder.
 */
const cipher = (salt) => {
  const str2chr = (text) => text.split('').map(c => c.charCodeAt(0));
  const byteHex = (n) => ("0" + Number(n).toString(16)).substr(-2);
  const applySalt = (code) => str2chr(salt).reduce((a, b) => a ^ b, code);

  return (text) => text.split('')
    .map(str2chr)
    .map(applySalt)
    .map(byteHex)
    .join('');
};

/**
 * Creates a new decoder.
 * @param {string} salt - The salt to use for the decoder.
 * @returns {function} - The decoder.
 */
const decipher = (salt) => {
  const str2chr = (rawVal) => rawVal.split('').map(c => c.charCodeAt(0));
  const applySalt = (code) => str2chr(salt).reduce((a, b) => a ^ b, code);

  return (text) => String(text).match(/.{1,2}/g)
    .map(hex => parseInt(hex, 16))
    .map(applySalt)
    .map(charCode => String.fromCharCode(charCode))
    .join('');
};

/**
 * Default configuration options
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
 */
class Emend {
  #version = '1.1.0';
  #options;
  #cipher;
  #decipher;

  /**
   * @constructor
   * @param {Object} options - Initial options to override defaults
   */
  constructor(options = {}) {
    this.#options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Initialize the emend object.
   * @param {Object} options - The options to use.
   * @returns {Emend} The emend instance for chaining.
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
   * Encrypts a string and returns the encrypted string.
   * @param {string} text - The string to encrypt.
   * @returns {string} The encrypted string.
   */
  encode(valueToEncrypt) {
    return this.#cipher(valueToEncrypt.replace('mailto:', ''));
  }

  /**
   * Decrypts a string that was encrypted with the encode() method.
   * @param {string} encodedValue The string to decrypt.
   * @returns {string} The decrypted string.
   */
  decode(encodedValue) {
    return this.#decipher(encodedValue);
  }

  /**
   * Finds an anchor element and strips the mailto link from it.
   * Encodes the mailto link as an emended data attribute.
   * @param {HTMLElement} element The anchor element to be protected.
   * @returns {HTMLElement} The anchor element that was protected.
   */
  protect(element) {
    const val = element.getAttribute('href').replace('mailto:', '');
    element.setAttribute('data-emended-mailto', this.encode(val));
    element.setAttribute('href', '#');
    return element;
  }

  /**
   * Decodes an emended anchor element and triggers a mailto: link
   * Creates a hidden new anchor and simulates a click event to prevent the browser from blocking the click.
   * @param {HTMLElement} element The anchor element to decode
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
   * Get the version of the library
   * @returns {string} The version number
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
