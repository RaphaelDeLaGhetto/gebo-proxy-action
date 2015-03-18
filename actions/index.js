var performatives = require('gebo-performatives'),
    nconf = require('nconf'),
    q = require('q');

module.exports = function() {

    nconf.file({ file: './gebo.json' });

    var _proxyEmail = nconf.get('email');

    /**
     * Spoof all the file actions associated with registered gebos in the
     * gebo.json file
     */
    var _directory = nconf.get('directory');
    var _actions = [];
    Object.keys(_directory).forEach(function(email) {
        _actions = _actions.concat(_directory[email].actions);
      });

    _actions.forEach(function(action) {
        exports[action] = _forward;
      });

    /**
     * Forward the message to the appropriate recipient
     */
    function _forward(verified, message) {
        var deferred = q.defer();
    
        if (message.receiver && _directory[message.receiver]) {

          //if (_proxyActions[message.action]) {
          if (_directory[message.receiver]) {
            // Swap out destination gebo and access token
            //message.gebo = _proxyActions[message.action].gebo;
            message.gebo = _directory[message.receiver].gebo;
            //message.access_token = _proxyActions[message.action].access_token;
            message.access_token = _directory[message.receiver].access_token;
  
            message.sender = _proxyEmail;

            performatives.request(message, function(err, results) {
                  if (err) {
                    deferred.reject(err);
                  }
                  else {
                    deferred.resolve(results);
                  }
              });
          }
          else {
            deferred.reject('I don\'t know how to ' + message.action);
          }
        }
        else {
          deferred.reject('I don\'t know that receiver');
        }
        return deferred.promise;
      };
    exports.forward = _forward;

    return exports;
};

