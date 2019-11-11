const EventEmitter = require('events');
const { Art, Artist, connection } = require('../data/db');

class ArtService extends EventEmitter {
    constructor() {
        super();
        this.events = {
            GET_ALL_ARTS: 'GET_ALL_ARTS',
            GET_ART_BY_ID: 'GET_ART_BY_ID',
            CREATE_ART: 'CREATE_ART'
        };
    }
    getAllArts() {
        Art.find({}, (err, arts) => {
            if (err) {
                this.emit('error', { statusCode: 404, message: 'Not found' });
            }
            this.emit(this.events.GET_ALL_ARTS, arts);
        });
    };

    getArtById(id) {
        Art.findById(id, (err, art) => {
            if (err) {
                this.emit('error', { statusCode: 404, message: err });
            }
            this.emit(this.events.GET_ART_BY_ID, art);
        });
    };

    createArt(art) {

        Artist.findById(art.artistId, (err, artist) => {
            if (err) {
                this.emit('error', { statusCode: 400, message: err });
            }
            Art.create({
                images: art.images,
                isAuctionItem: art.isAuctionItem,
                title: art.title,
                artistId: art.artistId,
                date: art.date,
                description: art.description

            }, err => {
                if (err) {
                    this.emit('error', { statusCode: 500, message: err });
                }
                this.emit(this.events.CREATE_ART);
            });
        });
    };
};

module.exports = ArtService;
