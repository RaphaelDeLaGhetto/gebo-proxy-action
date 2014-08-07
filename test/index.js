'use strict';

var actionModule = require('..'),
    performatives = require('gebo-performatives'),
    q = require('q');

/**
 * onLoad
 */
exports.onLoad =  {

    'Point all configured actions to the forward actions': function(test) {
        test.expect(3);
        test.equal(Object.keys(actionModule.actions).length, 3);
        test.equal(actionModule.someAction, actionModule.forward);
        test.equal(actionModule.someOtherAction, actionModule.forward);
        test.done();
    },
};

/**
 * forward
 */
var _oldFunc;
exports.forward = {
    setUp: function(callback) {
        _oldFunc = performatives.request;

        // This stub simply passes the modified message back
        // to the tests
        performatives.request = function(message, done) {
            done(null, message);
          };
        callback();
    },

    tearDown: function(callback) {
        performatives.request = _oldFunc;
        callback();
    },

    'Forward the message to the destination set in gebo.json': function(test) {
        test.expect(4);
        actionModule.actions.someAction(
                { resource: 'someAction', execute: true },
                {
                    sender: 'someagent@example.com',
                    performative: 'request',
                    action: 'someAction',
                    gebo: 'https://proxygebo.com',
                    access_token: 'abc123',
                }).
            then(function(results) {
                test.equal(results.gebo, 'https://somegebo.com');
                test.equal(results.access_token, 'SomeAccessToken123');

                // Try the other action
                actionModule.actions.someOtherAction(
                        { resource: 'someOtherAction', execute: true },
                        {
                            sender: 'someagent@example.com',
                            performative: 'request',
                            action: 'someOtherAction',
                            gebo: 'https://proxygebo.com',
                            access_token: 'abc123',
                        }).
                    then(function(results) {
                        test.equal(results.gebo, 'https://someothergebo.com');
                        test.equal(results.access_token, 'SomeOtherAccessToken123');
                        test.done();
                      }).
                    catch(function(err) {
                        test.ok(false, err);      
                        test.done();
                      });
              }).
            catch(function(err) {
                test.ok(false, err);      
                test.done();
              });
    },

    // This test may be reduntant. Non-existent actions should be caught
    // in the perform route
    'Shouldn\'t barf if given an unspecified action to proxy': function(test) {
        test.expect(1);
        actionModule.actions.forward(
                { resource: 'someNonExistentAction', execute: true },
                {
                    sender: 'someagent@example.com',
                    performative: 'request',
                    action: 'someNonExistentAction',
                    gebo: 'https://proxygebo.com',
                    access_token: 'abc123',
                }).
            then(function(results) {
                test.equal(results.error, 'I don\'t know how to someNonExistentAction');
                test.done();
              }).
            catch(function(err) {
                test.ok(false, 'Shouldn\'t get here');      
                test.done();
              });
    },
};
