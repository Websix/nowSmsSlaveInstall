(function() {
    "use strict";

    angular.module('app.core')
        .factory('filereader', filereader);

    // Dependencias
    filereader.$inject = [
        // Modulo de promisses do angular
        //
        // Necessitamos para sanitizar o progresso da leitura do arquivo
        '$q'
    ];

    /**
     * Factoy de leitura de arquivos
     * @param  {Object} $q Promisses
     * @return {Object}    Interface da factory
     */
    function filereader($q) {
        // Internals
        var fr = new FileReader();

        /**
         * FileReader Interface
         * @type {Object}
         */
        var service = {
            readAsBinary: readAsBinary,
            readAsDataUrl: readAsDataUrl,
            readAsArrayBuffer: readAsArrayBuffer,
            readAsText: readAsText
        };

        return service;

        ////////////////////////////////////////////////////////////////////////
        // Implementations                                                    //
        ////////////////////////////////////////////////////////////////////////

        /**
         * Le o arquivo como binario
         * @param  {Blob}   file Blob para ser lido
         * @return {Object}      Promisse para a leitura
         */
        function readAsBinary(file) {
            var deffered = setHandlerFunctions(fr);

            fr.readAsBinaryString(file);

            return deffered.promise;
        }

        /**
         * Le o arquivo como arquivo encodado em URL
         * @param  {Blob}   file Blob para ser lido
         * @return {Object}      Promisse para a leitura
         */
        function readAsDataUrl(file) {
            var deffered = setHandlerFunctions(fr);

            fr.readAsDataURL(file);

            return deffered.promise;
        }

        /**
         * Le o arquivo como arquivo encodado em ArrayBuffer
         * @param  {Blob}   file Blob para ser lido
         * @return {Object}      Promisse para a leitura
         */
        function readAsArrayBuffer(file) {
            var deffered = setHandlerFunctions(fr);

            fr.readAsArrayBuffer(file);

            return deffered.promise;
        }

        /**
         * Le o arquivo como arquivo como Texto
         * @param  {Blob}   file Blob para ser lido
         * @return {Object}      Promisse para a leitura
         */
        function readAsText(file) {
            var deffered = setHandlerFunctions(fr);

            fr.readAsText(file);

            return deffered.promise;
        }

        /**
         * Seta os handlers para o file readers
         * @param {FileReader} fr FileReader que vai receber os handlers
         * @return {Defer}        Promise generator
         */
        function setHandlerFunctions(fr) {
            var def = $q.defer();

            fr.onloadend = function() {
                var res = fr.result;

                // Gambiarra para remover o extra lido no base64
                if(res.match(/^data:;base64,/))
                    res = res.replace(/data:;base64,/, '');

                def.resolve(res);
            };

            fr.onerror = function(e) {
                def.reject(e);
            };

            fr.onprogress = function(e) {
                def.notify(e);
            };

            return def;
        }

    }
})();
