//var fs = require('fs');
var Promise = require("bluebird");
//var fs = Promise.promisifyAll(require("fs"));
//var Xray = require('x-ray');
//var phantom = require('x-ray-phantom');
var mongoose = require('mongoose');
import Poet from './poetModel';
import Song from './songModel';
var Nightmare = require('nightmare');
//var nightmare = Nightmare({ show: true })
var R = require('ramda');


//function removeLineBreaks(text){
//  if(!text){return ''; }
//  console.log('removeLineBreaks');
//  //console.log(text);
//
//  return text.replace(/(\r\n|\n|\r)/gm,"");
//}

function getSong(songLink) {
  //console.log('aa');
  //console.log(arguments);
  //console.log(songLink);
  //if(!songLink){return Promise.resolve()}
//try {
  return Nightmare()
    .goto(songLink)
    .wait('.global_main_shadow')
    .evaluate(function (songLink) {
      console.log(document.querySelector('span.artist_song_name_txt').innerText);
      return {
        name: document.querySelector('span.artist_song_name_txt').innerText,
        lyrics: document.querySelector('span.artist_lyrics_text').innerText,
        url: songLink //browser scope
      }
    }, songLink)
    .end();
//} catch(e){
//  console.log('e!!', songLink)
//}

}
function getPoetSongsLinks(poetPageUrl) {

  return Nightmare()
    .goto(poetPageUrl)
    //.type('input[title="Search"]', 'github nightmare')
    //.click('#uh-search-button')
    .wait('.global_main_shadow')
    .evaluate(function () {
      return [].slice.call(document.querySelectorAll('.artist_player_songlist')).map(n=>n.href)
    })
    .end();

  //let xr = Xray().driver(phantom({webSecurity: false}));
    //.driver(phantom({webSecurity: false})); //add this for JS rendered pages
  //return new Promise((resolve, reject) => {
  //  if(!poetPageUrl){resolve('')}
  //  //console.log(poetPageUrl);
  //
  //  xr(poetPageUrl, ['span.artist_normal_txt a@href'])((err, songsLinks)=> {
  //    console.log('songsLinks', poetPageUrl, songsLinks)
  //    if (!err && songsLinks) {
  //      //console.log(poetPageUrl)
  //      resolve(songsLinks);
  //    } else {
  //      console.log('error in xr getPoetSongsLinks');
  //
  //      reject(err);
  //    }
  //  });
  //});
}

function saveSong(song){
  return new Promise((rs, rj)=>{
    let s = new Song(song);
    s.save(err=>{
      if (err) {rj(err)}
      else(rs());
    })
  })
}

async function fetchSongs(poet) {
  //return new Promise((resolve, reject) => {
  let songsLinks = await getPoetSongsLinks(poet.pageUrl);
  //console.log('songsLinks',songsLinks);

  //try {
    let songs = await Promise.all(songsLinks.map(getSong));
    //console.log('songs',songs);
    return songs.map(s=>{s.poet = poet._id; return s});

  //} catch (e){
  //  console.log('e!', e, poet.name)
  //}
  //await




  //return Promise.resolve();
  //return new Promise((resolve, reject) => {
  //  Poet.findOneAndUpdate
  //
  //    //console.log('songs', songs)
  //    let {name} = poet;
  //    //console.log('forEach', name);
  //    //console.log(poet.pageUrl);
  //    let query = {name};
  //    let update = {name, fetchDate: Date.now()};
  //    if(songs.length){ update.songs = songs;}
  //    Poet.findOneAndUpdate(query, update, {upsert: true, setDefaultsOnInsert: true}, (err, poet) => {
  //      if (err) {
  //        //console.log('findOneAndUpdate reject', poet)
  //        console.log('findOneAndUpdate reject')
  //        reject(err)
  //      }
  //      else {
  //        //console.log('findOneAndUpdate resolve', poet);
  //        console.log('findOneAndUpdate resolve', name);
  //        resolve(poet);
  //      }
  //    })
  //  //} catch (err) {
  //  //  console.error('error in updatePoet ', error);
  //  //  reject(err)
  //  //}
  //
  //});
}





import { getPoets } from './DB';

export default async function run(){


  let poets = await getPoets();
  //console.log('poets', poets);
  //console.log(poets);
  
  try{

    let poetSsongs = await Promise.all(poets.map(fetchSongs));
    let songs = R.reduce(R.concat, [], poetSsongs)
    await Promise.all(songs.map(saveSong));
    //console.log('songs', songs);
    console.log('done');


  } catch (error) {
    console.error('error! ', error);
  }

  console.log('ttt');


}