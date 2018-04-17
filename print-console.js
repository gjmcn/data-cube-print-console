{
  'use strict'
  
  const Table = require('tty-table');
  const chalk = require('chalk');
  const clog = console.log;
  
  
  //--------------- options and prep ---------------//
  
  //high-level table options
  const dp = 4;
 	const maxPrint = 1e3;
  const maxStr = 40
  const maxMag = 1e6;

  //table ops for print
  const printOps = {
    borderStyle: (typeof window == 'object' ? 2 : 1),
    borderColor : "gray",
    headerAlign : "right",
    paddingLeft: -6,
    paddingRight: 1,
    align : "right",
    compact: true
  };
  
  //check new array properties do not already exist
  ['print','info'].map(a => {
    if (a in Array.prototype) {
      throw new Error(a + ' is already a property of Array.protoype');
    }
  });

  
  //--------------- auxiliary ---------------//

  const expand = {r: 'row', c: 'column', p: 'page'};
  
  //truncate string if longer than max
  const truncate = (s,mx) => s.length > mx ? s.slice(0,mx) + ' ...' : s;
  
  //shape of cube as a comma-sep list
  const shapeStr = x => ['r','c','p'].map(a => x._d_c_[a]).join(', ')
  
  //entry format functions
  let fmt = {
    number: x => {
      let str;
      if (Number.isInteger(x)) str = '' + x;
      let prec = Math.max(1,dp);
      if (x !== 0 && (Math.abs(x) >= maxMag || Math.abs(x) < Math.pow(10,-prec))) {
        str =  (+x.toPrecision(prec)).toExponential();
      }
      str = x.toFixed(dp);
      return chalk.yellow(str);
    },
    string: x => chalk.green(`'${truncate(x,maxStr)}'`),
    boolean: x => chalk.magenta(x),
    null: () => chalk.red('null'),
    undefined: () => chalk.red('undefined'),
    function: () => chalk.cyan('function'),
    date: x => chalk.cyan(('' + x).replace(/\s*\([^)]*\)/, '')),
    cube: x => chalk.cyan('cube (entries: ' + x.length + ', shape: ' + shapeStr(x) + ')'),
    array: x => chalk.cyan('array (entries: ' + x.length +')'),
    other: x => chalk.cyan(truncate('' + x, maxStr)),
    index: x => chalk.gray('(' + x + ')'),
    key: x => chalk.white(x),
    label: x => chalk.white(x),
    faint: x => chalk.gray(x)
  };

  //fmt entry
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

  Array.prototype.print = function(retStr) {
        
    let str = '';
    
    //cube
    if (this._d_c_)  {
      if (this.length > maxPrint) {
        clog(`\n   (number of entries > ${maxPrint})`);
        this.info();
      }
      else if (this.length === 0) this.info();
      else {
        clog('');
        const dc = this._d_c_;
        const nr = dc.r, nc = dc.c, np = dc.p;
        const e = dc.e;
        let rowKey, pageKey, pageLabel;
        if (e) {
          if (e.rk) rowKey = true;
          if (e.pk) pageKey = true;
          if (e.pl) pageLabel= true;
        }
        let colInfo = new Array(nc+1);
        //topLeft (col and row label) and col indices/keys
        if (e) {
          let topLeft = ''
          if (e.cl) topLeft += fmt.label(e.cl + ' →');
          if (e.rl) {
            if (e.cl) topLeft += ' \n';
            topLeft += fmt.label(e.rl + ' ↓');
          }
          if (e.ck) colInfo = [topLeft].concat(e.ca.map(fmt.key));
          else {
            colInfo[0] = topLeft;
            for (let c=0; c<nc; c++) colInfo[c+1] = fmt.index(c);
          }
        }
        else {
          colInfo[0] = '';
          for (let c=0; c<nc; c++) colInfo[c+1] = fmt.index(c);         
        }
        colInfo = colInfo.map(a => ({value:a})) //, paddingLeft: 1, paddingRight: 1}));   //???????????????inefficient? - even need the padding?
        //print pages
        for (let p=0; p<np; p++) {
          if (np > 1 || pageKey || pageLabel) {
            str += `  ${(pageLabel ? fmt.label(e.pl) : fmt.faint('page')) + fmt.faint(':')} ${
                       pageKey ? fmt.key(e.pa[p]) : fmt.index(p)}`;
          }
          let data = new Array(nr);
          for (let r=0; r<nr; r++) {
            let thisRow = new Array(nc+1);
            thisRow[0] = rowKey ? fmt.key(e.ra[r]) : fmt.index(r);
            for (let c=0; c<nc; c++) {
              thisRow[c+1] = fmtEntry(this[r + nr*c + nr*nc*p]); 
            }
            data[r] = thisRow;
          }
          str += Table(colInfo, data, printOps).render() + '\n';
        }
      }
      str = str.slice((str[0] === '\n' ? 1 : 0), -1);  //remove \n from both ends of string
    }
    //standard array
    else str = fmt.faint('\n  (standard array)') + 
      Table([], this.map( (a,i) => [fmt.index(i), fmtEntry(a)]), {...printOps}).render();
    //print or return string
    if (retStr) return str;
    else {
      clog(str);
      return this;
    }
  
  };
  
  
  //--------------- print info on cube or standard array ---------------//
  
  Array.prototype.info = function(retStr) {
    let str;
    if (this._d_c_) {
      const dc = x._d_c_;
      const keys = [];
      const labels = [];
      if (dc.e) {
        ['rk', 'ck' ,'pk'].map(a => {
          if (dc.e[a]) keys.push(expand[a[0]]);               
        }); 
        ['rl', 'cl' ,'pl'].map(a => {
          if (dc.e[a]) labels.push(expand[a[0]]);               
        });
      }
      str = 
        '\n  entries: ' + x.length + 
        '\n  shape:   ' + shapeStr(this) +
        '\n  keys:    ' + (keys.length ? keys.join(', ')   : '--') + 
        '\n  labels:  ' + (labels.length ? labels.join(', ') : '--');
    }
    else str = '\n  standard array\n  entries: ' + this.length;
    if (retStr) return str;
    else {
      clog(str);
      return this;
    }
  };
  
  
  //--------------- export function to set compact ---------------//
  
  module.exports = ops => {
    if ('compact' in ops) printOps.compact = ops.compact;
  }
     
}
