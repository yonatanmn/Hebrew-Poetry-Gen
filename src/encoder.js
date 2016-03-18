'use strict';


var Iconv = require('iconv').Iconv;

const hebEncoding = 'ISO-8859-8';
//'CP1255'
var iconv = new Iconv(hebEncoding, 'UTF-8//TRANSLIT//IGNORE');

export function hebToUtf(content){
  var buffer = iconv.convert(content);
  return buffer.toString('utf8');
}


