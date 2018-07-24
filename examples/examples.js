
require('data-cube');
setOps = require('data-cube-print-console');

//uncomment to show horizontal lines
//setOps({compact: false});

const clog = console.log;
const show = x => {
  x.print();
  clog('-- info --');
  x.info();
};


x = [5,3,2].rand(100)
.$key(0,['Alice','Bob','Cath','Dan','Eli'])
.$key(1,['biology','chemistry','physics'])
.$key(2,['Autumn','Spring'])
.$label(0,'Student')
.$label(1,'Subject')
.$label(2,'Term');

clog(x)
x.print();
x.info();  



  
//!!!!!!!!!!! TO DO:
  
  
//--------------- examples ---------------//
  

//clog('');
//  const v = [5.67, 'a string', true, null, undefined, new Date(),
//    ()=>5, [5,6,7],   [8,9].toCube(), {a:5}, new Set([1, 2, 3, 4, 5]), /asd/].toCube();

//
//clog('----- 1-entry array -----');
//
//
//clog('----- 1-entry cube -----');
//
//
//clog('----- array -----') -  when can copy cube to array
//
//
//clog('----- vector -----');
//
//
//clog('----- dictionary -----');  - when can add keys
//
//
//clog('----- dictionary, all keys and labels -----');  -when can add keys and labels
//
//
//  clog('----- \'row vector\' -----');  -when can reshape
//
//
//  clog('----- \'row vector\', all keys and labels -----');   -when can reshape adn add keys and labels
//
//
//  clog('----- \'page vector\' -----');  -when can reshape
//
//
//  clog('----- \'page vector\', all keys and labels -----');  -when can reshape adn add keys and labels
//
//
//  clog('----- matrix -----');  -when can reshape
//
//
//  clog('----- \'date table\' -----');  -when can reshape and add keys
//
//
//  clog('----- matrix, all keys and labels  -----');  -when can reshape and add keys and labels
//
//
//  clog('----- multiple pages -----');  -when can reshape
//
//
//  clog('----- multiple pages, row keys, page labels -----');  -when can reshape and add keys and labels
//
//
//  clog('----- multiple pages, all keys and labels -----');  -when can reshape adn add keys and labels
