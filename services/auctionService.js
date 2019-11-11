EventEmitter = require('events');
const { Auction, AuctionBid, Customer, Art, connection } = require('../data/db');
var ObjectId = require('mongodb').ObjectID;

class AuctionService extends EventEmitter {
	constructor() {
		super();
		this.events = {
			GET_ALL_AUCTIONS: 'GET_ALL_AUCTIONS',
			GET_AUCTION_BY_ID: 'GET_AUCTION_BY_ID',
			GET_AUCTION_WINNER: 'GET_AUCTION_WINNER',
			CREATE_AUCTION: 'CREATE_AUCTION',
			GET_AUCTION_BIDS_WITHIN_AUCTION: 'GET_AUCTION_BIDS_WITHIN_AUCTION',
			PLACE_NEW_BID: 'PLACE_NEW_BID'
		};
	};

	getAllAuctions() {
		Auction.find({}, (err, auctions) => {
			if (err) {
				this.emit('error', { statusCode: 404, message: 'Not found' });
			}
			else if (auctions.endDate > Date.now()) {
				this.emit('error', { statusCode: 409, message: 'Conflict' });
			}
			this.emit(this.events.GET_ALL_AUCTIONS, auctions);
		});
	};

	getAuctionById(id) {
		Auction.findById(id, (err, auction) => {
			if (err) {
				this.emit('error', { statusCode: 404, message: err });
			}
			else if (!auction) {
				this.emit('error', { statusCode: 404, message: err });
			}
			this.emit(this.events.GET_AUCTION_BY_ID, auction);
		});
	};

	getAuctionWinner(auctionId) {
		AuctionBid.findOne({ auctionId: auctionId }, (err, bids) => {
			if (err) {
				this.emit('error', { statusCode: 500, message: err });
			}
			else if (!bids) {
				this.emit('error', { statusCode: 200, message: 'This auction has no bids' });
			}
			Customer.findById(bids.customerId, (err, customer) => {
				if (err) {
					this.emit('error', { statusCode: 500, message: err });
				}
				else if (!customer) {
					this.emit('error', { statusCode: 404, message: err });
				}
				this.emit(this.events.GET_AUCTION_WINNER, customer);
			});
		}).sort({ price: -1 });
	};

	createAuction(auction) {
		Art.findById(auction.artId, (err, art) => {
			if (err) {
				this.emit('error', { statusCode: 400, message: err });
			}
			else if (!art.isAuctionItem) {
				this.emit('error', { statusCode: 412, message: err });
			}
			else {
				Auction.create({
					artId: auction.artId,
					minimumPrice: auction.minimumPrice,
					endDate: auction.endDate,
				}, err => {
					if (err) {
						this.emit('error', { statusCode: 500, message: err });
					}
					this.emit(this.events.CREATE_AUCTION);
				});
			}
		});
	};

	getAuctionBidsWithinAuction(id) {
		Auction.findById(id, err => {
			if (err) {
				this.emit('error', { statusCode: 404, message: err });
			}
			AuctionBid.find({ auctionId: id }, (err, bids) => {
				if (err) {
					this.emit('error', { statusCode: 404, message: err });
				}
				else if (!bids) {
					this.emit('error', { statusCode: 404, message: err });
				}
				this.emit(this.events.GET_AUCTION_BIDS_WITHIN_AUCTION, bids);
			});
		});
	};

	placeNewBid(auctionId, customerId, price) {

		//Checking that the auctionId is valid
		Auction.findById(auctionId, (err, auction) => {
			if (err) {
				this.emit('error', { statusCode: 404, message: err });
			}

			//Checking that the customerId is valid
			Customer.findById(customerId, (err, customer) => {
				if (err) {
					this.emit('error', { statusCode: 400, message: err });
				}

				// Checking that auction bid is higher than the current highest bid
				AuctionBid.find({ auctionId: auctionId }, (err, bids) => {
					if (err) {
						throw new Error(err);
					}
					bids.forEach(bid => {
						if (bid.price > price) { this.emit('error', { statusCode: 412, message: err }); }
					});
				});

				// Checking that auction bid is higher than minumum price
				if (price > auction.minimumPrice) {

					//Checking that the auction has not ended
					if (auction.endDate > Date.now()) {
						Auction.updateOne(
							{ _id: auction.id },
							{ $set: { auctionWinner: customerId } },
							{ upsert: true },
							err => {
								if (err) {
									if (err) { this.emit('error', { statusCode: 404, message: err }); }
								}
							}
						);

						AuctionBid.create({
							auctionId: auctionId,
							customerId: customerId,
							price: price,

						}, err => {
							if (err) {
								this.emit('error', { statusCode: 500, message: err });
							}

							this.emit(this.events.PLACE_NEW_BID);
						});
					}
					else {
						this.emit('error', { statusCode: 403, message: err });
					}
				}
				else {
					this.emit('error', { statusCode: 412, message: err });
				}
			});

		});
	};

};
module.exports = AuctionService;
