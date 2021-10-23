# Emend

[![CodeFactor](https://www.codefactor.io/repository/github/risadams/emend/badge)](https://www.codefactor.io/repository/github/risadams/emend)

A simple library that will allow you to replace an e-mail address with an encoded version of the address.

## Install

```sh
npm install emend
```

## Usage

include the library in your project:

```html
<head>
  <script src="emend.js"></script>
</head>
```

and initialize it in your code (just before the end `body` tag):

```html
<script>
  emend.init('YOUR SALT VALUE');
</script>
```

### Option Defaults

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

## Contribute

If you think this could be better, please [open an issue](https://github.com/risadams/Emend/issues/new)!

Please note that all interactions in this organization fall under our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE) © 1996+ Ris Adams
