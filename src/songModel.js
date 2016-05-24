var mongoose = require('mongoose');

var Schema = mongoose.Schema;

let SongSchema = new Schema({
  name: String,
  url: String,
  lyrics: String,
  poet: {type: Schema.ObjectId, ref: 'Poet'}

});

export default mongoose.model('Song', SongSchema);
