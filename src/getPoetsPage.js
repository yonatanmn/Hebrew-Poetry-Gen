import {hebToUtf} from './encoder'
//var Xray = require('x-ray');
//var phantom = require('x-ray-phantom');
var mongoose = require('mongoose');
var R = require('ramda');
var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));
import Poet from './poetModel';
var Nightmare = require('nightmare');

const shironetSearchUrl = 'http://shironet.mako.co.il/search?q=';

function getPoetSearchPageFromShironet(name) {
  return {name, searchPage: shironetSearchUrl + encodeURI(name)};
}

function getPoetUrl(searchPage) {
  return Nightmare()
    .goto(searchPage)
    //.wait('.global_main_shadow')
    .evaluate(function () {
      console.log('evalute')
        return document.querySelector('.search_results a').href
    })
    .end();
}

async function updatePoet(poet) {
  console.log('updatePoet before getPoetUrl', poet.name)

  let pageUrl = await getPoetUrl(poet.searchPage);
  console.log('pageUrl', pageUrl)
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

import { getPoets } from './DB';


async function skipAlreadySavedPoets(poetNames){
  let poets = await getPoets();
  let fetchedNames = poets.map(p=>p.name);
  let inPoetsList = R.contains(R.__, fetchedNames);
  return R.filter(R.compose(R.not,inPoetsList))(poetNames);
}


export default async function run() {


  let poetsFile = await fs.readFileAsync('./assets/poets.txt');
  let poetNames = hebToUtf(poetsFile).split(',').filter(p=>p);
  //console.log('poetNames before skipping', poetNames);
  poetNames = await skipAlreadySavedPoets(poetNames);
  console.log('poetNames after skipping', poetNames);
  //return;


  let poetsWithResultsPages = poetNames.map(getPoetSearchPageFromShironet);

  //try {
    //poets = await Promise.all(poetsResultsPages.map(getPoetUrl));
    //console.log('poets', poets);
    //console.log('poetsWithResultsPages', poetsWithResultsPages);

    await Promise.all(poetsWithResultsPages.map(updatePoet));
    console.log('done');

  //} catch (error) {
  //  console.error('error! ', error);
  //}

}