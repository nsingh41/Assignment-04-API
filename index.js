'use strict';

const Hapi = require('hapi');
const mongojs = require('mongojs');

const server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: 2501
});

server.app.db = mongojs('mongodb://navjot:%40Singhnav2586@cluster0-shard-00-00-mgkoj.mongodb.net:27017,cluster0-shard-00-01-mgkoj.mongodb.net:27017,cluster0-shard-00-02-mgkoj.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin', ['books']);

server.register([
    require('./routes/books')
], (err) => {

    if (err) {
        throw err;
    }

    server.start((err) => {
        console.log('Server running at:', server.info.uri);
    });

});