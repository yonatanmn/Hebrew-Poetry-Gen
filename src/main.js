import "babel-polyfill";
//require("babel-core/register");
//require("babel-polyfill");
'use strict';

import getPoetry from './getPoetry';
import getPoetsPage from './getPoetsPage';

console.log('start');

//var Xray = require('x-ray');
//var phantom = require('x-ray-phantom');

//var http = require('http');
//var mkdirp = require('mkdirp');
//var request = require('request');
var mongoose = require('mongoose');

let uri = 'mongodb://yonatanmn:poetGen13@ds013559.mlab.com:13559/poetry_gen';
mongoose.connect(uri);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));


(async function run(){
  //await getPoetsPage();
  await getPoetry();
  console.log('close');
  db.close();
}());


