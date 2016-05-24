import Poet from './poetModel';
import Song from './songModel';


export function getPoets(){
  return new Promise((rs,rj)=>{
    Poet.find((err, poets)=> {
      if (err) return rj(err);
      rs(poets);
    });
  })
}