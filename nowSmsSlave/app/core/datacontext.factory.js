(function() {
  angular.module('app.core')
    .factory('dataContext', dataContext);

  dataContext.$inject = ['$http', '$q'];

  function dataContext($http, $q) {
    var service = {
      getData: get, //pra nao precisar mudar em tudo ainda, compatibilidade
      get: get,
      post: post,
      put: put
    }

    return service;
    /*functions*/

    function get(url) {
      return $q(function(resolve, reject) {

        $http.get(url)
          .success(success)
          .error(error);

        function success(data) {
          resolve(data);
        }

        function error(err) {
          reject(err);
        }

      });
    }

    function post(url, params) {
      return $q(function(resolve, reject) {

        $http.post(url, params)
          .success(success)
          .error(error);

        function success(data) {
          resolve(data);
        }

        function error(err) {
          reject(err);
        }

      });
    }

    function put(url, params) {
      return $q(function(resolve, reject) {

        $http.put(url, params)
          .success(success)
          .error(error);

        function success(data) {
          resolve(data);
        }

        function error(err) {
          reject(err);
        }

      });
    }
  }
})();
