'use strict';

import "babel-polyfill";

// import getPoetry from './getPoetry';
import poetNamesToPoetsPages from './poetNamesToPoetsPages';


(async function run(){
  console.log('start main');
  //await getPoetsPage();
  // await getPoetry();
  await poetNamesToPoetsPages();
  console.log('close');
}());


