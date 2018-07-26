Print [Data-Cubes](https://github.com/gjmcn/data-cube) in the terminal.

## Usage

Install: `npm install --save @gjmcn/data-cube-print-console`

Load: `require('@gjmcn/data-cube-print-console');`

The module adds two methods to `Array.prototype`:

* `print`: print a cube (or a standard array)

* `info`: print summary information about a cube (or a standard array)

The methods call `console.log` and return the cube/array.

Currently, the only formatting option is whether to draw lines between rows:

```js
const setOps = require('@gjmcn/data-cube-print-console');
setOps({compact: false});   //draw lines
```

## Notes

* Since `print` and `info` return the calling array, they can be used to print intermediate results. For example, `x.sum().print().sqrt()`.

* `print` and `info` do *not* convert a standard array to a cube like core Data-Cube methods do.

* This module *cannot* be used in the browser; see [data-cube-print-html](https://github.com/gjmcn/data-cube-print-html).

