const hapi = require('hapi');
const fetch = require('node-fetch');

const server = new hapi.Server();
server.connection({
    host: process.env.HOST,
    port: process.env.PORT
});

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        console.log(`Path hit: ${request.path}`);

        reply('App running');
    }
});

server.route({
    method: 'POST',
    path: '/define',
    handler: async function (request, reply) {
        let word = request.payload.text;
        console.log(`Definition request for: ${word}`);

        let definition = await fetch(`http://api.urbandictionary.com/v0/define?term=${word}`, {
            method: 'GET'
        }).then((response) => {
            return respons.json();
        }).then((definition) => {
            return definition.list[0].definition;
        });

        reply(definition).code(200);
    }
});

server.start((error) => {
    if (error) {
        throw error;
    }

    console.log(`Server running at: ${server.info.uri}`);
});