const conf = require('../conf/conf');
const confamqp = require('../conf/amqp-endpoint.conf');
const login = require('facebook-chat-api');
const fs = require('fs');
const sender = require('../amqp-sender');
const scbNodeParser = require('scb-node-parser');
var Message = require('scb-node-parser/message');

var winston = require('winston');

var logger = new(winston.Logger)({
    transports: [
        new(winston.transports.File)({
            filename: 'application.log'
        })
    ]
});

/*Messages look like this:

    {
        "message": "Hi, how are you?",
        "threadID": "facebookID"
    }
*/
var savedState = null;

try {

    savedState = JSON.parse(fs.readFileSync('appstate.json', 'utf8'));
} catch (err) {
    savedState = null;
}
exports.sendMessage = function(req, res) {

    if (savedState === null) {
        login({
            email: conf.email,
            password: conf.password
        }, function callback(err, api) {
            try {
                fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()));
            } catch (err) {
                logger.log('error', 'authentication_error', err);
            }
            send(err, api, req.body.threadID, req.body.message)
        });

    } else {
        console.log('cached login');
        login({
            appState: savedState
        }, function callback(err, api) {
            send(err, api, req)
        });
    }


}

exports.sendDirectMessage = function(threadID, message) {
    if (savedState === null) {
        login({
            email: conf.email,
            password: conf.password
        }, function callback(err, api) {
            send(err, api, threadID, message);
        });

    } else {
        console.log('cached login');
        login({
            appState: savedState
        }, function callback(err, api) {
            send(err, api, threadID, message);
        });
    }

}


function send(err, api, threadID, message) {
    if (err) return logger.log('error', 'send_error', err);
    savedState = api.getAppState();
    console.log('sending %s to %s', message, threadID);
    api.sendMessage(message, threadID);
};

exports.listen = function() {

    if (savedState === null) {
        login({
            email: conf.email,
            password: conf.password
        }, function callback(err, api) {
            try {
                fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()));
            } catch (err) {
                console.log(err);
            }
            listenDirectMessage(api);
        });

    } else {
        console.log('cached login');
        login({
            appState: savedState
        }, function callback(err, api) {
            listenDirectMessage(api);
        });
    }
}

function listenDirectMessage(api) {
    api.listen(function callback(err, message) {
        console.log(message.body);
        console.log(message.threadID);
        console.log(message);
        logger.log('info', 'received_dmmessage', message);
        var parsedMessage = scbNodeParser.getMessage(message.body);
        parsedMessage._from = {
            name: '',
            uniqueName: message.threadID
        };
        parsedMessage._persona = confamqp.exchange.name;
        sender.post(parsedMessage);
    });
}
