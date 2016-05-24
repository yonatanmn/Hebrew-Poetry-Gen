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
  //console.log(songLink);
  //if(!songLink){return Promise.resolve()}
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


}
function getPoetSongsLinks(poetPageUrl) {

  return Nightmare()
    .goto(poetPageUrl)
    .wait('.global_main_shadow')
    .evaluate(function () {
      return [].slice.call(document.querySelectorAll('.artist_player_songlist')).map(n=>n.href)
    })
    .end();
}

function saveSong(song){
  console.log(song.name);

  return new Promise((rs, rj)=>{
    let s = new Song(song);
    s.save(err=>{
      if (err) {rj(err)}
      else(rs());
    })
  })
}

async function fetchSongs(poet) {
  let songsLinks = await getPoetSongsLinks(poet.pageUrl);

    let songs = await Promise.all(songsLinks.map(getSong));
    return songs.map(s=>{s.poet = poet._id; return s});

}





import { getPoets } from './DB';

export default async function run(){


  let poets = await getPoets();

  try{

    let poetSsongs = await Promise.all(poets.map(fetchSongs));
    let songs = R.reduce(R.concat, [], poetSsongs)
    //console.log('songs', songs);
    await Promise.all(songs.map(saveSong));
    console.log('done');


  } catch (error) {
    console.error('error! ', error);
  }

  console.log('ttt');


}