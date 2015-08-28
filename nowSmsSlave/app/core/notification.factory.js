(function() {
  'use strict';

  angular.module('app.core')
    .factory('notification', NotificationService);

  NotificationService.$inject = ['agpAsync', 'config'];

  /**
   * Factory para eventuais notificaçoes
   * @param {Object} agpAsync serviço de parsing da revista rpi
   */
  function NotificationService(agpAsync, config) {
    var service = {
      onNotification: onNotification
    };

    init();

    return service;

    ////////////////////////////////////////////////////////////////////////
    // Implementation                                                     //
    ////////////////////////////////////////////////////////////////////////

    /**
     * Inicia a factory
     */
    function init() {
      agpAsync.onPing(function() {
        agpAsync.pong();
      });
    }

    /**
     * Binder para as notificaç~oes
     * @param  {function} handler callback
     */
    function onNotification(handler) {
      /**
      * Event bindings
      */
      agpAsync.onLeituraRpiFinalizada(function(revista) {
        onNotify(leituraRpiFinalizadaFilter, revista, handler);
      });

      agpAsync.onProcessoEncontrado(function(processo) {
        onNotify(processoEncontradoFilter, processo, handler);
      });

      agpAsync.onPdfFinish(function(path) {
        onNotify(pathPdfFilter, path, handler);
      });

      agpAsync.onTxtFinish(function(path) {
        onNotify(pathTxtFilter, path, handler);
      });

      agpAsync.onProgressoRevista(function(prog) {
        onNotify(progressFilter, prog, handler);
      });
    }

    /**
     * Adiciona a nova notificacao `a lista de notificacoes para que seja
     * @param  {Object} args Argumentos recebidos na funçao anterior
     */
    function onNotify(filter, data, cb) {
      return cb(filter(data));
    }

    /**
     * Gera a notificaçao de finalizaçao da leitura da RPI
     * @param  {Object} revista Objeto com os dados da revista
     * @return {Object}         Notificacao montada
     */
    function leituraRpiFinalizadaFilter(revista) {
      var data = moment(revista.data).format(config.brMomentformat);

      return {
        title: 'A leitura da revista rpi ' + revista.num + ' foi finalizada',
        body: 'A leitura da revista rpi' + revista.num + ' foi finalizada ' +
          'com  sucesso. Demorou ' + revista.temp + '. Quantidade ' +
          'de historico de processos salvos: ' + revista.his + '. Oposiçoes ' +
          'encontradas: ' + revista.ops + '. Data de leitura: ' + data +
          'Aguarde para a geraçao dos relatorios'
      };
    }

    /**
     * @todo  implementar passagem de dados para ambito global
     * Gera a notificacao de processo interno encontrado
     * @param  {Number} processo numero do processo interno encontrado
     * @return {Object}          Notificacao montada
     */
    function processoEncontradoFilter(processo) {
      return {
        title: 'O processo ' + processo + ' foi encontrado na revista',
        body: 'O processo interno ' + processo + ' foi encontrado na ulima revista na leitura atual'
      };
    }

    /**
     * @todo implementar passagem de dados para ambito global
     * Gera a notificacao de geracao de txt de processo
     * @param  {String} path Path para o arquivo txt no servidor
     * @return {Object}      Notificacao montada
     */
    function pathTxtFilter(path) {
      return {
        path: path,
        title: 'Geraçao do txt a partir da revista rpi foi finalizado',
        body: 'Clique aqui para baixar o arquivo txt da revista'
      };
    }

    /**
     * @todo implementar passagem de dados para ambito global
     * Gera a notificacao de geracao de pdf de processos internos
     * @param  {String} path Path para o arquivo pdf no servidor
     * @return {Object}      Notificacao montada
     */
    function pathPdfFilter(path) {
      return {
        path: path,
        title: 'Geraçao do pdf de internos a partir da revista rpi foi finalizado',
        body: 'Clique aqui para baixar o arquivo pdf da revista'
      };
    }

    /**
     * Filter para a notificacao de progresso
     * @param  {Number} data Progresso do arquivo
     * @return {Object}      Notificaçao em JSON
     */
    function progressFilter(data) {
      return {
        type: 'progress',
        title: 'Houve progresso no arquivo',
        body: 'O arquivo foi parseado ' + data + '%'
      };
    }
  }
})();
