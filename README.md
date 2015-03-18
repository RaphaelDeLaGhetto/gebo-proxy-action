gebo-proxy-action
=================

Gebo message-forwarding actions

## Install

```
npm install gebo-proxy-action
```

## Configure

Set the destination gebo, access_token, and action for every friendo behind the proxy in
`gebo.json`. E.g.,

```
    "directory": {
        "gebo@example.com": {
            "gebo": "https://somegebo.com",
            "resources": {
                "bakeAPie": { "isAction": true, "read": false, "write": false, "execute": true },
                "save": { "isAction": true, "read": false, "write": true, "execute": false },
                "manifesto": { "read": true, "write": true, "execute": false },
                "cleanTheToilet": { "isAction": true, "read": false, "write": false, "execute": true }
            },
            "access_token": "SomeAccessToken123"
        },
        "anothergebo@example.com": {
            "gebo": "https://localhost:3443",
            "resources": {
                "loveSongs": { "read": true, "write": true, "execute": false },
                "hootLikeAnOwl": { "isAction": true, "read": false, "write": false, "execute": true },
                "cleanTheToilet": { "isAction": true, "read": false, "write": false, "execute": true },
                "getJiggyWithIt": { "isAction": true, "read": true, "write": false, "execute": false }
            },
            "access_token": "SomeOtherAccessToken123"
        }
    }
```

## Enable

```
var gebo = require('gebo-server')();
var proxy = require('gebo-proxy-action');
gebo.actions.forward = proxy.forward;
```

## License

MIT
