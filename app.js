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
            return response.json();
        }).then((json) => {
            let definition;
            let response = json.list;
            let highestVotes = {
                'id': 0,
                'votes': (response[0].thumbs_up / (response[0].thumbs_up + response[0].thumbs_down)) * 100
            };


            for (let i = 0; i > response.length; i++) {
                let currentVotes = (response[i].thumbs_up / (response[i].thumbs_up + response[i].thumbs_down)) * 100;

                if (currentVotes > highestVotes.votes) {
                    console.log('Replacing current high.');
                    
                    highestVotes.id = i;
                    highestVotes.votes = currentVotes;
                }

                definition = response[highestVotes.id];
                console.log(definition);
            }

            return {
                'response_type': 'in_channel',
                'attachments': [
                    {
                        'title': definition.word,
                        'pretext': `_Most popular definition with ${definition.thumbs_up} up-votes and ${definition.thumbs_down}:_`,
                        'text': definition.definition
                    },
                    {
                        'title': 'Example:',
                        'text': definition.example
                    }
                ]
            };
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