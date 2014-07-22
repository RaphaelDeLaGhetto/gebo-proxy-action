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

Set the destination gebo and access_token for every proxy action in
`gebo.json`. E.g.,

```
    "proxyActions": {
        "someAction": {
            "gebo": "https://somegebo.com",
            "access_token": "SomeAccessToken123"
        },
        "someOtherAction": {
            "gebo": "https://someothergebo.com",
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
MIT license.
