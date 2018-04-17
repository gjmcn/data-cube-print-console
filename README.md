Print [DataCubes](https://github.com/gjmcn/data-cube) in the Node.js console, browser and browser console.

## Install/Load

Uses the Universal Module Definition (UMD) so can be used in any JavaScript environment. In Node.js:

* install:
    ```
    npm install --save data-cube-print-console
    ```
* load:
   ```js
   require('data-cube-print-console');
   ```

Currently, the only formatting option is whether to draw horizontal lines. Printed tables are 'compact' by default &mdash; lines are not drawn. To change this:

```js
const setOps = require('data-cube-print-console');
setOps({compact: false});  //draw horizontal lines
```

## Use
The package adds two methods to `Array.prototype`:

`print`: print a cube (or a standard array)

`info`: print summary information about a cube (or a standard array)

If not passed an argument, the above methods print the relevant information and return the array/cube. This makes it easy to print intermediate results during a computation, e.g. `x.sum().print().log()`.

If passed a truthy argument, `print` and `info` return the string to be printed, but do not print anything.

## Notes

* the default formatting makes it easy to indentify what things are (colors are not used in the browser):

	* entries are colored based on type
	* strings are quoted
	* labels and keys are white; indices are gray and are wrapped in parentheses;

* `print` and `info` do *not* convert a standard array to a cube like core DataCube methods

* use [data-cube-print-html](https://github.com/gjmcn/data-cube-print-html) to print cubes as HTML tables

