var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    username: String,
    password: String,
    bugs: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Bug'
        }
    ],
});

UserSchema.plugin(passportLocalMongoose, {usernameLowercase: true});
module.exports = mongoose.model('User', UserSchema);