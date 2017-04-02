var routes = require('./routes/messenger');

function process(message) {

    console.log('Facebook received message %s', JSON.stringify(message));
    routes.sendDirectMessage(message.getTo(), message.getMessage());
}

module.exports.process = process;
