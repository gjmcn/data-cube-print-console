{
  'use strict';
  
  const Table = require('tty-table');
  const chalk = require('chalk');
  const helper = require('data-cube-helper');
  
  
  //--------------- options and prep ---------------//
  
  //high-level table options
  const dp = 4;
 	const maxPrint = 2000;
  const maxStr = 40;
  const maxMag = 1e6;  //scientific notation used for larger values

  //table options for print method
  const printOps = {
    borderStyle: (typeof window === 'object' ? 2 : 1),
    borderColor : "gray",
    headerAlign : "right",
    paddingLeft: -5,
    paddingRight: 1,
    align : "right",
    compact: true
  };
  
  
  //--------------- auxiliary ---------------//
  
  //truncate string if longer than max
  const truncate = (s,mx) => s.length > mx ? s.slice(0,mx) + ' ...' : s;
      
  //format functions
  let fmt = {
    number: x => {
      let str;
      if (Number.isInteger(x)) str = '' + x;
      else if (Math.abs(x) >= maxMag || Math.abs(x) < Math.pow(10,-dp)) {
        str = (+x.toPrecision(dp)).toExponential();
      }
      else str = x.toFixed(dp);
      return chalk.yellow(str);
    },
    string: x => chalk.green(`'${truncate(x,maxStr)}'`),
    boolean: x => chalk.magenta(x),
    null: () => chalk.red('null'),
    undefined: () => chalk.red('undefined'),
    function: x => chalk.cyan('function'),    
    date: x => chalk.cyan(('' + x).replace(/\s*\([^\)]*\)/, '')),
    cube: x => chalk.cyan('cube (entries: ' + x.length + ', shape: ' + x._s + ')'),
    array: x => chalk.cyan('array (entries: ' + x.length +')'),
    other: x => chalk.cyan(truncate('' + x, maxStr)),
    index: x => chalk.gray('(' + x + ')'),
    key: x => chalk.white(truncate('' + x, maxStr)),
    label: x => chalk.white(x),
    faint: x => chalk.gray(x)
  };
  
  //entry format function
  const basicType = new Set(['number', 'string', 'boolean', 'undefined', 'function']);
  const fmtEntry = x => {
    const t = typeof x;
    if (basicType.has(t)) return fmt[t](x);
    if (x === null) return fmt.null();
    if (Array.isArray(x)) return fmt[x._data_cube ? 'cube' : 'array'](x);
    if (x instanceof Date) return fmt.date(x);
    return fmt.other(x);
  };

  
  //--------------- print cube or standard array ---------------//

  helper.addArrayMethod('print', function(retStr) {
    helper.assert.single(retStr);
    let str;
    //use info if empty or too many entries
    if (this.length > maxPrint || this.length === 0) return this.info(retStr);
    //cube
    else if (this._data_cube) {
      const [nr, nc, np] = this._s;
      if (this._k) {
        var [rk,ck,pk] = this._k;
      }
      if (this._l) {
        var [rl,cl,pl] = this._l;
      }
      //1st row: col and row labels in 1st entry then col indices/keys
      let colInfo = new Array(nc+1);
      let topLeft = '';
      if (cl) topLeft += fmt.label(cl + ' →');
      if (rl) {
        if (cl) topLeft += '\n';
        topLeft += fmt.label(rl + ' ↓');
      }
      if (ck) colInfo = [topLeft].concat(Array.from(ck.keys()).map(fmt.key));
      else {
        colInfo[0] = topLeft;
        for (let c=0; c<nc; c++) colInfo[c+1] = fmt.index(c);
      }
      colInfo = colInfo.map(a => ({value:a}));
      //pages
      str = '';
      let rkAr, pkAr;
      if (rk) rkAr = Array.from(rk.keys());
      if (pk) pkAr = Array.from(pk.keys());
      for (let p=0; p<np; p++) {
        if (np > 1 || pk || pl) {
          str += `\n  ${(pl ? fmt.label(pl) : fmt.faint('page')) + fmt.faint(':')} ${
                 pk ? fmt.key(pkAr[p]) : fmt.index(p)}`;
        }
        let data = new Array(nr);
        for (let r=0; r<nr; r++) {
          let thisRow = new Array(nc+1);
          thisRow[0] = rk ? fmt.key(rkAr[r]) : fmt.index(r);
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
      Table([], this.map( (a,i) => [fmt.index(i), fmtEntry(a)]), printOps).render() + '\n';
    //print and return
    if (retStr) return str;
    console.log(str);
    return this;
  });
  
  
  //--------------- print info on cube or standard array ---------------//
  
  helper.addArrayMethod('info', function(retStr) {
    helper.assert.single(retStr);
    let str;
    if (this._data_cube) {
      const keys = [];
      const labels = [];
      if (this._k) this._k.forEach((a,i) => a ? keys.push(helper.dimName[i]) : 0);
      if (this._l) this._l.forEach((a,i) => a ? labels.push(helper.dimName[i]): 0);
      str =
        '\n  entries:  ' + this.length + 
        '\n  shape:    ' + this._s +
        '\n  keys:     ' + (keys.length   ? keys   : '(none)') + 
        '\n  labels:   ' + (labels.length ? labels : '(none)') +
        '\n';
    }
    else str = '\n  (standard array)\n  entries: ' + this.length + '\n';
    if (retStr) return str;
    console.log(str);
    return this;
  });
  
  
  //--------------- export function to set compact ---------------//
  
  module.exports = ops => {
    if (ops.hasOwnProperty('compact')) printOps.compact = ops.compact;
  }

}