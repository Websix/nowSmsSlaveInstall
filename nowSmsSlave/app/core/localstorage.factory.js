(function() {
  angular.module('app.core')
    .factory('localstorage', localstorage);

  localStorage.$inject = ['$window'];

  function localstorage($window) {
    var service = {
      set: set,
      get: get,
      getJson: getJson
    }

    return service;
    /*functions*/
    function set(key, value) {
      if (_.isObject(value)) {
        value = JSON.stringify(value);
      }
      $window.localStorage.setItem(key, value);
    }
    function get(key) {
      return $window.localStorage.getItem(key);
    }

    function getJson(key) {
      return JSON.parse($window.localStorage.getItem(key));
    }
  }
})();
