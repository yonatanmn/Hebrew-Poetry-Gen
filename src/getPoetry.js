//var fs = require('fs');
var Promise = require("bluebird");
//var fs = Promise.promisifyAll(require("fs"));
var Xray = require('x-ray');
var phantom = require('x-ray-phantom');
var mongoose = require('mongoose');
import Poet from './poetModel';

function removeLineBreaks(text){
  if(!text){return ''; }
  console.log('removeLineBreaks');
  //console.log(text);

  return text.replace(/(\r\n|\n|\r)/gm,"");
}

function getSong(songLink) {
  //console.log(songLink)
  let xr = Xray().driver(phantom({webSecurity: false}));
  return new Promise((resolve, reject) => {
    if(!songLink){resolve({})}

    xr(songLink, 'td.artist_normal_txt', [{name: 'span.artist_song_name_txt', lyrics: 'span.artist_lyrics_text'}])((err, songResp)=> {
      if (!err && songResp) {
        console.log('getPoetSongs');
        songResp.name = removeLineBreaks(songResp.name);
        songResp.lyrics = removeLineBreaks(songResp.lyrics);
        console.log(songLink, songResp);
        resolve(songResp);
      } else {
        console.log('error in xr2')
        reject(err);
      }
    });
  });

}
function getPoetSongsLinks(poetPageUrl) {
  let xr = Xray().driver(phantom({webSecurity: false}));
    //.driver(phantom({webSecurity: false})); //add this for JS rendered pages
  return new Promise((resolve, reject) => {
    if(!poetPageUrl){resolve('')}
    //console.log(poetPageUrl);
    
    xr(poetPageUrl, ['span.artist_normal_txt a@href'])((err, songsLinks)=> {
      console.log('songsLinks', poetPageUrl, songsLinks)
      if (!err && songsLinks) {
        //console.log(poetPageUrl)
        resolve(songsLinks);
      } else {
        console.log('error in xr getPoetSongsLinks');
        
        reject(err);
      }
    });
  });
}

async function updatePoet(poet) {
  let songsLinks = await getPoetSongsLinks(poet.pageUrl);
  let songs = await Promise.all(songsLinks.map(getSong));
  //console.log(songsLinks);
  console.log('songs',songs);
  return;
  return new Promise((resolve, reject) => {

      //console.log('songs', songs)
      let {name} = poet;
      //console.log('forEach', name);
      //console.log(poet.pageUrl);
      let query = {name};
      let update = {name, fetchDate: Date.now()};
      if(songs.length){ update.songs = songs;}
      Poet.findOneAndUpdate(query, update, {upsert: true, setDefaultsOnInsert: true}, (err, poet) => {
        if (err) {
          //console.log('findOneAndUpdate reject', poet)
          reject(err)
        }
        else {
          //console.log('findOneAndUpdate resolve', poet);
          resolve(poet);
        }
      })
    //} catch (err) {
    //  console.error('error in updatePoet ', error);
    //  reject(err)
    //}

  });
}




function getPoets(){
  return new Promise((rs,rj)=>{
    Poet.find((err, poets)=> {
      if (err) return rj(err);
      rs(poets);
    });
  })
}


export default async function run(){


  let poets = await getPoets();
  console.log('poets');
  //console.log(poets);
  
  try{

    await Promise.all(poets.map(updatePoet));
    console.log('done');


  } catch (error) {
    console.error('error! ', error);
  }

  console.log('ttt');


}