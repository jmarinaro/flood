'use strict';
const argon2 = require('argon2');
const fs = require('fs-extra');
const Datastore = require('nedb');

const config = require('../../config');

class Users {
  constructor() {
    this.ready = false;
    this.db = this.loadDatabase();
  }

  comparePassword(credentials, callback) {
    this.db.findOne({username: credentials.username}).exec((err, user) => {
      if (err) {
        return callback(null, err);
      }

      // Username not found.
      if (user == null) {
        return callback(null, user);
      }

      argon2
        .verify(user.password, credentials.password)
        .then(argon2Match => {
          if (argon2Match) {
            return callback(argon2Match);
          }

          callback(null, argon2Match);
        })
        .catch(error => callback(null, error));
    });
  }

  createUser(credentials, callback) {
    const {
      password,
      username,
      host,
      port,
      socketPath,
      isAdmin
    } = credentials;

    if (!this.ready) {
      return callback(null, 'Users database is not ready.');
    }

    if (username === '' || username == null) {
      return callback(null, 'Username cannot be empty.');
    }

    const socket = socketPath != null && socketPath !== '' && 0 < socketPath.trim().length;

    argon2
      .hash(password)
      .then(hash => {
        this.db.insert({ username, password: hash, host, port, socket, socketPath, isAdmin }, (error, user) => {
          if (error) {
            if (error.errorType === 'uniqueViolated') {
              error = 'Username already exists.';
            }

            return callback(null, error);
          }

          return callback({ username });
        });
      })
      .catch(error => callback(null, error));
  }

  removeUser(username, callback) {
    this.db.findOne({username: username}).exec((err, user) => {
      if (err) {
        return callback(null, err);
      }

      // Username not found.
      if (user == null) {
        return callback(null, user);
      }

      this.db.remove({username: username}, {}, (err, numRemoved) => {
        if (err) {
          return callback(null, err);
        }

        fs.removeSync(`${config.dbPath}${user._id}/`);

        return callback({username: username});
      });
    });
  }

  initialUserGate(handlers) {
    this.db.find({}, (err, users) => {
      if (users && users.length > 0) {
        return handlers.handleSubsequentUser();
      }

      return handlers.handleInitialUser();
    });
  }

  loadDatabase() {
    let db = new Datastore({
      autoload: true,
      filename: `${config.dbPath}users.db`
    });

    db.ensureIndex({fieldName: 'username', unique: true});

    this.ready = true;
    return db;
  }

  lookupUser(credentials, callback) {
    this.db.findOne({username: credentials.username}, (err, user) => {
      if (err) {
        return callback(err);
      }

      return callback(null, user);
    });
  }

  fetchById(userId, callback) {
    this.db.findOne({_id: userId}, (err, user) => {
      if (err) {
        return callback(err);
      }

      return callback(null, user);
    });
  }

  listUsers(callback) {
    this.db.find({}, (err, users) => {
      if (err) {
        return callback(null, err);
      }

      return callback(users.map((user) => {
        return {username: user.username};
      }));
    });
  }
}

module.exports = new Users();
