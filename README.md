gebo-proxy-action
================

Gebo message-forwarding actions

## Setup

### your database (MongoDB)

Install MongoDB on your system, if you haven't already:

* [http://docs.mongodb.org/manual/installation/](http://docs.mongodb.org/manual/installation/)

Start MongoDB by executing this at the command line:

```
$ sudo service mongodb start
```

### your actions module 

First, install your npm modules:

```
$ sudo npm install
```

## Test 

```
$ grunt nodeunit
```

## Configure

Set the destination gebo, access_token, and action for every friendo behind the proxy in
`gebo.json`. E.g.,

```
    "directory": {
        "gebo@example.com": {
            "gebo": "https://somegebo.com",
            "actions": ["bakeAPie", "cleanTheToilet"],
            "access_token": "SomeAccessToken123"
        },
        "anothergebo@example.com": {
            "gebo": "https://localhost:3443",
            "actions": ["hootLikeAnOwl", "cleanTheToilet", "getJiggyWithIt"],
            "access_token": "SomeOtherAccessToken123"
        }
    }
```

## Enable

```
var gebo = require('gebo-server')();
gebo.enable(require('gebo-proxy-action'));
```

## License

Copyright (c) 2014 Daniel Bidulock
MIT
