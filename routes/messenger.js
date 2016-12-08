var conf = require('../conf/conf');
var login = require("facebook-chat-api");


/*Messages look like this:

    {
        "message": "Hi, how are you?",
        "threadID": "facebookID"
    }
*/
var savedState = null;
exports.sendMessage = function(req, res) {

    if (savedState === null) {
        login({
            email: conf.email,
            password: conf.password
        }, function callback(err, api) {
            send(err, api, req)
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


function send(err, api, req) {
    if (err) return console.error(err);
    savedState = api.getAppState();
    api.listen(function callback(err, message) {
        console.log(message.body);
        console.log(message.threadID);
        console.log(message);
        //api.sendMessage(message.body, message.threadID);
    });
    var message = {};
    message.body = req.body.message;
    //id http://www.facebook.com/rafaelangarita
    message.threadID = req.body.threadID;
    message.type = 'message';
    api.sendMessage(message.body, message.threadID);
};
