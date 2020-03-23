var express = require('express');

var app = express();

var body_parser = require('body-parser');
app.use(body_parser.json());

var cors = require('cors');
app.use(cors());

var sessions = {};

app.use(express.urlencoded());

app.get('/sessions', function (req, res) {
    res.json(sessions);
});

app.post('/sessions', function (req, res) {
    var name = req.body.name;
    var sessionId = '_' + Math.random().toString(36).substr(2, 9);
    var stories = req.body.stories.split('\n').filter(item => item !== '').map(item => {
        var cards = [
            {
                number: 1,
                voterIds: [],
                count: 0,
            },
            {
                number: 2,
                voterIds: [],
                count: 0,
            },
            {
                number: 3,
                voterIds: [],
                count: 0,
            },
            {
                number: 5,
                voterIds: [],
                count: 0,
            },
            {
                number: 8,
                voterIds: [],
                count: 0,
            },
            {
                number: 13,
                voterIds: [],
                count: 0,
            },
            {
                number: 21,
                voterIds: [],
                count: 0,
            },
            {
                number: 34,
                voterIds: [],
                count: 0,
            },
            {
                number: 55,
                voterIds: [],
                count: 0,
            },
            {
                number: 89,
                voterIds: [],
                count: 0,
            },
            {
                number: 134,
                voterIds: [],
                count: 0,
            },
            {
                number: '?',
                voted: false,
                voterIds: [],
                count: 0,
            }
        ];

        return { name: item, cards, status: 'NOT COMPLETED', finalScore: 0 };
    });
    var numberOfVoters = req.body.numberOfVoters;
    var voterId = req.headers.authorization;

    var session = {
        id: sessionId,
        name: name,
        voterId: voterId, // TODO delete from response in real world app
        numberOfVoters: numberOfVoters,
        stories: stories,
        activeStory: 0,
        voters: [voterId].concat(new Array(numberOfVoters - 1).fill(null))
    };

    sessions[sessionId] = session;

    res.json(session);
});

app.get('/sessions/:id', function (req, res) {
    var voterId = req.headers.authorization;
    if (voterId) {
        var session = sessions[req.params.id];
        if (session && session.voters.includes(null)) {
            if (!session.voters.includes(voterId) && session.voterId !== voterId) {
                const nullIndex = session.voters.findIndex(item => item === null);
                session.voters[nullIndex] = voterId;
            }
            res.json(session);
        } 
        
        else if (session.voters.includes(voterId)) res.json(session);
        
        else new Error('All voters joined!');
    }
    
    else new Error('Not enabled in Incognito!');
});

app.post('/vote-story', function (req, res) {
    var session = sessions[req.body.sessionId];
    var cardId = req.body.cardId;
    var storyId = req.body.storyId;
    var voterId = req.body.voterId;

    for (var i = 0; i < session.stories[storyId].cards.length; i++) {
        var isVotedBefore = false;
        if (session.stories[storyId].cards[i].voterIds.includes(voterId)) {
            isVotedBefore = true;
            break;
        }
    }

    if (!isVotedBefore) {
        session.stories[storyId].cards[cardId].voterIds.push(voterId);
        session.stories[storyId].cards[cardId].count++;
    }

    res.json(session);
});

app.put('/sessions/:id/', function (req, res) {
    var sessionId = req.params.id;
    sessions[sessionId].activeStory = req.body.activeStory;
    var session = sessions[sessionId];
    
    res.json(session.stories[session.activeStory]);
});

app.put('/sessions/:id/:storyId', function (req, res) {
    var session = sessions[req.params.id];
    sessionId = req.params.id;
    storyId = req.params.storyId;

    var finalScore = 0;
    var voterCount = 0;

    for (var i = 0; i < sessions[sessionId].stories[storyId].cards.length; i++) {
        if (sessions[sessionId].stories[storyId].cards[i].count > finalScore) {
            voterCount += sessions[sessionId].stories[storyId].cards[i].count;
            finalScore = sessions[sessionId].stories[storyId].cards[i].number;
        }
    }

    if (voterCount == session.numberOfVoters) {
        sessions[sessionId].stories[storyId].finalScore = finalScore;
        sessions[sessionId].stories[storyId].status = 'VOTED';
        sessions[sessionId].activeStory += 1;
    }

    res.json(session);
});

app.listen(3000);