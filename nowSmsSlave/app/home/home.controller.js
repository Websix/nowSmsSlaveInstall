var vm;
(function(){
    angular.module('home')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['dataContext', 'localstorage', '$scope', '$http', 'Upload'];

    function HomeController(dataContext, localstorage, $scope, $http, Upload)
    {
        vm = this;

        /*Form*/
        vm.config = {};
        vm.controle = {};
        vm.controle.portas = '';
        vm.controle.qtdMsgs = '';
        vm.controle.intervalo = '';
        vm.form = {};
        vm.form.servidor = 'http://localhost:8080';
        vm.form.servidorProxy = 'http://localhost:2525';
        vm.form.numeros = '';
        vm.form.numerosConfirmacao = '';
        vm.form.mensagem = '';
        vm.form.qtdNumeros = 0;
        vm.form.qtdNumerosConfir = 0;
        vm.form.dcs = 1;
        vm.form.limite = 160;
        vm.form.user = 'bestuse';
        vm.form.pass = 'bestuse';
        vm.form.campoNumeros = 'A';
        vm.variaveis = [];
        vm.inc = 0;
        vm.qtdVars = 0;
        vm.msg = '';
        vm.qtdPreview = 1;
        vm.statusGateway = 'error';
        vm.status = '';
        vm.percent = 0;
        vm.loading = false;
        vm.excel = {};
        vm.divisao = 2;
        vm.stop = false;
        vm.processando = false;

        /*Funcoes*/
        vm.enviar = enviar;
        vm.visualizar = visualizar;
        vm.replaceNumsConfir = replaceNumsConfir;
        vm.addVar = addVar;
        vm.removerVar = removerVar;
        vm.getStatusGateway = getStatusGateway;
        vm.saveForm = saveForm;
        vm.addVariavel = addVariavel;
        vm.getNumbers = getNumbers;
        vm.valida = valida;
        vm.enviarTeste = enviarTeste;
        vm.stop = stop;

        start();


        $scope.$watch('files', function () {
             vm.uploadFile($scope.files);
        });

        function stop()
        {
            vex.dialog.confirm({
              message: 'Tem certeza que deseja interromper o processo?',
              callback: function(value) {
                return console.log(value ? 'Successfully destroyed the planet.' : 'Chicken.');
              }
            });
            //socketServer.emit('stop');
        }


        vm.uploadFile = function(files){

            var url = "http://localhost:8081/upload";

            if (files && files.length) {
                vm.loading = true;
                vm.processando = true;
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    Upload.upload({
                        url: url,
                        file: file
                    }).progress(function (evt) {
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                    }).success(function (data, status, headers, config) {
                        console.log('file ' + config.file.name + 'uploaded. Response: ' + data);

                        vm.excel = data;

                        vm.form.mensagem = vm.excel.mensagem;
                        vm.divisao = vm.excel.divisao;
                        reset();
                        if (vm.form.campoNumeros == '') {
                            vm.form.campoNumeros = 'A';
                        }
                        getNumbers(vm.form.campoNumeros);
                        vm.loading = false;
                        vm.processando = false;
                    });
                }
            }
        };

        function start() {
            var local = localstorage.getJson('nowslave.form');
            if (local !== null) {
                vm.form = localstorage.getJson('nowslave.form');
            }
            if(vm.form !== null) {
                reset();
                getStatusGateway();
                setInterval(function(){ getStatusGateway() }, 30000);
            }
        }

        function reset()
        {
            vm.form.numeros = '';
            vm.form.qtdNumeros = 0;
            vm.variaveis = [];
            vm.inc = 0;
            vm.qtdVars = 0;
            vm.processando = false;
        }

        function enviarTeste()
        {
            if(vm.statusGateway != 'errors') {

                for (var i = 0; i < vm.numeros.length > 5 ? 5 : vm.numeros.length; i++) {
                    var numero = vm.form.numeroteste;
                    if(numero == '') {
                        vex.dialog.alert('Sem número!');
                        return;
                    }
                    var mensagem = vm.form.identificacao + ':' + vm.form.mensagem;
                    if(mensagem == '') {
                        vex.dialog.alert('Arquivo não carregado!');
                        return;
                    }

                    for (var j = 0; j <= vm.variaveis.length - 1; j++) {
                        var variavel = vm.variaveis[j].var;
                        var valor = vm.variaveis[j].text.split(';')[i];
                        mensagem = mensagem.replace(variavel, valor);
                    }

                    console.log(mensagem);

                    sendSms(numero, mensagem, vm.form.dcs, 0);
                    vex.dialog.alert('Mensagem enviada!');
                }
            } else {
                vex.dialog.alert('Sem conexão com o gateway!');
            }
        }



        function valida()
        {
            var valido = false;
            if(vm.form !== null) {
                if (vm.form.numeros != '') {
                    valido = true;
                }
            }

            return valido;
        }

        /*Variaveis*/
        function addVariavel(letra) {
            var texto = getSelectionHtml();
            texto = texto.split(" ")[0];
            vm.variaveis[vm.inc] = {};

            vm.variaveis[vm.inc]['var'] = texto;
            vm.variaveis[vm.inc]['text'] = _.values(vm.excel['campos'][letra]).join(';');

            vm.addVar();
        }

        function addVar()
        {
            if (vm.variaveis[vm.inc] != undefined && vm.variaveis[vm.inc]['text'] != '' && vm.variaveis[vm.inc]['var'] != '' ) {
                vm.inc++;
                vm.qtdVars = 0;
            }
        }

        function removerVar(i)
        {
            vm.variaveis.remove(i);
            vm.inc = vm.variaveis.length;
        }
        /*END Variaveis*/
        function getNumbers(letra) {
            vm.numeros = vm.excel['campos'][letra];
            vm.form.numeros = _.values(vm.numeros).join(';');

            if (vm.form.numeros == '') {
                vm.form.qtdNumeros = 0;
            } else {
                vm.form.qtdNumeros = vm.numeros.length;
            }
        }

        function saveForm() {
            localstorage.set('nowslave.form', vm.form);
            if (vm.form.servidorProxy !== undefined) {
                getStatusGateway();
            }
        }

        function visualizar()
        {
            vm.previews = [];
            for (var i = 0; i < vm.qtdPreview; i++) {
                montarMsg(i, true);
            };
        }

        function enviar()
        {
            vm.status = '';
            vm.percent = 0;

            vm.incrementar = parseFloat(100 / vm.numeros.length);
            vm.config.quantidade = vm.controle.portas * vm.controle.qtdMsgs;
            vm.config.intervalo = vm.controle.intervalo * 1000;
            vm.config.contagem = 0;
            vm.config.intervaloInicial = 1;
            vm.processando = true;

            var url = 'http://localhost:8081/enviar';
            var promisse = dataContext.post(url, {vm: vm});


            promisse.then(function(res){
                console.log(res);
            });

            //processLargeArray(vm.numeros, vm.config);

        }


        function replaceNumsConfir()
        {
            if (vm.form.numerosConfirmacao == '') {
                vm.form.qtdNumerosConfir = 0;
            } else {
                vm.form.numerosConfirmacao = vm.form.numerosConfirmacao.replace(/\s+/g, ';');
                vm.form.qtdNumerosConfir = vm.form.numerosConfirmacao.count(';')+1;
            }
        }

        function getStatusGateway() {
            if(vm.form !== null) {
                var url = vm.form.servidorProxy + '/' + vm.form.servidor + '/admin/xmlstatus?user='+vm.form.user+'&password=' + vm.form.pass;
                var promisse = dataContext.get(url);

                promisse.then(function(data){
                    vm.statusGateway = xmlToJSON.parseString(data);
                }, function (e){
                    vm.statusGateway = 'error';
                });
            }
        }

         function sendSms(numero, text, dcs, i)
        {
            var url = vm.form.servidorProxy + '/' + vm.form.servidor + '/?PhoneNumber=' + numero + '&Text=' + encodeURIComponent(text) + '&DCS=' + dcs + '&User=' + vm.form.user + '&Password=' + vm.form.pass;
            var promisse = dataContext.get(url);

            return promisse.then(function(data){
                var msg;
                if (data.match(/Message Submitted/)) {
                    msg = (i + 1) + ': Mensagem enviada para gateway Numero : ' + numero + ' MSG: ' + text + '\n' ;
                    vm.statusEnvio = 'Enviando (' + (i+1) + '/' + vm.numeros.length + ')';
                }
                feedback(msg, i);
            },function(error){
                var msg = (i + 1) + ': Erro ao enviar mensagem para ' + numero + ' MSG: ' + text + '\n';
                vm.statusEnvio = 'Erro ao enviar (' + (i+1) + '/' + vm.numeros.length + ')';

                feedback(msg, i);
            });
        }

        function feedback(msg, i)
        {
            vm.status += msg;
            vm.percent += parseFloat(vm.incrementar);
            document.getElementById('status').scrollTop = document.getElementById("status").scrollHeight;
            if (i >= vm.numeros.length - 1) {// caso a posicao ja seja a ultima finaliza o envio
                reset();
                vex.dialog.alert('Envio Concluido!');
                vm.processando = false;
                vm.status += 'Envio Concluido' + '\n';
            }
        }

        function montarMsg(i, preview)
        {
            var msg = {};
            numero = vm.numeros[i];
            mensagem = vm.form.mensagem;

            for (var j = 0; j <= vm.variaveis.length - 1; j++) {
                var variavel = vm.variaveis[j].var;
                var valor = vm.variaveis[j].text.split(';')[i];
                mensagem = mensagem.replace(variavel, valor);
            };

            msg.texto =  mensagem;
            msg.numero =  numero;

            if (preview) {
                vm.previews.push(msg);
            } else {
                var retorno = sendSms(numero, mensagem, vm.form.dcs, i);
                return retorno;
            }
        }

      socket.on('updateInfo', function (info) {
        vm.status = info.status;
        vm.processando = info.processando;
        vm.percent = info.percent;
        vm.statusEnvio = info.statusEnvio;

        document.getElementById('status').scrollTop = document.getElementById("status").scrollHeight;

        console.log('updateInfo');
        $scope.$apply();
      });
    }
})();