{
  'use strict'
  
  const {table, getBorderCharacters} = require('table');
  const colors = require('colors');
  const clog = console.log;
  
  
  //---------- options ----------//
  
  //high-level table options
  const dp = 4;
 	const maxPrint = 1e3;
  const maxMag = 1e6;
  
  //default colors
  const theme = {
    number:    'yellow',
    string:    'green',
    boolean:   'magenta',
    null:      'magenta',
    undefined: 'magenta',
    date:      'red',
    other:     'cyan',
    index:     'gray',
    key:       'white',
    label:     'white'
  };
  
  //table ops for jsc
  const getOpsJsc = nCol => {
    const ops = { 
      border: getBorderCharacters('void'),
      columnDefault: { paddingLeft: 3, paddingRight: 1 },
      drawHorizontalLine: () => { return false }
    };
    const cols = {};
    for (let i=0; i<nCol; i++) cols[i] = {alignment: 'right'};
    ops.columns = cols;
    return ops;
  };
  
  //table ops for jsci
  const opsJsci = {
    columns: { 0: { alignment: 'left' }, 1: { alignment: 'left' } },
    border: getBorderCharacters('void'),
    columnDefault: { paddingLeft: 3, paddingRight: 1 },
    drawHorizontalLine: () => { return false }
  };
  
  
  //---------- prep ----------//

  //check new string properties used by colors do not already exist
  Object.keys(theme).map(a => {
    if (a in String.prototype) {
      throw new Error(a + ' is already a property of String.prototype')
    }
  });
  colors.setTheme(theme);
  
  //check new array properties do not already exist
  ['jsc','jsci'].map(a => {
    if (a in Array.prototype) {
      throw new Error(a + ' is already a property of Array.protoype');
    }
  });

  
  //---------- auxiliary ----------//

  const expand = {r: 'row', c: 'column', p: 'page'};
  
  //shape of cube as a comma-sep list
  const shapeStr = x => ['r','c','p'].map(a => x._d_c_[a]).join(', ')
  
  //entry format functions
  let fmt = {
    number: x => {
      if (Number.isInteger(x)) return ('' + x).number;
      let prec = Math.max(1,dp);
      if (x !== 0 && (Math.abs(x) >= maxMag || Math.abs(x) < Math.pow(10,-prec))) {
        return (+x.toPrecision(prec)).toExponential().number;
      }
      return x.toFixed(dp).number;
    },
    string: x => {
      if (x.length === 0) return '<empty string>'.string;
      let maxLen = 25;
      return(x.length > maxLen ? x.slice(0,maxLen) + ' ...' : x).string;
    },
    boolean: x => ('' + x).boolean,
    null: () => 'null'.null,
    undefined: () => 'undefined'.undefined,
    date: x => x.toUTCString().date,
    function: () => 'function'.other,
    cube: x => ('cube (entries: ' + x.length + ', shape: ' + shapeStr(x) + ')').other,
    array: x => ('array (entries: ' + x.length +')').other,
    other: x => ('' + x).other,
    index: x => ('' + x).index,
    key: x => x.key,
    label: x => x.label 
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

  
  //---------- print cube or standard array ----------//
  
  Array.prototype.jsc = function(ret) {
    
    //cube
    if (this._d_c_)  {
      if (this.length > maxPrint) {
        clog(`\n   (number of entries > ${maxPrint})`);
        this.jsci();
      }
      else if (this.length === 0) this.jsci();
      else {
        clog('');
        const dc = this._d_c_;
        const nr = dc.r, nc = dc.c, np = dc.p;
        const e = dc.e;
        const ops = getOpsJsc(nc+1);
        let rowKey, pageKey, pageLabel;
        if (e) {
          if (e.rk) rowKey = true;
          if (e.pk) pageKey = true;
          if (e.pl) pageLabel= true;
        }
        let colInfo = new Array(nc+1);
        
        //topLeft (col and row label) and col indices/keys
        if (e) {
          //let topLeft = ''
          //if (e.cl) topLeft += fmt.label(e.cl) + '▶';
          //if (e.rl) {
          //if (e.cl) topLeft += '---';
          //  topLeft += fmt.label(e.rl) + '▼'
          //}
          //          if (e.ck) colInfo = [topLeft].concat(e.ca.map(fmt.key));
          if (e.ck) colInfo = [''].concat(e.ca.map(fmt.key));
          else {
            colInfo[0] = ''; //topLeft;
            for (let c=0; c<nc; c++) colInfo[c+1] = fmt.index(c);
          }
          if (e.cl) colInfo[1] = `${fmt.label(e.cl)}:  ${colInfo[1]}`; 
        }
        else {
          colInfo[0] = '';
          for (let c=0; c<nc; c++) colInfo[c+1] = fmt.index(c);         
        }
        
        //print pages
        for (let p=0; p<np; p++) {
          if (np > 1 || pageKey || pageLabel) {
            clog(`   [${(pageLabel ? fmt.label(e.pl) : fmt.index('page')) + ':'} ${
                       pageKey ? fmt.key(e.pa[p]) : fmt.index(p)}]`);
          }
          
          -POSS REDUCE PAGE INFO INDENT
          -MAKE COLOR OF ':' CONSISTENT
          
          
          let data = new Array(nr+1);
          data[0] = colInfo;
          for (let r=0; r<nr; r++) {
            let thisRow = new Array(nc+1);
            thisRow[0] = rowKey ? fmt.key(e.ra[r]) : fmt.index(r);
            for (let c=0; c<nc; c++) {
              thisRow[c+1] = fmtEntry(this[r + nr*c + nr*nc*p]); 
            }
            data[r+1] = thisRow;
          }
          if (e && e.rl) data[1][0] = `${fmt.label(e.rl)}:  ${data[1][0]}`;
          clog(table(data,ops));
        }
      }
    }
      
    //standard array
    else {
      clog('\n   standard array, default printing:\n')
      clog(this);
    }
  
    return arguments.length > 0 ? arg : this;
  };
  
  
  //---------- print info on cube or standard array ----------//
  
  Array.prototype.jsci = function(ret) {
    if (this._d_c_) {
      const dc = x._d_c_;
      const y = [
        ['entries:', x.length],
        ['shape:', shapeStr(this)]
      ];
      const keys = [];
      const labels = [];
      if (dc.e) {
        ['rk', 'ck' ,'pk'].map(a => {
          if (dc.e[a]) keys.push(expand(a[0]));               
        }); 
        ['rl', 'cl' ,'pl'].map(a => {
          if (dc.e[a]) labels.push(expand(a[0]));               
        });
      }
      y.push(['keys:'  , keys.length   ? keys.join(', ')   : '--']);
      y.push(['labels:', labels.length ? labels.join(', ') : '--']);    
      clog('');
      clog(table(y,opsJsci));
    }
    else clog('\n   standard array, entries: ' + this.length);
    return arguments.length > 0 ? arg : this;
  };
  
  //exported function can overwrite the format functions
  module.exports = newFmt => fmt = {...fmt, ...newFmt};
   
}
