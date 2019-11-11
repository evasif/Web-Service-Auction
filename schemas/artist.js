const Schema = require('mongoose').Schema;

module.exports = new Schema({
    name: { type: String, required: true },
    nickname: { type: String, required: true },
    memberSince: { type: Date, required: true, default: Date.now }

});
