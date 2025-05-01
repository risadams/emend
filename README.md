# Emend.js

![GitHub package.json version](https://img.shields.io/github/package-json/v/risadams/emend)
[![MIT License](https://img.shields.io/github/license/risadams/emend)](https://github.com/risadams/emend/blob/master/LICENSE)

A lightweight JavaScript library for protecting mailto anchor links from web scrapers.

## Overview

Emend.js helps protect email addresses in your website by obfuscating mailto links, making them unreadable to automated scrapers while maintaining functionality for human users. It works by encoding email addresses and storing them as data attributes, then restoring them when clicked.

## Features

- 🛡️ **Email Protection** - Automatically encodes all `mailto:` links
- 🔒 **Selective Protection** - Optional "explicit-only" mode to only protect marked links
- 🔑 **Encryption** - Encrypts email addresses using XOR cipher with a configurable salt
- 🚀 **Lightweight** - Less than 3KB minified, no external dependencies
- 🌐 **Multiple Formats** - Available as ESM, CommonJS, or IIFE for any project
- 📱 **Browser Support** - Works in all modern browsers
- 🧪 **Fully Tested** - 100% test coverage

## Installation

### npm

```bash
npm install emend
```

### Direct Download

Download the latest version from the [releases page](https://github.com/risadams/emend/releases).

## Usage

### ES Modules (Recommended)

```javascript
import emend from 'emend';

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  emend.init({
    salt: 'YourSecretSalt'  // Provide a unique salt for better security
  });
});
```

### CommonJS

```javascript
const emend = require('emend');

document.addEventListener('DOMContentLoaded', () => {
  emend.init({ salt: 'YourSecretSalt' });
});
```

### Browser (IIFE)

```html
<script src="path/to/emend.iife.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    window.emend.init({ salt: 'YourSecretSalt' });
  });
</script>
```

## HTML Usage

### Standard Mailto Links

Any standard mailto links will be automatically protected:

```html
<a href="mailto:contact@example.com">Contact Us</a>
```

### Explicitly Marked Links

You can pre-encode emails or mark specific links for protection:

```html
<!-- Using the default @ prefix -->
<a href="mailto:@encodedValue">Email Us</a>

<!-- With a different prefix (if configured) -->
<a href="mailto:#user@example.com">Email Us</a>
```

## Configuration Options

```javascript
emend.init({
  // Secret key for encryption (strongly recommended to set this)
  salt: 'YourSecretSalt', 
  
  // Character used to mark explicit mailto links
  explicitPrefix: '@',
  
  // Only protect explicitly marked links
  explicitOnly: false,
  
  // Milliseconds to wait before triggering click events
  sendClickDelay: 500,
  
  // Milliseconds to wait before removing temporary DOM elements
  domRemoveDelay: 1200
});
```

## API Reference

### `emend.init(options)`

Initializes the library with optional configuration.

```javascript
// Basic initialization
emend.init();

// With options
emend.init({
  salt: 'YourSecretSalt',
  explicitPrefix: '#',
  explicitOnly: true
});
```

Returns the emend instance for chaining.

### `emend.encode(email)`

Manually encode an email address or string.

```javascript
const encoded = emend.encode('user@example.com');
// Returns a hex-encoded string
```

### `emend.decode(encodedValue)`

Decode a previously encoded string.

```javascript
const decoded = emend.decode('7124312b362a282e6f65363a282e6429');
// Returns 'user@example.com' if the salt matches
```

### `emend.protect(element)`

Manually protect a specific anchor element.

```javascript
const link = document.getElementById('my-email');
emend.protect(link);
```

Returns the element for chaining.

### `emend.sendMail(element)`

Manually trigger the email client for a protected link.

```javascript
const link = document.getElementById('protected-email');
emend.sendMail(link);
```

### `emend.version`

Get the current version of the library.

```javascript
console.log(`Using Emend version ${emend.version}`);
```

## Examples

The `examples` folder contains working demonstrations:

- `basic.html` - Simple implementation
- `advanced.html` - Advanced features and configuration options
- `index.html` - Overview with API documentation

## Browser Compatibility

Emend.js works in all modern browsers:

- Chrome 60+
- Firefox 54+
- Safari 10.1+
- Edge 16+

## Security Considerations

- The salt value should be unique to your site and kept secret
- For best results the salt value should be randomized on each page load
- The library uses XOR encryption which is sufficient for obfuscating emails but not suitable for sensitive data
- Even with protection, a determined scraper could still extract emails with enough effort

## Development

### Building the project

```bash
npm run build
```

### Running tests

```bash
npm test
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please read the [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) files.

## Support

For support, please check [SUPPORT.md](SUPPORT.md) or open an issue on the GitHub repository.
