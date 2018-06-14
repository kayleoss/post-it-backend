var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const BugSchema = new Schema ({
    name: String,
    details: String,
    type: String,
    dateCreated: Date,
    completed: Boolean
});

module.exports = mongoose.model('Bug', BugSchema);