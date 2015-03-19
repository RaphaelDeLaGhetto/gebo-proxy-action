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
        test.expect(7);
        test.equal(Object.keys(actionModule.actions).length, 7);
        test.equal(actionModule.actions.bakeAPie, actionModule.actions.forward);
        test.equal(actionModule.actions.save, actionModule.actions.forward);
        test.equal(actionModule.actions.cleanTheToilet, actionModule.actions.forward);
        test.equal(actionModule.actions.hootLikeAnOwl, actionModule.actions.forward);
        test.equal(actionModule.actions.cleanTheToilet, actionModule.actions.forward);
        test.equal(actionModule.actions.getJiggyWithIt, actionModule.actions.forward);
        test.done();
    },

    'Should structure dot-notation actions approriately': function(test) {
        test.expect(1);
        test.equal(actionModule.actions.accountant.doTaxes, actionModule.actions.forward);
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

    'Forward the message to the destination set in gebo.json if permissions are correct': function(test) {
        test.expect(6);
        actionModule.actions.bakeAPie(
                { resource: 'bakeAPie', read: false, write: false, execute: true, },
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

                // Try performing an action on a resource
                actionModule.actions.getJiggyWithIt(
                        { resource: 'loveSongs', read: true, write: true, execute: false, },
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

    'Should not forward the message to the destination set in gebo.json if permissions are incorrect': function(test) {
        test.expect(2);
        actionModule.actions.bakeAPie(
                { resource: 'bakeAPie', read: true, write: true, execute: false, },
                {
                    sender: 'someagent@example.com',
                    receiver: 'gebo@example.com',
                    performative: 'request',
                    action: 'bakeAPie',
                    gebo: 'https://proxygebo.com',
                    access_token: 'abc123',
                }).
            then(function(results) {
                test.ok(false);
                test.done();
              }).
            catch(function(err) {
                test.equal(err, 'You are not permitted to request or propose that action');      

                // Try another action
                actionModule.actions.getJiggyWithIt(
                        { resource: 'loveSongs', read: false, write: true, execute: true },
                        {
                            sender: 'someagent@example.com',
                            receiver: 'anothergebo@example.com',
                            performative: 'request',
                            action: 'getJiggyWithIt',
                            gebo: 'https://proxygebo.com',
                            access_token: 'abc123',
                        }).
                    then(function(results) {
                        test.ok(false, err);
                        test.done();
                      }).
                    catch(function(err) {
                        test.equal(err, 'You are not permitted to request or propose that action');      
                        test.done();
                      });
              });
    },

    'Don\'t let a foreign agent with only read permissions write a resource': function(test) {
        test.expect(1);
        actionModule.actions.save(
                { resource: 'manifesto', read: true, write: false, execute: false },
                {
                    sender: 'someagent@example.com',
                    receiver: 'gebo@example.com',
                    performative: 'request',
                    action: 'save',
                    gebo: 'https://proxygebo.com',
                    access_token: 'abc123',
                }).
            then(function(results) {
                test.ok(false);
                test.done();
              }).
            catch(function(err) {
                test.equal(err, 'You are not permitted to request or propose that action');      
                test.done();
              });
    },

    'Let a foreign agent with only write permissions write a resource': function(test) {
        test.expect(3);
        actionModule.actions.save(
                { resource: 'manifesto', read: false, write: true, execute: false },
                {
                    sender: 'someagent@example.com',
                    receiver: 'gebo@example.com',
                    performative: 'request',
                    action: 'save',
                    gebo: 'https://proxygebo.com',
                    access_token: 'abc123',
                }).
            then(function(results) {
                test.equal(results.gebo, 'https://somegebo.com');
                test.equal(results.access_token, 'SomeAccessToken123');
                test.equal(results.sender, nconf.get('email'));
 
                test.done();
              }).
            catch(function(err) {
                test.ok(false);
                test.done();
              });
    },

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
                test.ok(false);
                test.done();
              }).
            catch(function(err) {
                test.equal(err, 'I don\'t know that receiver');
                test.done();
              });
    },

    'Shouldn\'t barf if an unknown action is specified': function(test) {
        test.expect(1);
        actionModule.actions.forward(
                { resource: 'someResouce', execute: true },
                {
                    sender: 'someagent@example.com',
                    receiver: 'gebo@example.com',
                    performative: 'request',
                    action: 'composeHaiku',
                    gebo: 'https://proxygebo.com',
                    access_token: 'abc123',
                }).
            then(function(results) {
                test.equal(results.error, 'I don\'t know how to composeHaiku');
                test.done();
              }).
            catch(function(err) {
                test.ok(false);
                test.done();
              });
    },
};
