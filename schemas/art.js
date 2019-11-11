const Schema = require('mongoose').Schema;

module.exports = new Schema({
    images: { type: [String], required: false },
    isAuctionItem: { type: Boolean, required: false, default: false },
    title: { type: String, required: true },
    artistId: { type: Schema.Types.ObjectId, required: true },
    date: { type: Date, required: true, default: Date.now() },
    description: { type: String, required: false },
});
