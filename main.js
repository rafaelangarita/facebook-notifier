var routes = require('./routes/messenger');

function process(message) {

    console.log('Facebook received message %s', JSON.stringify(message));
    console.log('To ' + message._to.uniqueName);
    routes.sendDirectMessage(message._to.uniqueName, message.getMessage());
}

module.exports.process = process;
