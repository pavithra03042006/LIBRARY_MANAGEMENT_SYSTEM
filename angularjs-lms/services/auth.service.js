/**
 * AuthService — AngularJS equivalent of lib/auth-context.tsx
 *
 * Provides login(), logout(), getCurrentUser(), isAuthenticated().
 * Wraps user state in a singleton service (replaces React Context).
 */
angular.module('lmsApp')
  .service('AuthService', ['StorageService', '$rootScope', function (StorageService, $rootScope) {

    var self = this;

    // In-memory current user (mirrors React useState)
    var _currentUser = null;

    // ── Bootstrap on service creation ────────────────────────────────

    /**
     * Restore logged-in user from localStorage on app start.
     * Mirrors the useEffect in AuthProvider.
     */
    (function init() {
      _currentUser = StorageService.get(StorageService.KEYS.CURRENT_USER, null);
    })();

    // ── Public API ───────────────────────────────────────────────────

    /**
     * Authenticate a user by email + password.
     * Mirrors authenticateUser() + the login() fn in auth-context.tsx.
     * @param {string} email
     * @param {string} password
     * @returns {boolean} true on success
     */
    self.login = function (email, password) {
      var users = StorageService.get(StorageService.KEYS.USERS, []);
      var matched = users.find(function (u) {
        return u.email === email && u.password === password;
      });
      if (matched) {
        _currentUser = matched;
        StorageService.set(StorageService.KEYS.CURRENT_USER, matched);
        $rootScope.$broadcast('auth:login', matched);
        return true;
      }
      return false;
    };

    /**
     * Log out the current user.
     * Mirrors logout() in auth-context.tsx.
     */
    self.logout = function () {
      _currentUser = null;
      StorageService.set(StorageService.KEYS.CURRENT_USER, null);
      $rootScope.$broadcast('auth:logout');
    };

    /**
     * Return the currently logged-in user object or null.
     * @returns {Object|null}
     */
    self.getCurrentUser = function () {
      return _currentUser;
    };

    /**
     * Returns true if a user is currently logged in.
     * @returns {boolean}
     */
    self.isAuthenticated = function () {
      return _currentUser !== null;
    };

    /**
     * Returns true if the current user has any of the given roles.
     * @param {string[]} roles
     * @returns {boolean}
     */
    self.hasRole = function (roles) {
      if (!_currentUser) return false;
      return roles.indexOf(_currentUser.role) !== -1;
    };
  }]);
