var performatives = require('gebo-performatives'),
    nconf = require('nconf'),
    q = require('q');

module.exports = function() {

    /**
     * Spoof all the file _proxyActions set in the
     * gebo.json file
     */
    nconf.file({ file: './gebo.json' });
    var _proxyActions = nconf.get('proxyActions');
    var keys = Object.keys(_proxyActions);
    for (var i in keys) {
      exports[keys[i]] = _forward;
    }

    /**
     * Forward the message to the appropriate recipient
     */
    function _forward(verified, message) {
        var deferred = q.defer();
    
        if (verified.admin || verified.execute) {

          if (_proxyActions[message.action]) {
            // Swap out destination gebo and access token
            message.gebo = _proxyActions[message.action].gebo;
            message.access_token = _proxyActions[message.action].access_token;
  
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
            deferred.resolve({ error: 'I don\'t know how to ' + message.action });
          }
        }
        else {
          deferred.reject('You are not permitted to request or propose that action');
        }
        return deferred.promise;
      };
    exports.forward = _forward;

    return exports;
};

