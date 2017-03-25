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
        let word = request.query.text;
        console.log(`Definition request for: ${word}`);

        let definition = await fetch(`http://api.urbandictionary.com/v0/define?term=${word}`, {
            method: 'GET'
        }).then((response) => {
            return response.json();
        }).then((json) => {
            let definitions = json.list;
            let top = definitions[0];

            for (i = 0; i < definitions.length; i++) {
                let topVotes = (top.thumbs_up / (top.thumbs_up + top.thumbs_down) * 100);
                let currentVotes = (definitions[i].thumbs_up / (definitions[i].thumbs_up + definitions[i].thumbs_down) * 100);

                if (currentVotes > topVotes) {
                    top = definitions[i];
                }
            }

            return top;
        }).then((top) => {
            return {
                'response_type': 'in_channel',
                'attachments': [
                    {
                        'title': top.word,
                        'pretext': `_Most popular definition with ${top.thumbs_up} up-votes and ${top.thumbs_down}:_`,
                        'text': top.definition
                    },
                    {
                        'title': 'Example:',
                        'text': top.example
                    }
                ]
            };
        }).catch((error) => {
            console.log(`Error: ${error}`);
        });

        reply(definition).code(200).type('application/json');
    }
});

server.start((error) => {
    if (error) {
        throw error;
    }

    console.log(`Server running at: ${server.info.uri}`);
});