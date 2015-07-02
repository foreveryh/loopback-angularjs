// 2015-05-03
//Immediately Invoked Function Expressions (IIFE)
// (function() {
//   angular.module('Shu.auth', []);
// })();
angular.module('Shu.auth', []);
(function() {
  'use strict';

  // Function to detect if a route is public or not
  var isPublic = function(route) {
    return (route && (route.public == true || route.login == true || route.verify_email == true || route.set_password == true));
  };

  //Auth factory
  angular
    .module('Shu.auth')
    .factory('authFactory', authFactory);

  authFactory.$inject = ['$rootScope', '$location', '$injector', '$log', '$timeout', 'User'];

  function authFactory($rootScope, $location, $injector, $log, $timeout, User) {
    var user = {};
    var options = null;
    var token = null;
    var status = {
      authorized: false,
      authenticated: false
    };
    var previousRoute = null;
    var defaultRoute = null;
    var loginRoute = null;
    var states = {};

    // Check if either ng-route or ui-router is present
    if ($injector.has) {
      var $route = $injector.has('$route') ? $injector.get('$route') : null;
      var $state = $injector.has('$state') ? $injector.get('$state') : null;
    } else {
      var $route = $injector.get('$route');
      var $state = null;
    }

    if ($state && (!$state.go || !$state.get)) {
      // This is not the correct $state service
      $state = null;
    }

    if (!$state && !$route) {
      $log.warn('The UserApp module needs either ng-route or ui-router to work as expected.');
    }

    if ($state) {
      // Get the list of all states
      var stateList = $state.get();
      for (var i = 0; i < stateList.length; ++i) {
        states[stateList[i].name] = stateList[i];
      }
    }

    var transitionTo = function(state, useLocation) {
      if ($state) {
        if (useLocation) {
          $location.path(states[state].url);
        } else {
          $state.go(state);
        }
      } else if ($route) {
        $location.path(state);
      }
    };
    /**
     * Invokes authenticationRequired/accessDeniedHandler if state is protected.
     * Returns false if access should be denied.
     */
    var checkAccessToState = function(state, stateParams) {
      if (state) {
        if ((!state.data || (state.data && isPublic(state.data) == false)) && status.authenticated == false) {
          service.authenticationRequiredHandler(state, stateParams);
          return false;
        } else if (state.data && state.data.hasPermission && user.permissions) {
          if (!service.hasPermission(state.data.hasPermission)) {
            service.accessDeniedHandler(user, state, stateParams);
            return false;
          }
        }
        // Only do auth check if user is loaded (indicated by user_id present)
        else if (state.data && state.data.authCheck && user.user_id) {
          if (!state.data.authCheck(user, stateParams)) {
            service.accessDeniedHandler(user, state, stateParams);
            return false;
          }
        }
      }
      return true;
    };

    /**
     * Invokes authenticationRequired/accessDeniedHandler if route is protected. 
     * Returns false if access should be denied.
     */
    var checkAccessToRoute = function(route) {
      if (route.$$route) {
        if (isPublic(route.$$route) == false && status.authenticated == false) {
          service.authenticationRequiredHandler(route);
          return false;
        } else if (route.$$route.hasPermission && user.permissions && !service.hasPermission(route.$$route.hasPermission)) {
          service.accessDeniedHandler(user, route);
          return false;
        } else if (route.$$route.authCheck && status.authenticated && !route.$$route.authCheck(user)) {
          service.accessDeniedHandler(user, route);
          return false;
        }
      }
      return true;
    };

    // Expose the user object to HTML templates via the root scope
    $rootScope.user = user;
    $rootScope.user.authorized = false;
    $rootScope.user.authenticated = false;

    var service = {
      authenticationRequiredHandler: function() {
        $timeout(function() {
          $log.info("authenticationRequiredHandler");
          transitionTo(loginRoute);
        });
      },
      accessDeniedHandler: function() {
        $timeout(function() {
          $log.info("accessDeniedHandler");
          transitionTo(defaultRoute, false);
        });
      },
      authenticationSuccessHandler: function() {
        $timeout(function() {
          $log.info("authenticationSuccessHandler");
          transitionTo(defaultRoute, false);
        });
      },

      /**
       * Overwrites the default handler that is invoked if a route/state is activated that requires authentication
       * but no user is logged in. If the Angular router is used, the handler is passed the route that requires
       * authentication. If UI router is used, the handler is passed the state that requires authentication, and
       * its state parameters.
       */
      onAuthenticationRequired: function(handler) {
        this.authenticationRequiredHandler = handler;
      },

      /**
       * Overwrites the default handler that is invoked if a user authenticates successfully.
       */
      onAuthenticationSuccess: function(handler) {
        this.authenticationSuccessHandler = handler;
      },

      /**
       * Overwrites the default handler that is invoked if a route/state is activated that the currently logged in
       * user has no access to. Access is denied if the user does not have a required permission or authCheck
       * returns false.
       * The currently logged in user is the first parameter passed to the handler.
       * If the Angular router is used, the handler is passed the route that access was denied to. If UI router is
       * used, the handler is passed the state that access was denied to, and its state parameters.
       */
      onAccessDenied: function(handler) {
        this.accessDeniedHandler = handler;
      },
      // Initialize the service
      init: initializeService,
      // The logged in user
      current: user,
      // Status of current session
      status: function() {
        return status;
      },
      //reset session
      reset: resetSession,
      // Activate the session (set token, load user, trigger event)
      activate: activateSession,
      // Sign up a new user and logs in
      signup: signup,
      // Verify email address with a token
      verifyEmail: verifyEmail,
      // Start new session / Login user
      login: login,
      // End session / Logout user
      logout: logout,
      // Send reset password email
      requestResetPassword: requestResetPassword,
      // Set new password
      resetPassword: resetPassword,
      // Check if the user has permission
      hasPermission: hasPermission,
      // Check if the user has features
      hasFeature: hasFeature,
      // Load the logged in user
      loadUser: loadUser,
      // Load the logged in user with a promise
      getCurrentUser: getCurrentUser
    };

    // Extend the current user with hasPermission() and hasFeature()
    angular.extend(user, {
      hasPermission: function(permissions) {
        return service.hasPermission(permissions);
      },
      hasFeature: function(features) {
        return service.hasFeature(features);
      }
    });
    return service;

    //////////////////////
    function initializeService(config) {
      var that = this;
      var authResolver = {
        auth: function($q, user) {
          if ($state) {
            //Question: what's this self?
            var state = states[this.self.name];
          }

          if (isPublic($route ? $route.current.$$route : state) == false) {
            var deferred = $q.defer();

            try {
              user.getCurrentUser().then(function() {
                if ($route ? checkAccessToRoute($route.current) : checkAccessToState(state)) {
                  deferred.resolve();
                } else {
                  deferred.reject();
                }
              }, function() {
                deferred.reject();
              });
            } catch (e) {
              deferred.reject(e);
            }

            return deferred.promise;
          } else {
            return true;
          }
        }
      };
      options = config;

      if ($state) {
        // Set the default state
        defaultRoute = 'recommend';

        for (var state in states) {
          // Add resolver for user and permissions
          states[state].resolve = (states[state].resolve || {});
          angular.extend(states[state].resolve, authResolver);

          // Found the login state
          if (states[state].data && states[state].login) {
            loginRoute = state;
          }
        }
      } else if ($route) {
        // Find the default route
        defaultRoute = ($route.routes.null || {
          redirectTo: ''
        }).redirectTo;

        for (var route in $route.routes) {
          // Add resolver for user and permissions
          $route.routes[route].resolve = ($route.routes[route].resolve || {});
          angular.extend($route.routes[route].resolve, authResolver);

          // Found the login route
          if ($route.routes[route].login) {
            loginRoute = $route.routes[route].originalPath;
          }
        }
      }
      //Todo: If a token is present, use that for authentication
      if (token) {
        this.activate(token);
      }
      // Listen for route changes
      if ($state) {
        $rootScope.$on('$stateChangeStart', function(ev, toState, toParams) {
          // Check if this is the verify email route
          if (toState.data && toState.data.verify_email == true) {
            toState.controller = verifyEmailController;

            if (toState.views && toState.views['']) {
              toState.views[''].controller = verifyEmailController;
            }

            return;
          }

          if (!checkAccessToState(toState, toParams)) {
            ev.preventDefault();
          }
        });
        //Todo: transitionTo previousRoute
        $rootScope.$on('$stateChangeSuccess', function(ev, toState, toParams, from, fromParams) {
          // get the previous state
          if (from.name) {
            previousRoute = from.name;
          }
        });

      } else if ($route) {
        $rootScope.$on('$routeChangeStart', function(ev, data) {
          // Check if this is the verify email route
          if (data.$$route && data.$$route.verify_email == true) {
            data.$$route.controller = verifyEmailController;
            return;
          }

          if (!checkAccessToRoute(data)) {
            ev.preventDefault();
          }
        });
      }
    }

    function resetSession() {
      token = null;
      status.authorized = false;
      status.authenticated = false;

      //Todo: Remove session

      for (var key in user) {
        delete user[key];
      }

      // Check access to the current route/state again, now that session is reset
      if ($state) {
        checkAccessToState($state.current, $state.params);
      } else if ($route) {
        checkAccessToRoute($route.current);
      }
    }

    function activateSession(accessToken, callback) {
      var that = this;
      if (accessToken && accessToken.id) {
        //Ignored: session token has been saved in LoopBackAuth.
        token = accessToken.id;
        status.authorized = true;
        status.authenticated = true;
        $rootScope.user.authorized = true;
        $rootScope.user.authenticated = true;
      } else {
        callback && callback("Got accessToken Faild", null);
      }
      // Load the logged in user
      var cachedUser = User.getCachedCurrent();
      if (cachedUser) {
        angular.extend(user, cachedUser);
        callback && callback(null, user);
        // Check access to the current route/state again, now that session is activated
        if ($state) {
          checkAccessToState($state.current, $state.params);
        } else if ($route) {
          checkAccessToRoute($route.current);
        }
        $rootScope.$broadcast('user.login');
      } else {
        that.reset();
      }

    }

    function signup(credentials, callback) {
        var that = this;
        this.reset();

        if (!credentials.password) {
          callback && callback({
            name: 'MISSING_PASSWORD',
            message: "Please enter a password."
          }, null);
          return;
        }

        User.signup(credentials,
          function(result) {
            $log.info(result);
            that.authenticationSuccessHandler();
          },
          function(error) {
            $log.error(error);
            callback && callback(error, null);
          });
      }
      //Todo
    function verifyEmail(callback) {
      var that = this;
      var params = {
        uid: "",
        token: "",
        redirect: ""
      };

      User.confirm(params,
        function(result) {
          callback && callback(null, result);
        },
        function(error) {
          callback && callback(error, null);
        });
    }

    function login(credentials, callback) {
        var that = this;
        this.reset();

        User.login(credentials,
          function(result) {
            if (result) {
              //Todo: if Email not verified
              if (false) {

              } else {
                that.activate(result, callback);
                // Invoke the authenticationSuccessHandler handler
                that.authenticationSuccessHandler();
              }
            }
          },
          function(error) {
            callback && callback(error, null);
          }
        );
      }
      //Todo
    function logout(callback) {
        var that = this;

        User.logout(
          function(result) {
            that.reset();
            callback && callback(null, result);
          },
          function(error) {
            callback && callback(error, null);
          });
      }
      //Todo
    function requestResetPassword(user, callback) {
        var that = this;
        this.reset();
        User.resetPassword(user,
          function(result) {
            $log.info(result);
            callback && callback(null, result);
          },
          function(error) {
            $log.warn(error);
            callback && callback(error, null);
          });
      }
      //Todo
    function resetPassword(newPassword, callback) {
      var that = this;
      this.reset();
      User.setPassword(newPassword,
        function(result) {
          $log.info(result);
          that.authenticationRequiredHandler();
        },
        function(error) {
          $log.warn(error);
          callback && callback(error, null);
        });
    }

    function hasPermission(permissions) {
      if (!this.current || !this.current.permissions || !permissions) {
        return false;
      }

      if (typeof(permissions) != 'object') {
        permissions = [permissions];
      }

      for (var i = 0; i < permissions.length; ++i) {
        if (!(this.current.permissions[permissions[i]] && this.current.permissions[permissions[i]].value === true)) {
          return false;
        }
      }

      return true;
    }

    function hasFeature(features) {
      if (!this.current || !this.current.features || !features) {
        return false;
      }

      if (typeof(features) != 'object') {
        features = [features];
      }

      for (var i = 0; i < features.length; ++i) {
        if (!(this.current.features[features[i]] && this.current.features[features[i]].value === true)) {
          return false;
        }
      }

      return true;
    }

    function loadUser(callback) {
      var that = this;
      result = User.getCachedCurrent();
      if (!result) {
        User.getCurrent(
          function(result) {
            $timeout(function() {
              angular.extend(user, result);
              callback && callback(null, result);
            });
          },
          function(error) {
            callback && callback(error, null);
          });
      } else {
        angular.extend(user, result);
        callback && callback(null, user);
      }
    }

    function getCurrentUser() {
      var deferred = $q.defer();
      var that = this;

      try {
        if (this.current.id) {
          deferred.resolve(this.current);
        } else {
          //Question: what's the following meaning?
          var turnOff = $rootScope.$on('user.login', function() {
            deferred.resolve(that.current);
            turnOff();
          });
        }
      } catch (e) {
        deferred.reject(e);
      }

      return deferred.promise;
    }
  }

  ////Directives
  // Login directive 
  angular
    .module('Shu.auth')
    .directive('uLogin', uLogin);

  uLogin.$inject = ['$rootScope', '$timeout', 'authFactory'];

  function uLogin($rootScope, $timeout, authFactory) {
      var directive = {
        restrict: 'A',
        link: linkFunc
      };
      return directive;

      function linkFunc(scope, element, attrs) {
        var evHandler = function(e) {
          e.preventDefault();

          if (scope.loading) {
            return false;
          }
          $timeout(function() {
            scope.error = null;
            scope.loading = true;
          });

          authFactory.login({
            email: this.email.value,
            password: this.password.value
          }, function(error, result) {
            if (error) {
              $timeout(function() {
                scope.error = error;
                scope.loading = false;
              });
              return handleError(scope, error, attrs.uaError);
            } else {
              $timeout(function() {
                scope.loading = false;
              });
            }
          });

          return false;
        };
        element.on ? element.on('submit', evHandler) : element.bind('submit', evHandler);
      }
    }
    // Signup directive
  angular
    .module('Shu.auth')
    .directive('uSignup', uSignup);

  uSignup.$inject = ['$rootScope', '$timeout', 'authFactory'];

  function uSignup($rootScope, $timeout, authFactory) {
      var directive = {
        restrict: 'A',
        link: linkFunc
      };
      return directive;

      function linkFunc(scope, element, attrs) {
        var evHandler = function(e) {
          e.preventDefault();

          if (scope.loading) {
            return false;
          }

          $timeout(function() {
            scope.error = null;
            scope.loading = true;
          });
          // Create the sign up object
          var object = {};
          for (var i = 0; i < this.elements.length; ++i) {
            if (this.elements[i].name) {
              var scopes = this.elements[i].name.split('.');
              if (scopes.length > 1) {
                object[scopes[0]] = object[scopes[0]] || {};
                object[scopes[0]][scopes[1]] = this.elements[i].value;
              } else {
                object[this.elements[i].name] = this.elements[i].value;
              }
            }
          }
          console.log(object);
          // Sign up
          authFactory.signup(object, function(error, result) {

            if (error) {
              if (error.name != 'EMAIL_NOT_VERIFIED') {
                $timeout(function() {
                  scope.error = error;
                  scope.loading = false;
                });
                return handleError(scope, error, attrs.signup_errors);
              } else {
                $timeout(function() {
                  scope.verificationEmailSent = true;
                  scope.loading = false;
                });
              }
            }
          });

          return false;
        };

        element.on ? element.on('submit', evHandler) : element.bind('submit', evHandler);
      }
    }
    //reset password directvie 
  angular
    .module('Shu.auth')
    .directive('uResetPassword', uResetPassword);

  uResetPassword.$inject = ['$rootScope', '$timeout', 'authFactory'];

  function uResetPassword($rootScope, $timeout, authFactory) {
    var directive = {
      restrict: 'A',
      link: linkFunc
    };
    return directive;

    function linkFunc(scope, element, attrs) {
      var evHandler = function(e) {
        e.preventDefault();

        if (scope.loading) {
          return false;
        }
        $timeout(function() {
          scope.error = null;
          scope.loading = true;
        });
        console.log(this.access_token.value);
        console.log(this.user_password.value);
        console.log(this.user_password_confirmation.value);
        if (this.user_password.value !== user_password_confirmation.value) {
          scope.error = 'password is not same';
          return handleError(scope, error, attrs.reset_errors);
        }
        //reset password request
        authFactory.resetPassword({
          access_token: this.access_token.value,
          password: this.user_password.value
        }, function(error, result) {
          if (error) {
            $timeout(function() {
              scope.error = error;
              scope.loading = false;
            });
            return handleError(scope, error, attrs.reset_errors);
          } else {
            $timeout(function() {
              scope.loading = false;
            });
          }
        });
        return false;
      };
      element.on ? element.on('submit', evHandler) : element.bind('submit', evHandler);
    }
  };
  //request reset password directive
  angular
    .module('Shu.auth')
    .directive('uRequestResetPassword', uRequestResetPassword);

  uRequestResetPassword.$inject = ['$rootScope', '$timeout', 'authFactory'];

  function uRequestResetPassword($rootScope, $timeout, authFactory) {
      var directive = {
        restrict: 'A',
        link: linkFunc
      };
      return directive;

      function linkFunc(scope, element, attrs) {
        var evHandler = function(e) {
          e.preventDefault();

          if (scope.loading) {
            return false;
          }

          $timeout(function() {
            scope.error = null;
            scope.loading = true;
          });

          authFactory.requestResetPassword({
            email: this.email.value
          }, function(error, result) {
            if (error) {
              $timeout(function() {
                scope.error = error;
                scope.loading = false;
              });
              return handleError(scope, error, attrs.reset_errors);
            } else {
              $timeout(function() {
                scope.emailSent = true;
                scope.loading = false;
              });
            }
          });
          return false;
        };
        element.on ? element.on('submit', evHandler) : element.bind('submit', evHandler);
      }
    }
    // Directive error handler
  var handleError = function(scope, error, elementId) {
    if (!error) {
      return;
    }

    error.handled = false;

    if (elementId) {
      error.handled = true;
      angular.element(document.getElementById(elementId)).text(error.message);
    }

    scope.$emit('user.error', error);
  };
})();
