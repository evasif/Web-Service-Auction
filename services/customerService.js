const EventEmitter = require('events');
const { Customer, AuctionBid, connection } = require('../data/db');
var ObjectId = require('mongodb').ObjectID;
var mongoose = require('mongoose');

class CustomerService extends EventEmitter {
    constructor() {
        super();
        this.events = {
            GET_ALL_CUSTOMERS: 'GET_ALL_CUSTOMERS',
            GET_CUSTOMER_BY_ID: 'GET_CUSTOMER_BY_ID',
            GET_CUSTOMER_AUCTION_BIDS: 'GET_CUSTOMER_AUCTION_BIDS',
            CREATE_CUSTOMER: 'CREATE_CUSTOMER'
        };
    }
    getAllCustomers() {
        Customer.find({}, (err, customers) => {
            if (err) {
                this.emit('error', { statusCode: 404, message: 'Not found' });
            }
            this.emit(this.events.GET_ALL_CUSTOMERS, customers);
        });
    };

    getCustomerById(id) {
        Customer.findById(id, (err, customer) => {
            if (err) {
                this.emit('error', { statusCode: 404, message: err });
            }
            this.emit(this.events.GET_CUSTOMER_BY_ID, customer);
        });
    };

    // Gets all auction bids associated with a customer
    getCustomerAuctionBids(id) {
        Customer.findById(id, err => {
            if (err) {
                this.emit('error', { statusCode: 404, message: err });
            }
            AuctionBid.find({ customerId: id }, (err, bids) => {
                if (err) {
                    this.emit('error', { statusCode: 404, message: err });
                }
                this.emit(this.events.GET_CUSTOMER_AUCTION_BIDS, bids);
            });
        });
    };

    createCustomer(customer) {
        Customer.create({
            name: customer.name,
            username: customer.username,
            address: customer.address,
            email: customer.email

        }, err => {
            if (err) {
                this.emit('error', { statusCode: 500, message: err });
            }
            this.emit(this.events.CREATE_CUSTOMER);
        });
    };
};

module.exports = CustomerService;
