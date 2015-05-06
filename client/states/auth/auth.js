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

    if ($state && (!$state.transitionTo || !$state.get)) {
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
          $state.transitionTo(state);
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

      }
      return true;
    };
    /**
     * Invokes authenticationRequired/accessDeniedHandler if route is protected. 
     * Returns false if access should be denied.
     */
    var checkAccessToRoute = function(route) {
      if (route.$$route) {

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
          transitionTo(loginRoute);
        });
      },
      accessDeniedHandler: function() {
        $timeout(function() {
          transitionTo(defaultRoute, true);
        });
      },
      authenticationSuccessHandler: function() {
        $timeout(function() {
          transitionTo(defaultRoute, true);
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
      //Get and set session token
      token: token,
      // Activate the session (set token, load user, start heartbeat, trigger event)
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
      resetPassword: resetPassword,
      // Set new password
      setPassword: setPassword,
      // Check if the user has permission
      hasPermission: hasPermission,
      // Check if the user has features
      hasFeature: hasFeature,
      // Load the logged in user
      loadUser: loadUser,
      // Load the logged in user with a promise
      getCurrent: getCurrent,
      // Start session heartbeat
      startHeartbeat: startHeartbeat
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
              user.getCurrent().then(function() {
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
        defaultRoute = '';

        for (var state in states) {
          // Add resolver for user and permissions
          states[state].resolve = (states[state].resolve || {});
          angular.extend(states[state].resolve, authResolver);

          // Found the login state
          if (states[state].data && states[state].data.login) {
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

    }

    function token(value) {
      if (value) {
        token = value;

        status.authorized = true;
        status.authenticated = true;
        $rootScope.user.authorized = true;
        $rootScope.user.authenticated = true;
      }

      return token;
    }

    function activateSession(token, callback) {
      var that = this;
      this.token(token);
      this.startHeartbeat(options.heartbeatInterval);

      // Load the logged in user
      this.loadUser(function(error, result) {
        if (!error) {
          callback && callback(error, result);

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
      });
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

      User.create(credentials,
        function(result) {
          $log.info(result);
          // Success - Log in the user
          //that.login(result);
        },
        function(error) {
          $log.error(error);
          callback && callback(error, null);
        });
    }

    function verifyEmail() {

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

    function logout() {

    }

    function resetPassword() {

    }

    function setPassword() {

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
      user = User.getCachedCurrent();
      if (!user) {
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
      }
    }

    function getCurrent() {
      var deferred = $q.defer();
      var that = this;

      try {
        if (this.current.user_id) {
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

    function startHeartbeat() {

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
