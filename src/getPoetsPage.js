import {hebToUtf} from './encoder'
var Xray = require('x-ray');
var phantom = require('x-ray-phantom');
var mongoose = require('mongoose');
var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));
import Poet from './poetModel';


const shironetSearchUrl = 'http://shironet.mako.co.il/search?q=';

function getPoetSearchPageFromShironet(name) {
  return {name, searchPage: shironetSearchUrl + encodeURI(name)};
}

function getPoetUrl(searchPage) {
  //console.log('getUrl, ', poet.name);
  let xr = Xray().driver(phantom({webSecurity: false})); //add this for JS rendered pages

  return new Promise((resolve, reject) => {
    xr(searchPage, '.search_results', 'a@href')((err, resp)=> {
      if (!err && resp) {
        //console.log('getUrl resolve, ', poet.name);
        resolve(resp);
      } else {
        //console.log('getUrl reject, ', poet.name);
        reject(err);
      }
    })
  });
}

async function updatePoet(poet) {
  console.log('updatePoet before getPoetUrl', poet.name)

  let pageUrl = await getPoetUrl(poet.searchPage);
  let {name} = poet;
  let query = {name};
  let update = {name, pageUrl, fetchDate: Date.now()};
  if (!pageUrl) {
    return;
  }
  return new Promise((resolve, reject) => {

    Poet.findOneAndUpdate(query, update, {upsert: true, setDefaultsOnInsert: true}, (err, poet) => {
      if (err) {
        console.log('findOneAndUpdate reject', poet)
        reject(err)
      }
      else {
        console.log('findOneAndUpdate resolve', poet);
        resolve(poet);
      }
  })
  });

}


export default async function run() {


  let poetsFile = await fs.readFileAsync('./assets/poets.txt');
  let poetNames = hebToUtf(poetsFile).split(',');


  let poetsWithResultsPages = poetNames.map(getPoetSearchPageFromShironet);

  //try {
    //poets = await Promise.all(poetsResultsPages.map(getPoetUrl));
    //console.log('poets', poets);
    console.log('poetsWithResultsPages', poetsWithResultsPages);

    await Promise.all(poetsWithResultsPages.map(updatePoet));
    console.log('done');

  //} catch (error) {
  //  console.error('error! ', error);
  //}

}