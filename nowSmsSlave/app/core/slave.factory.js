(function () {
    angular.module('app.core')
        .factory('slave', slave);

    slave.$inject = ["$http", "$q"];

    function slave($http, $q) {
        var data;
        var service = {
            getData: getData,
            setData: setData
        }

        return service;
        /*functions*/

        function getData() {
            return this.data;
        }

        function setData(data) {
            this.data = data;

        }
    }
})();