
var mongoose = require('mongoose');

//db.once('open', function (callback) {});

var Schema = mongoose.Schema;



var PoetSchema = new Schema({
  name: String,
  fetchDate: { type: Date, default: Date.now },
  pageUrl: String,
  songs:  [{type: Schema.ObjectId, ref: 'Song'}]
});

export default mongoose.model('Poet', PoetSchema);

