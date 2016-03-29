
var mongoose = require('mongoose');

//db.once('open', function (callback) {});

var Schema = mongoose.Schema;

let SongSchema = new Schema({
  name: String,
  url: String
});

var PoetSchema = new Schema({
  name: String,
  fetchDate: { type: Date, default: Date.now },
  pageUrl: String,
  songs: {
    //type: [{
      name: String,
      lyrics: String,
      url: String
    //}],
    //default: []
  }
});
export default mongoose.model('Poet', PoetSchema);

