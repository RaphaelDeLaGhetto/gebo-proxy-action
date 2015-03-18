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
        Object.keys(_directory[email].resources).forEach(function(resource) {
            if (_directory[email].resources[resource].isAction) {        
              _actions = _actions.concat(resource);
            }
          });
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

          if (_directory[message.receiver].resources && _directory[message.receiver].resources[verified.resource]) {

            // Get this proxy's permissions
            var proxyPermissions = _directory[message.receiver].resources[verified.resource];

            // Permissions have to be identical for actions
            if (proxyPermissions.isAction) {
              if (verified.read === !!proxyPermissions.read &&
                  verified.write === !!proxyPermissions.write &&
                  verified.execute === !!proxyPermissions.execute) {
              
                // Swap out destination gebo and access token
                message.gebo = _directory[message.receiver].gebo;
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
                deferred.reject('You are not permitted to request or propose that action');
              }
            }
            // Apply permissions according to requested action for database resources
            else {
              // Get this proxy's permissions
              var proxyActionPermissions = _directory[message.receiver].resources[message.action];

              // Gather the permissions required to perform the requested action
              var requiredPermissions = [];
              if (proxyActionPermissions.read) {
                requiredPermissions.push('read');
              }
              if (proxyActionPermissions.write) {
                requiredPermissions.push('write');
              }
              if (proxyActionPermissions.execute) {
                requiredPermissions.push('execute');
              }

              // Determine if the requesting agent has adequate permission
              var permitted = false;
              requiredPermissions.forEach(function(permission) {
                    if (verified[permission]) {
                      permitted = true;
                    }
                });

              if (permitted) {                
                // Swap out destination gebo and access token
                message.gebo = _directory[message.receiver].gebo;
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
                deferred.reject('You are not permitted to request or propose that action');
              }            
            }
          }
          else {
            deferred.resolve({ error: 'I don\'t know how to ' + message.action });
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

