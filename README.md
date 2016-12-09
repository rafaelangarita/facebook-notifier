# facebook-notifier

Configuration: write your Facebook credentials in the conf/conf.js file.


Example:

```
POST /messenger HTTP/1.1
Content-Type: application/json
Host: yourhost

{"threadID":"receiverFacebookID", "message": "hey you! how are you?"}'
```
