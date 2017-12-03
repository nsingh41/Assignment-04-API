'use strict';

const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');

exports.register = function (server, options, next) {

    const db = server.app.db;

    server.route({
        method: 'GET',
        path: '/books',
        handler: function (request, reply) {

            db.books.find((err, docs) => {

                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                reply(docs);
        });

        }
    });

    server.route({
        method: 'GET',
        path: '/books/{id}',
        handler: function (request, reply) {

            db.books.findOne({
                _id: request.params.id
            }, (err, doc) => {

                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                if (!doc) {
                return reply(Boom.notFound());
            }

            reply(doc,{limit:5});
        });

        }
    });



    server.route({
        method: 'POST',
        path: '/books',
        handler: function (request, reply) {

            var book = request.payload;

            //Create an id
            book._id = uuid.v1();

            db.books.save(book, (err, result) => {

                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                reply(book);
        });
        },
        config: {
            validate: {
                payload: {
                    title: Joi.string().min(5).max(50).required(),
                    author: Joi.string().min(3).max(50).required(),
                    genre: Joi.string().min(3).max(50).required(),
                    publication: Joi.object().keys({
                        date_published: Joi.date().required(),
                        publisher: Joi.string().required()
                    }),
                    availability: Joi.array().items(Joi.object().keys({
                        edition: Joi.string(),
                        total_copies: Joi.number(),
                        available: Joi.number(),
                        borrowed: Joi.number()
                    }))
                }
            }
        }
    });

    server.route({
        method: 'PATCH',
        path: '/books/{id}',
        handler: function (request, reply) {

            db.books.update({
                _id: request.params.id
            }, {
                $set: request.payload
            }, function (err, result) {

                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                if (result.n === 0) {
                    return reply(Boom.notFound());
                }

                reply().code(204);
            });
        },
        config: {
            validate: {
                payload: Joi.object({
                    title: Joi.string().min(10).max(50),
                    author: Joi.string().min(3).max(50),
                    genre: Joi.string().min(3).max(50),
                    publication: Joi.object().keys({
                        date_published: Joi.date(),
                        publisher: Joi.string(),
                    }),
                    availability: Joi.array().items(Joi.object().keys({
                        edition: Joi.string(),
                        total_copies: Joi.number(),
                        available: Joi.number(),
                        borrowed: Joi.number()
                    }))
                }).required().min(1)
            }
        }
    });

    server.route({
        method: 'DELETE',
        path: '/books/{id}',
        handler: function (request, reply) {

            db.books.remove({
                _id: request.params.id
            }, function (err, result) {

                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                if (result.n === 0) {
                    return reply(Boom.notFound());
                }

                reply().code(204);
            });
        }
    });

    return next();
};

exports.register.attributes = {
    name: 'routes-books'
};
