const EventEmitter = require('events');
const { Artist, connection } = require('../data/db');

class ArtistService extends EventEmitter {
    constructor() {
        super();
        this.events = {
            GET_ALL_ARTISTS: 'GET_ALL_ARTISTS',
            GET_ARTIST_BY_ID: 'GET_ARTIST_BY_ID',
            CREATE_ARTIST: 'CREATE_ARTIST'
        };
    }
    getAllArtists() {
        Artist.find({}, (err, artists) => {
            if (err) {
                this.emit('error', { statusCode: 404, message: 'Not found' });
            }
            this.emit(this.events.GET_ALL_ARTISTS, artists);
        });
    };

    getArtistById(id) {
        Artist.findById(id, (err, artist) => {
            if (err) {
                this.emit('error', { statusCode: 404, message: err });
            }
            this.emit(this.events.GET_ARTIST_BY_ID, artist);
        });
    };

    createArtist(artist) {
        Artist.create({
            name: artist.name,
            nickname: artist.nickname,
            address: artist.address,
            memberSince: artist.memberSince

        }, err => {
            if (err) {
                this.emit('error', { statusCode: 500, message: err });
            }
            this.emit(this.events.CREATE_ARTIST);
        });
    };
};

module.exports = ArtistService;
