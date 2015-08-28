(function() {
  angular.module('app.core')
    .factory('fileExport', fileExport);

  function fileExport() {
    var service = {
      exportTable: exportTable
    }

    return service;
    /*functions*/
    //id da div que tem a table, nome do arquivo
    function exportTable(id, file) {
      var blob = new Blob([document.getElementById(id).innerHTML], {
        type: 'application/application/vnd.ms-excel;charset=utf-8'
      });
      saveAs(blob, file + '.xls');
    }
  }
})();
