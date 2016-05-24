import poets from './poetsList';
import Nightmare from 'nightmare';
import Promise from "bluebird";
var fs = Promise.promisifyAll(require("fs"));
import merge from 'deepmerge';

//
// function getPoetSearchPageFromShironet(name) {
//   return {name, searchPage: shironetSearchUrl + encodeURI(name)};
// }


function getPoetUrl(poet) {
  // console.log(poet);

  const shironetSearchUrl = 'http://shironet.mako.co.il/search?q=';
  return Nightmare()
    .goto(shironetSearchUrl + encodeURI(poet))
    // .wait('.search_results')
    .evaluate(() => {
      let resultLink = document.querySelector('.search_results a');
      return resultLink.href || '';
      // return {poetName: poet, songs: {links: resultLink.href || ''}};
      // return document.querySelector('.search_results a').href
    })
    .end();
}


function hasNoSongsLike(poet){
  return !poet || !poet.songs || !!poet.songs.links;
}

export default async function run() {
  // const x = await Promise.all(poets.map(getPoetUrl));
  // let data = fs.readFile()
  const dataFile = await fs.readFileAsync('./assets/data.json');
  const data = JSON.parse(dataFile);
  console.log(2);



  const poetsUrls = await Promise.all(poets.filter(hasNoSongsLike).map(getPoetUrl))/*.then(r=>{
    console.log('123');
    console.log(r);
  });*/
  console.log(3);
  console.log(poetsUrls);

  const newData = merge(data, poetsUrls);
  console.log(4);
  console.log('done', newData);

}



