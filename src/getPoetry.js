//var fs = require('fs');
var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));
var Xray = require('x-ray');
var phantom = require('x-ray-phantom');

import {hebToUtf} from './encoder'

/*
async function getPoets(){
  let poets = await fs.readFileAsync('./assets/poets.txt');
  return hebToUtf(poets).split(',');
}
*/

//xrayAsync

const shironetSearchUrl = 'http://shironet.mako.co.il/search?q=';

function getPoetPageFromShironet(poet){
  return shironetSearchUrl + encodeURI(poet);
}

function getPoetUrl(poetResultPage){
  let xr = Xray().driver(phantom({webSecurity: false})); //add this for JS rendered pages

  return new Promise((resolve, reject) => {
    xr(poetResultPage, '.search_results', 'a@href')((err, resp)=>{
      if(!err){
        console.log('q');
        resolve(resp);
      } else {
        reject(err);
      }
    })
  });
}

export default async function run(){
  let poetsFile = await fs.readFileAsync('./assets/poets.txt');
  let poets = hebToUtf(poetsFile).split(',');
  let poetsResultsPages = poets.map(getPoetPageFromShironet);

  let results = await Promise.all(poetsResultsPages.map(getPoetUrl))
  console.log(results);
}