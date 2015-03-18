'use strict';

var actionModule = require('..'),
    nconf = require('nconf'),
    performatives = require('gebo-performatives'),
    q = require('q');


nconf.file({ file: './gebo.json' });

/**
 * onLoad
 */
exports.onLoad =  {

    'Point all configured actions to the forward actions': function(test) {
        test.expect(6);
        test.equal(Object.keys(actionModule.actions).length, 5);
        test.equal(actionModule.bakeAPie, actionModule.forward);
        test.equal(actionModule.cleanTheToilet, actionModule.forward);
        test.equal(actionModule.hootLikeAnOwl, actionModule.forward);
        test.equal(actionModule.cleanTheToilet, actionModule.forward);
        test.equal(actionModule.getJiggyWithIt, actionModule.forward);
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
        test.expect(6);
        actionModule.actions.bakeAPie(
                { resource: 'kitchen', write: true },
                {
                    sender: 'someagent@example.com',
                    receiver: 'gebo@example.com',
                    performative: 'request',
                    action: 'bakeAPie',
                    gebo: 'https://proxygebo.com',
                    access_token: 'abc123',
                }).
            then(function(results) {
                test.equal(results.gebo, 'https://somegebo.com');
                test.equal(results.access_token, 'SomeAccessToken123');
                test.equal(results.sender, nconf.get('email'));

                // Try another action
                actionModule.actions.getJiggyWithIt(
                        { resource: 'broom', execute: true },
                        {
                            sender: 'someagent@example.com',
                            receiver: 'anothergebo@example.com',
                            performative: 'request',
                            action: 'getJiggyWithIt',
                            gebo: 'https://proxygebo.com',
                            access_token: 'abc123',
                        }).
                    then(function(results) {
                        test.equal(results.gebo, 'https://localhost:3443');
                        test.equal(results.access_token, 'SomeOtherAccessToken123');
                        test.equal(results.sender, nconf.get('email'));
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
//    'Shouldn\'t barf if given an unspecified action to proxy': function(test) {
//        test.expect(1);
//        actionModule.actions.forward(
//                { resource: 'someNonExistentAction', execute: true },
//                {
//                    sender: 'someagent@example.com',
//                    receiver: 'anothergebo@example.com',
//                    performative: 'request',
//                    action: 'someNonExistentAction',
//                    gebo: 'https://proxygebo.com',
//                    access_token: 'abc123',
//                }).
//            then(function(results) {
//                console.log('results', results);
//                test.ok(false, 'Shouldn\'t get here');      
//                test.done();
//              }).
//            catch(function(err) {
//                test.equal(err, 'I don\'t know how to someNonExistentAction');
//                test.done();
//              });
//    },

    'Shouldn\'t barf if no receiver is specified': function(test) {
        test.expect(1);
        actionModule.actions.forward(
                { resource: 'someResouce', execute: true },
                {
                    sender: 'someagent@example.com',
                    performative: 'request',
                    action: 'cleanTheToilet',
                    gebo: 'https://proxygebo.com',
                    access_token: 'abc123',
                }).
            then(function(results) {
                test.ok(false, 'Shouldn\'t get here');      
                test.done();
              }).
            catch(function(err) {
                test.equal(err, 'I don\'t know that receiver');
                test.done();
              });
    },

    'Shouldn\'t barf if an unknown receiver is specified': function(test) {
        test.expect(1);
        actionModule.actions.forward(
                { resource: 'someResouce', execute: true },
                {
                    sender: 'someagent@example.com',
                    receiver: 'someunkownagent@example.com',
                    performative: 'request',
                    action: 'cleanTheToilet',
                    gebo: 'https://proxygebo.com',
                    access_token: 'abc123',
                }).
            then(function(results) {
                test.equal(results.error, 'I don\'t know how to someNonExistentAction');
                test.done();
              }).
            catch(function(err) {
                test.equal(err, 'I don\'t know that receiver');
                test.done();
              });
    },
};
