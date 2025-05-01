# Emend

[![CodeFactor](https://www.codefactor.io/repository/github/risadams/emend/badge)](https://www.codefactor.io/repository/github/risadams/emend)

A simple library that will allow you to protect email addresses from web scrapers by encoding them.

## Install

```sh
npm install emend
```

## Usage

### Modern ES Module (Recommended)

```html
<head>
  <script type="module">
    import emend from './path/to/emend.esm.js';
    
    document.addEventListener('DOMContentLoaded', () => {
      emend.init({
        salt: 'YOUR_SALT_VALUE'
      });
    });
  </script>
</head>
```

### Traditional Script Tag

```html
<head>
  <script src="./path/to/emend.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      emend.init({
        salt: 'YOUR_SALT_VALUE'
      });
    });
  </script>
</head>
```

### NPM Package (Node.js Environment)

```js
// ESM
import emend from 'emend';

// CommonJS
const emend = require('emend');

// Initialize
emend.init({
  salt: 'YOUR_SALT_VALUE'
});
```

## Configuration Options

```js
/**
 * @param {String}  explicitPrefix - The prefix to use for explicit emendations.
 * @param {String}  salt - The salt to use for emendations.
 * @param {Boolean} explicitOnly - Whether to only emend explicit elements.
 * @param {Number}  domRemoveDelay - The delay in milliseconds to remove the emendation from the DOM.
 * @param {Number}  sendClickDelay - The delay in milliseconds to send a click event to the emendation.
 */
{
  explicitPrefix: '@',
  salt: '',
  explicitOnly: false,
  domRemoveDelay: 1200,
  sendClickDelay: 500
};
```

## Development

```sh
# Install dependencies
npm install

# Build for production
npm run build

# Development with watch mode
npm run dev
```

## Contribute

If you think this could be better, please [open an issue](https://github.com/risadams/Emend/issues/new)!

Please note that all interactions in this organization fall under our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE) © 2021-2025 Ris Adams
