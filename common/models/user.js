var config = require('../../server/config.json');
var path = require('path');
module.exports = function(user) {

  /* for test */
  user.observe('access', function logQuery(ctx, next) {
    console.log('Accessing %s matching %s', ctx.Model.modelName, ctx.query.where);
    console.log(ctx.query);
    next();
  });

  user.afterRemote('findById', function(ctx, instance, next) {
    console.log("After remoteMethod");
    var RoleModel = user.app.models.Role;
    var RoleMappingModel = user.app.models.RoleMapping;
    RoleModel.getRoles({
      principalType: RoleMappingModel.USER,
      principalId: instance.id
    }, function(err, roles) {
      if(!err){
        instance['roles'] = roles;
        next();
      }else {
        next(err);
      }
    });
  });
  /**
   * Sign up a user by with the given `credentials`.
   *
   * ```js
   * user.signup({email: 'email@abc.com', username: 'foo', password: 'bar'}, function (err, token) {
   * console.log(token.id);
   * });
   * ```
   *
   * @param {Object} credentials username/password or email/password
   * @callback {Function} callback Callback function
   * @param {Error} err Error object
   * @param {AccessToken} token Access token if sign up is successful
   */

  user.signup = function(credentials, cb) {
    user.create(credentials, function(err, instance) {
      if (!err) {
        user.login(credentials, 'user', function(err, token) {
          if (!err) {
            cb(null, token);
          } else {
            cb(err);
          }
        });
      } else {
        cb(err);
      }
    });
  }

  user.setPassword = function(req, cb) {

    //option 1. auto retrieve the access token 
    if (req.accessToken != null) {
      console.log("option 1!");
      console.log(req.accessToken);
      //cb(null, req.accessToken);
    }
    //option 2. user method findForRequest
    var AccessTokenModel = user.app.models.AccessToken;
    AccessTokenModel.findForRequest(req, function(err, token) {
      if (!err) {
        if (typeof token === 'undefined') return cb('TOKEN UNDEFINED');
        user.findById(token.userId, function(err, user) {
          if (err) return cb(err);
          user.updateAttribute('password', req.body.password, function(err, user) {
            if (err) return cb(err);
            console.log('> password reset processed successfully');
            cb(null, user);
          });
        });
      } else {
        cb(err);
      }
    });
  }

  user.remoteMethod(
    'signup', {
      description: 'Sign up a user with username/email and password',
      accepts: [{
        arg: 'credentials',
        type: 'object',
        required: true,
        http: {
          source: 'body'
        }
      }],
      returns: {
        arg: 'accessToken',
        type: 'object',
        root: true,
        description: 'The response body contains properties of the AccessToken created on login.\n' +
          '  - `user` - `{User}` - Data of the currently logged in user. (`include=user`)\n\n'
      },
      http: {
        verb: 'post'
      }
    }
  );
  user.remoteMethod(
    'setPassword', {
      description: 'Set password for user with given access token',
      accepts: [{
        arg: 'password',
        type: 'object',
        required: true,
        http: {
          source: 'req'
        }
      }],
      returns: {
        arg: 'user',
        type: 'object',
        root: true,
        description: 'The response body contains properties of a user.\n' +
          '  - `user` - `{User}` - Data of the user owned the access token.\n\n'
      },
      http: {
        verb: 'post'
      }
    });
  //send verification email after registration
  // user.afterRemote('create', function(context, user) {
  //   console.log('> user.afterRemote triggered');

  //   var options = {
  //     type: 'email',
  //     to: user.email,
  //     from: 'noreply@loopback.com',
  //     subject: 'Thanks for registering.',
  //     template: path.resolve(__dirname, '../../server/views/verify.ejs'),
  //     redirect: '/verified',
  //     user: user
  //   };

  //   user.verify(options, function(err, response) {
  //     if (err) {
  //       next(err);
  //       return;
  //     }

  //     console.log('> verification email sent:', response);

  //     context.res.render('response', {
  //       title: 'Signed up successfully',
  //       content: 'Please check your email and click on the verification link ' + 'before logging in.',
  //       redirectTo: '/',
  //       redirectToLinkText: 'Log in'
  //     });
  //   });
  // });

  //send password reset link when requested
  user.on('resetPasswordRequest', function(info) {
    console.log(info); // the email of the requested user
    console.log(info.accessToken.id); // the temp access token to allow password reset
    info.url = 'http://' + config.host + ':' + config.port + '/#/account/reset_password';
    var ejs = require('ejs'),
      fs = require('fs'),
      template = path.resolve(__dirname, '../../server/views/password_reset.ejs');

    fs.readFile(template, 'utf-8', function(err, data) {
      if (err) throw err;
      var html = ejs.render(data, info);
      user.app.models.Email.send({
        to: info.email,
        from: info.email,
        subject: 'Password reset',
        html: html
      }, function(err) {
        if (err) return console.log('> error sending password reset email');
        console.log('> sending password reset email to:', info.email);
      });
    });
  });
};
