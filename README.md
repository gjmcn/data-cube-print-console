Print [Data-Cubes](https://github.com/gjmcn/data-cube) in the terminal.

## Usage

Install: `npm install --save @gjmcn/data-cube-print-console`

Load: `require('@gjmcn/data-cube-print-console');`

The package adds two methods to `Array.prototype`:

* `print`: print a cube (or a standard array)

* `info`: print summary information about a cube (or a standard array)

If called with no argument (or a falsy argument), the above methods pass a formatted string representating the cube/array to `console.log` and return the cube/array.

When passed a truthy argument, `print` and `info` return the formatted string (and do not print anything).

Currently, the only formatting option is whether to draw lines between rows:

```js
const setOps = require('data-cube-print-console');
setOps({compact: false});   //draw lines
```

## Notes

* `print` and `info` can be used to print intermediate results, e.g. `x.sum().print().sqrt()`.

* the default formatting makes it easy to identify what things are:

	* entries are colored by type
	* strings are quoted
	* labels and keys are white; indices are gray and are wrapped in parentheses

* `print` and `info` do *not* convert a standard array to a cube like core Data-Cube methods do


* this package cannot currently be used in the browser; use [data-cube-print-html](https://github.com/gjmcn/data-cube-print-html) to print cubes as HTML tables

