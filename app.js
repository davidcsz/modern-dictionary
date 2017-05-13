const hapi = require('hapi');
const define = require('./lib/define.js');

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

        let definition = await define.urban(word);

        reply(definition).code(200).type('application/json');
    }
});

server.start((error) => {
    if (error) {
        throw error;
    }

    console.log(`Server running at: ${server.info.uri}`);
});