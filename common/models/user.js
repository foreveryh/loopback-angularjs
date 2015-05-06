var config = require('../../server/config.json');
var path = require('path');

module.exports = function(user) {
  /**
   * Sign up a user by with the given `credentials`.
   *
   * ```js
   * user.register({email: 'email@abc.com', username: 'foo', password: 'bar'}, function (err, token) {
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
        user.login(credentials, function(err, token) {
          if (!err) {
            cb(null, token);
            console.log(token);
          } else {
            cb(err, null);
          }
        });
      } else {
        cb(err, null);
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
  //send verification email after registration
  user.afterRemote('create', function(context, user) {
    console.log('> user.afterRemote triggered');

    var options = {
      type: 'email',
      to: user.email,
      from: 'noreply@loopback.com',
      subject: 'Thanks for registering.',
      template: path.resolve(__dirname, '../../server/views/verify.ejs'),
      redirect: '/verified',
      user: user
    };

    user.verify(options, function(err, response) {
      if (err) {
        next(err);
        return;
      }

      console.log('> verification email sent:', response);

      context.res.render('response', {
        title: 'Signed up successfully',
        content: 'Please check your email and click on the verification link ' + 'before logging in.',
        redirectTo: '/',
        redirectToLinkText: 'Log in'
      });
    });
  });

  //send password reset link when requested
  user.on('resetPasswordRequest', function(info) {
    var url = 'http://' + config.host + ':' + config.port + '/reset-password';
    var html = 'Click <a href="' + url + '?access_token=' + info.accessToken.id + '">here</a> to reset your password';

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
};
