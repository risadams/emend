# Change log

## v1.1.0 (2025-05-01)

- Modernized the codebase with ES modules
- Removed AMD/CommonJS module pattern in favor of proper ES exports
- Updated class structure with private fields and modern syntax
- Replaced Gulp build system with esbuild
- Added multiple output formats (ESM, CommonJS, IIFE)
- Updated documentation to reflect modern usage
- Code quality improvements throughout

## v1.0.4

- Resolve #11 - ensure checking nulls on anchor tags with no href.

## v1.0.3

- Resolve #4 - init function now takes an option argument as opposed to a string salt.

## v1.0.2

- Fix #2 - Corrected an issue wherein the init loop was too greedy with anchor selection.

## v1.0.1

- Fix #1 - Corrected an issue wherein the init loop would end after the first non mailto link.

## v1.0.0

initial release.
