const fetch = require('node-fetch');

exports.urban = async function(word) {
    let message = await fetch(`http://api.urbandictionary.com/v0/define?term=${word}`, {
        method: 'GET'
    }).then((response) => {
        return response.json();
    }).then((json) => {
        let definitions = json.list;
        
        if (json.result_type === 'no_results') {
            console.log('No defintion found.');
            return {
                result_type: 'no_results'
            };
        } else {
            console.log('Finding best definition...');
            let top = definitions[0];

            try {
                for (i = 0; i < definitions.length; i++) {
                    let topVotes = (top.thumbs_up / (top.thumbs_up + top.thumbs_down) * 100);
                    let currentVotes = (definitions[i].thumbs_up / (definitions[i].thumbs_up + definitions[i].thumbs_down) * 100);

                    if (currentVotes > topVotes) {
                        top = definitions[i];
                    }
                }

                return top;
            } catch(error) {
                console.log(`Error: ${error}`);
            }
        }        
    }).then((top) => {
        if (top.result_type === 'no_results') {
            return {
                'response_type': 'in_channel',
                'attachments': [
                    {
                        'title': 'No definition found...',
                        'text': 'Go to http://www.urbandictionary.com/add.php to add one!'
                    }
                ]
            }
        } else {
            return {
                'response_type': 'in_channel',
                'attachments': [
                    {
                        'title': top.word,
                        'pretext': `_Most popular definition with ${top.thumbs_up} up-votes and ${top.thumbs_down} down-votes:_`,
                        'text': top.definition,
                        'mrkdwn_in': [
                            'pretext'
                        ]
                    },
                    {
                        'title': 'Example:',
                        'text': top.example
                    }
                ]
            };
        }
    }).catch((error) => {
        console.log(`Error: ${error}`);
    });

    return message;
}