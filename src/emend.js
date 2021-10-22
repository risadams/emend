/* global define, module, document */

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

  const decipher = salt => {
    const str2chr = rawVal => rawVal.split('').map(c => c.charCodeAt(0));
    const applySalt = code => str2chr(salt).reduce((a, b) => a ^ b, code);

    return text => String(text).match(/.{1,2}/g)
      .map(hex => parseInt(hex, 16))
      .map(applySalt)
      .map(charCode => String.fromCharCode(charCode))
      .join('');
  };

  class Emend {
    constructor() {
      this._version = '1.0.0';
      this.__self = this;

      this.init = (salt) => {
        this.cipher = cipher(salt);
        this.decipher = decipher(salt);

        var anchors = document.querySelectorAll('a');
        for (var i = 0; i < anchors.length; i++) {
          var anchor = anchors[i];
          var href = anchor.getAttribute('href');
          if (href.indexOf('mailto') !== 0) {
            return;
          }
          if (href.indexOf('mailto:@') === 0) {
            anchor.setAttribute('data-emended-mailto', href.replace('mailto:@', ''));
            anchor.href = '#';
          }
          else {
            this.protect(anchor);
          }
          anchor.addEventListener('click', (e) => {
            e.preventDefault();
            var target = e.target;
            this.__self.sendMail(target);
          });
        }
      };

      this.encode = (valueToEncrypt) => {
        valueToEncrypt = valueToEncrypt.replace('mailto:', '');
        return this.cipher(valueToEncrypt);
      };

      this.decode = (encodedValue) => {
        return this.decipher(encodedValue);
      };

      this.protect = (element) => {
        var val = element.getAttribute('href');
        val = val.replace('mailto:', ''); // strip any misplaced mailto references
        element.setAttribute('data-emended-mailto', this.encode(val));
        element.setAttribute('href', '#');
      };

      this.sendMail = (element) => {
        if (element.hasAttribute('data-emended-mailto')) {
          let mailto = 'mailto:' + this.decode(element.getAttribute('data-emended-mailto'));

          //create a temporary dom element and simulate a click to launch the mailto link
          var dom = document.createElement('a');
          dom.style.visibility = 'hidden';
          dom.style.position = 'absolute';
          dom.href = mailto;
          document.body.appendChild(dom);
          dom.click();
          document.body.removeChild(dom);
        }
      };
    }
  }
  const emend = new Emend();
  return emend;
}, 'emend');
