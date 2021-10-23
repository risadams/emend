/* global define, module, document */

/**
 * @module emend
 * @version 1.0.3
 * @license MIT
 * @author Ris Adams <emend@risadams.com>
 * @description A lightweight JavaScript library for protecting mailto anchor links from web scrapers.
 * @copyright Copyright © 2021 Ris Adams. All rights reserved.
 */

; (function (root, factory, name) {
  'use strict';
  root[name] = factory();
  if (typeof define === 'function' && define.amd) {
    define(function () { return root[name]; });
  } else if (typeof exports === 'object') {
    module.exports = root[name];
  }
})((typeof window === 'object' && window) || this, function () {
  'use strict';

  /**
   * Creates a new encoder.
   * @param {string} salt - The salt to use for the encoder.
   * @returns {function} - The encoder.
   */
  const cipher = salt => {
    const str2chr = text => text.split('').map(c => c.charCodeAt(0));
    const byteHex = n => ("0" + Number(n).toString(16)).substr(-2);
    const applySalt = code => str2chr(salt).reduce((a, b) => a ^ b, code);

    return text => text.split('')
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
  const decipher = salt => {
    const str2chr = rawVal => rawVal.split('').map(c => c.charCodeAt(0));
    const applySalt = code => str2chr(salt).reduce((a, b) => a ^ b, code);

    return text => String(text).match(/.{1,2}/g)
      .map(hex => parseInt(hex, 16))
      .map(applySalt)
      .map(charCode => String.fromCharCode(charCode))
      .join('');
  };

  /**
   * @class emend
   * A lightweight JavaScript library for protecting mailto anchor links from web scrapers.
   */
  class Emend {

    /**
     * @constructor
     */
    constructor() {
      this.__version = '1.0.3';
      this.__self = this;

      /**
       * @param {String}  explicitPrefix - The prefix to use for explicit emendations.
       * @param {String}  salt - The salt to use for emendations.
       * @param {Boolean} explicitOnly - Whether to only emend explicit elements.
       * @param {Number}  domRemoveDelay - The delay in milliseconds to remove the emendation from the DOM.
       * @param {Number}  sendClickDelay - The delay in milliseconds to send a click event to the emendation.
       *
       * @private
       */
      this.options = {
        explicitPrefix: '@',
        salt: '',
        explicitOnly: false,
        domRemoveDelay: 1200,
        sendClickDelay: 500
      };

      /**
       * Initialize the emend object.
       * @param {Object} options - The options to use.
       * @returns {Emend} The emend object.
       */
      this.init = (opts) => {
        this.options = Object.assign(this.options, opts);

        this.cipher = cipher(this.options.salt);
        this.decipher = decipher(this.options.salt);

        var anchors = document.querySelectorAll('a');
        for (var i = 0; i < anchors.length; i++) {
          var anchor = anchors[i];
          var href = anchor.getAttribute('href');
          if (href.indexOf('mailto:') === 0) {
            if (!(this.options.explicitOnly) && href.indexOf(('mailto:' + this.options.explicitPrefix)) !== 0) {
              continue; //ignore mailto: links that are not explicitly prefixed, regardless of explicitOnly setting
            } else if (href.indexOf(('mailto:' + this.options.explicitPrefix)) === 0) {
              anchor.setAttribute('data-emended-mailto', href.replace(('mailto:' + this.options.explicitPrefix), ''));
              anchor.href = '#';
            } else {
              if (!(this.options.explicitOnly)) {
                this.protect(anchor);
              }
            }
          } else {
            continue; // ignore non-mailto links
          }

          anchor.addEventListener('click', (e) => {
            e.preventDefault();
            var target = e.target;
            this.__self.sendMail(target);
          });
        }
      };

      /**
       * Encrypts a string and returns the encrypted string.
       *
       * @param {string} text - The string to encrypt.
       * @returns {string} The encrypted string.
       * @private
       */
      this.encode = (valueToEncrypt) => {
        valueToEncrypt = valueToEncrypt.replace('mailto:', '');
        return this.cipher(valueToEncrypt);
      };

      /**
       * Decrypts a string that was encrypted with the encode() method.
       *
       * @param {string} valueToDecrypt The string to decrypt.
       * @returns {string} The decrypted string.
       * @throws {Error} Throws an error if the valueToDecrypt is not a valid encrypted string.
       * @private
       */
      this.decode = (encodedValue) => {
        return this.decipher(encodedValue);
      };

      /**
       * Finds an anchor element and strips the mailto link from it.
       * Encodes the mailto link as an emended data attribute.
       *
       * @param {HTMLElement} anchorElement The anchor element to be protected.
       * @returns {HTMLElement} The anchor element that was protected.
       * @private
       */
      this.protect = (element) => {
        var val = element.getAttribute('href');
        val = val.replace('mailto:', ''); // strip any misplaced mailto references
        element.setAttribute('data-emended-mailto', this.encode(val));
        element.setAttribute('href', '#');
      };

      /**
       * Decodes an emended anchor element and triggers a mailto: link
       * Creates a hidden new anchor and simulates a click event to prevent the browser from blocking the click.
       *
       * @param  {HTMLElement} element The anchor element to decode
       * @returns {void}
       * @private
       */
      this.sendMail = (element) => {
        if (element.hasAttribute('data-emended-mailto')) {
          let mailto = 'mailto:' + this.decode(element.getAttribute('data-emended-mailto'));

          //create a temporary dom element and simulate a click to launch the mailto link
          var dom = document.createElement('a');
          dom.style.visibility = 'hidden';
          dom.style.position = 'absolute';
          dom.href = mailto;
          document.body.appendChild(dom);
          setTimeout(() => { dom.click(); }, this.options.sendClickDelay);
          setTimeout(() => { document.body.removeChild(dom); }, this.options.domRemoveDelay);
        }
      };
    }
  }
  const emend = new Emend();
  return emend;
}, 'emend');
