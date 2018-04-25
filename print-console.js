{
  'use strict';
  
  const Table = require('tty-table');
  const chalk = require('chalk');
  const addArrayMethod = require('data-cube-helper').addArrayMethod
  
  
  //--------------- options and prep ---------------//
  
  //high-level table options
  const dp = 4;
 	const maxPrint = 2000;
  const maxStr = 40;
  const maxMag = 1e6;

  //table options for print method
  const printOps = {
    borderStyle: (typeof window === 'object' ? 2 : 1),
    borderColor : "gray",
    headerAlign : "right",
    paddingLeft: -7,
    paddingRight: 1,
    align : "right",
    compact: true
  };
  
  
  //--------------- auxiliary ---------------//

  const expand = new Map([ ['r','row'], ['c','colomn'], ['p','page'] ]);
  
  //truncate string if longer than max
  const truncate = (s,mx) => s.length > mx ? s.slice(0,mx) + ' ...' : s;
  
  //shape of cube as a comma-separated list
  const shapeStr = x => ['r','c','p'].map(a => x._d_c_.get(a).join(', ');
  
  //format functions
  let fmt = {
    number: x => {
      let str;
      if (Number.isInteger(x)) str = '' + x;
      else {
        let prec = Math.max(1,dp);
        if (Math.abs(x) >= maxMag || Math.abs(x) < Math.pow(10,-prec)) {
          str = (+x.toPrecision(prec)).toExponential();
        }
        else str = x.toFixed(dp);
      }
      return chalk.yellow(str);
    },
    string: x => chalk.green(`'${truncate(x,maxStr)}'`),
    boolean: x => chalk.magenta(x),
    null: () => chalk.red('null'),
    undefined: () => chalk.red('undefined'),
    function: x => chalk.cyan('function'),    
    date: x => chalk.cyan(('' + x).replace(/\s*\([^\)]*\)/, '')),
    cube: x => chalk.cyan('cube (entries: ' + x.length + ', shape: ' + shapeStr(x) + ')'),
    array: x => chalk.cyan('array (entries: ' + x.length +')'),
    other: x => chalk.cyan(truncate('' + x, maxStr)),
    index: x => chalk.gray('(' + x + ')'),
    key: x => chalk.white(x),
    label: x => chalk.white(x),
    faint: x => chalk.gray(x)
  };

  //entry format function
  const basicType = new Set(['number', 'string', 'boolean', 'undefined', 'function']);
  const fmtEntry = x => {
    const t = typeof x;
    if (basicType.has(t)) return fmt[t](x);
    if (x === null) return fmt.null();
    if (Array.isArray(x)) return fmt[x._d_c_ ? 'cube' : 'array'](x);
    if (x instanceof Date) return fmt.date(x);
    return fmt.other(x);
  };

  
  //--------------- print cube or standard array ---------------//

  addArrayMethod('print', function(retStr) {   
    let str;
    const dc = this._d_c_;
    //use info if empty or too many entries
    if (this.length > maxPrint || this.length === 0) str = this.info(true);
    //cube
    else if (dc) {
      const nr = dc.get('r'), nc = dc.get('c'), np = dc('p');
      const e = dc.get('e');
      if (e) {  //ck, pk, pk will be
        if (e.has('rk')) var rowKeys  = Array.from(e.get('rk').keys());
        if (e.has('ck')) var colKeys  = Array.from(e.get('ck').keys());
        if (e.has('pk')) var pageKeys = Array.from(e.get('pk').keys());
        var rowLabel  = e.get('rl');        
        var colLabel  = e.get('cl');        
        var pageLabel = e.get('pl');        
      }
      //1st row: col and row labels in 1st entry then col indices/keys
      let colInfo = new Array(nc+1);
      if (e) {
        let topLeft = ''
        if (colLabel) topLeft += fmt.label(colLabel + ' →');
        if (rowLabel) {
          if (colLabel) topLeft += '\n';
          topLeft += fmt.label(rowLabel + ' ↓');
        }
        if (colKeys) colInfo = [topLeft].concat(colKeys.map(fmt.key));
        else {
          colInfo[0] = topLeft;
          for (let c=0; c<nc; c++) colInfo[c+1] = fmt.index(c);
        }
      }
      else {
        colInfo[0] = '';
        for (let c=0; c<nc; c++) colInfo[c+1] = fmt.index(c);         
      }
      colInfo = colInfo.map(a => ({value:a}));
      //pages
      str = '';
      for (let p=0; p<np; p++) {
        if (np > 1 || pageKeys || pageLabel) {
          str += `\n  ${(pageLabel ? fmt.label(pageLabel) : fmt.faint('page')) + fmt.faint(':')} ${
                     pageKeys ? fmt.key(pageKeys[p]) : fmt.index(p)}`;
        }
        let data = new Array(nr);
        for (let r=0; r<nr; r++) {
          let thisRow = new Array(nc+1);
          thisRow[0] = rowKeys ? fmt.key(rowKeys[r]) : fmt.index(r);
          for (let c=0; c<nc; c++) {
            thisRow[c+1] = fmtEntry(this[r + nr*c + nr*nc*p]); 
          }
          data[r] = thisRow;
        }
        str += Table(colInfo, data, printOps).render() + '\n';
      }
    }
    //standard array
    else str = fmt.faint('\n  (standard array)') + 
      Table([], this.map( (a,i) => [fmt.index(i), fmtEntry(a)]), printOps).render() + 
      '\n';
    //print or return string
    if (retStr) return str;
    else {
      console.log(str);
      return this;
    }
  });
  
  
  //--------------- print info on cube or standard array ---------------//
  
  addArrayMethod('info', function(retStr) {
    let str;
    const dc = this._d_c_;
    if (dc) {
      const keys = [];
      const labels = [];
      if (dc.e) {
        ['rk', 'ck' ,'pk'].map(a => {
          if (dc.e.has(a) keys.push(expand.get(a[0]));
        }); 
        ['rl', 'cl' ,'pl'].map(a => {
          if (dc.e.has(a)) labels.push(expand.get(a[0]));
        });
      }
      str =
        '\n  entries:  ' + this.length + 
        '\n  shape:    ' + shapeStr(this) +
        '\n  keys:     ' + (keys.length   ? keys.join(', ')   : '(none)') + 
        '\n  labels:   ' + (labels.length ? labels.join(', ') : '(none)') +
        '\n';
    }
    else str = '\n  (standard array)\n  entries: ' + this.length + '\n';
    if (retStr) return str;
    else {
      console.log(str);
      return this;
    }
  });
  
  
  //--------------- export function to set compact ---------------//
  
  module.exports = ops => {
    if (ops.hasOwnProperty('compact')) printOps.compact = ops.compact;
  }

}