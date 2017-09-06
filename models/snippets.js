const mongoose = require ('mongoose');

const snipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true},
  language: {
    type: String,
    required: true}
  }
  snippet: {
    type: String,
  },
  notes: {
    type: String,
  },
  tags: {},
  public: {},
  created : {
    type : Date,
    default : Date.now
  }
)

const Snip = mongoose.model('Snip', snipSchema, 'snippets');

module.exports = {
  Snip: Snip
};
