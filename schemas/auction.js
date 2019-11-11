const Schema = require('mongoose').Schema;

module.exports = new Schema({
    artId: { type: Schema.Types.ObjectId, required: true },
    minimumPrice: { type: Number, required: false, default: 1000 },
    endDate: { type: Date, required: true },
    auctionWinner: { type: Schema.Types.ObjectId, required: false }
});
