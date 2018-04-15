{
  'use strict'
  
  const {table, getBorderCharacters} = require('table');
  const colors = require('colors');

  const clog = console.log;

  
  //---------- options ----------//
  
  const dp = 4;
 	const maxPrint = 1e4;
  const maxMag = 1e6;
  const theme = {
    number:    ['green','bold'],
    string:    ['magenta','bold'],
    boolean:   ['yellow','bold'],
    null:      'red',
    undefined: 'red',
    other:     'cyan',
    key:       'white',
    index:     'gray',
    label:     ['white', 'bold']
  };
  
  
  //---------- prep ----------//
  
  //check new array properties do not already exist
  ['print', 'info'].map(a => {
  if (a in Array.prototype) {
    throw new Error(a + ' is already a property of Array.protoype');
  }
  });
  
  //check new string properties used by colors do not already exist
  Object.keys(theme).map(a => {
    if (a in String.prototype) {
      throw new Error(a + ' is already a property of String.prototype')
    }
  });
  colors.setTheme(theme);

  
  //---------- auxiliary ----------//

  const expand = {r: 'row', c: 'column', p: 'page'};
  
  //format numbers
  const fmt = (x) => {
    let prec = Math.max(1);
    if (x !== 0 && (Math.abs(x) >= maxMag || Math.abs(x) < Math.pow(10,-prec))) {
      return (+x.toPrecision(prec)).toExponential();
    }
    return x.toFixed(dp);
	}

  //get summary info on cube in array-of-arrays format for table
  const getInfo = x => {
    const dc = x._d_c_;
    const y = [
      ['entries:', fmt(x.length)],
      ['shape:', ['r','c','p'].map(a => fmt(dc[a])).join(', ')]
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
    return y;
  }
  
  //print info, x is a cube
  Array.prototype.info = function() {
    const y = getInfo(this);
    const ops = {
      columns: {
        0: { alignment: 'left' },
        1: { alignment: 'left' }
      },
      border: getBorderCharacters('void')
    };
    clog(table(y,ops));
    return this;
  };
  
  //print, this can be a cube or standard array
  Array.prototype.print = function() {
    if (this._d_c_)  {//a cube
      const dc = this._d_c_;
      const {nr,nc,np} = dc;
      if (this.length === 0) {  //empty cube
        this.info();
        return this;
      }
      for (let p=0; p<np; p++) {    //pages 
        //DO !!!
      }
    }
    else {  //standard array
      clog('(standard array)');
      clog(this);
    }
    return this;
  };
  
  
    WORKING, NOW:
    
    -HOW PRINT IN INTERACTIVE MODE WITHOUT CALLING PRINT()? - DOES REPL CALL TO STRING?
    -FORMAT INFO TABLE - INC NUMBERS - JUST DONT CALL FORMAT?
    -PUT DP ARG BACK INTO fmt SINCE NEED IT FOR INTS?
    -DO NON-EMPTY TABLES
    -CHECK EVERYTHING!!!!!!
      
  
  
}
  

//??!! HOW ALLOW PRINTING WITHOUT HAVING TO CALL PRINT IN CONSOLE?
//  DOES REPL AUTO CALL toString???


  //test
  //Object.keys(theme).map(a => console.log(a[a])); 
  
  
  
  
  //DO NOT EXPORT ANYTHING; ATTCH   print() and info() methods
  // RETURN THE ARRAY   - how can make so automatically prints correctly when hit eg x   in console?
  //IS THIS ONLY FOR NODE REPL

