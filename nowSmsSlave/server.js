var restify = require('restify');
var fs = require('fs');
var XLSX = require('xlsx');
var httpreq = require('httpreq');

var letterNumber;
var vm;


var server = restify.createServer();
var io = require('socket.io').listen(server.server);

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.use(
  function crossOrigin(req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    return next();
  }
);

server.post('/upload', upload);
server.post('/enviar', enviar);

function enviar(req, res, next)
{

    setInterval(function(){
        io.emit('updateInfo', vm);
    }, 10000);

    vm = req.body.vm;
    var numeros = req.body.vm.numeros;
    var config = req.body.vm.config;

    console.log('Processando Envios...');

    processLargeArray(numeros, config);

    res.json({status: true});
    return next();
}

function enviarConfirmacao(i, cb)
{
    if (vm.form.numerosConfirmacao != undefined) { //envia confirmacao caso tenha sido configurada
        numerosConfirmacao = vm.form.numerosConfirmacao.split(';');
        ultimo = vm.numeros.length - 1;
        metade = Math.round(ultimo  / 2);

        if (i !== false) {
            for (var j = 0; j <= numerosConfirmacao.length - 1; j++) {
                if (i == 0) {// msg do inicio
                        sendSingleSms(numerosConfirmacao[j], vm.form.identificacao + ': Fila de envio Iniciada.(' + (i+1) + ')', vm.form.dcs)
                }
                if (i == metade) {// msg do meio
                        sendSingleSms(numerosConfirmacao[j], vm.form.identificacao + ': Fila de envio na metade.(' + (i+1) + ')', vm.form.dcs)
                }
                if (i == ultimo) {// msg do fim
                        sendSingleSms(numerosConfirmacao[j], vm.form.identificacao + ': Fila de envio finalizada.(' + (i+1) + ')', vm.form.dcs)
                }
                if (i % vm.controle.confirmarcada == 0) {
                        sendSingleSms(numerosConfirmacao[j], vm.form.identificacao + ': Confirmação. enviando (' + (i+1) + '/' + vm.numeros.length + ')', vm.form.dcs)
                }
            };
        }
    }

    if (i >= vm.numeros.length - 1) {// caso a posicao ja seja a ultima finaliza o envio
        vm.processando = false;
        vm.status += 'Envio Concluido' + '\n';
    }

    vm.percent += parseFloat(vm.incrementar);
}

function montarMsg(i, cb)
{
    console.log('montar msg: ' + i);
    numero = vm.numeros[i];
    mensagem = vm.form.mensagem;

    for (var j = 0; j <= vm.variaveis.length - 1; j++) {
        var variavel = vm.variaveis[j].var;
        var valor = vm.variaveis[j].text.split(';')[i];
        mensagem = mensagem.replace(variavel, valor);
    };

    cb(numero, mensagem, vm.form.dcs, i, enviarConfirmacao);
}

function sendSingleSms(numero, text, dcs)
{
    var url = vm.form.servidor + '/?PhoneNumber=' + numero + '&Text=' + encodeURIComponent(text) + '&DCS=' + dcs + '&User=' + vm.form.user + '&Password=' + vm.form.pass;
    console.log('enviando msg de confirmacao');

    httpreq.get(url, function (err, res){
        if (err) {
            console.error(err);
        } else {
            vm.status += 'CONFIRMACAO Enviando (' + (i+1) + '/' + vm.numeros.length + ')';
            io.emit('updateInfo', vm);
            console.log(res);
        }
    });
}

function _sendSms(numero, text, dcs, i, cb)
{
    var url = vm.form.servidor + '/?PhoneNumber=' + numero + '&Text=' + encodeURIComponent(text) + '&DCS=' + dcs + '&User=' + vm.form.user + '&Password=' + vm.form.pass;
    console.log('sendmsg');

    httpreq.get(url, function (err, res){
        if (err) {
            console.error(err);
        } else {
            msg = (i + 1) + ': Mensagem enviada para gateway Numero : ' + numero + ' MSG: ' + text + '\n' ;
            vm.status += msg;
            vm.statusEnvio = 'Enviando (' + (i+1) + '/' + vm.numeros.length + ')';
            cb(i);
        }
    });
}

function upload(req, res, next)
{
    var image = req.files.file;
    var upload_path_old = image.path;
    var upload_path_new = './uploads/';
    var upload_name = Math.random().toString(36).substr(3, 8) + '.xlsx';
    var upload_path_name = upload_path_new + upload_name;

    // Testa se o diretório upload existe na pasta atual
    if (fs.existsSync(upload_path_new)) {
      fs.rename(
        upload_path_old,
        upload_path_name,
        function (err) {
            if (err) {
              console.error('Err: ', err);
              res.end('Deu merda na hora de mover a imagem!');
            }
            var msg = 'Arquivo ' + upload_name + ' salvo em: ' + upload_path_new;
            console.log(msg);
            console.log('Lendo arquivo');
            var workbook = XLSX.readFile(upload_path_name);
            var excel = to_json(workbook);
            res.contentType = 'json';
            res.send(excel);
        }
      );
    } // Se não cria o diretório upload
    else {
      fs.mkdir(upload_path_new, function (err) {
        if (err) {
          console.error('Err: ', err);
          res.end('Deu merda na hora de criar o diretório!');
        }
        fs.rename(
          upload_path_old,
          upload_path_name,
            function(err) {
              var msg = 'Arquivo ' + upload_name + ' salvo em: ' + upload_path_new;
              console.log(msg);
               console.log('Lendo arquivo');
                var workbook = XLSX.readFile(upload_path_name);
                var excel = to_json(workbook);
                res.contentType = 'json';
                res.send(excel);
            });
      });
    }

    return next();
}

function to_json(workbook) {
    var result = {};
    var maxNumber = 0;
    result.mensagem = '';
    result.campos = {};
    for(y in workbook.Sheets) {
        var worksheet = workbook.Sheets[y];
        for (z in worksheet) {
            if(z[0] === '!') continue;
            var letter = z.replace(/\d+/g, '');
            var number = parseInt(z.replace(/\D+/g, '')) - 2;


            if (!result.campos[letter]) {
                result.campos[letter] = [];
            }

            if (letter == 'A' && number == -1) {
                result.mensagem = worksheet[z].v;
            } else {
                    result.campos[letter][number] = worksheet[z].v;
            }

            if (parseInt(number) > maxNumber) {
                maxNumber = parseInt(number);
            }
            console.log('Lendo ' + letter + number);
            letterNumber = letter + number;
        }
    }

    for(c in result['campos']) {
        for (var i = 2; i <= maxNumber; i++) {
            if (!result.campos[c][i]) {
                result.campos[c][i] = '';
                console.log('adicionando os campos em branco');
            }
        };
    }

    result.divisao = Math.round(12 / Object.keys(result['campos']).length);

    console.log('calculando a divisao');

    return result;
}

function processLargeArray(array, config) {
    console.log('Inicio do processamento iniciado');
    var chunk = 1000;
    var i = 0;

    function doChunk() {
        var cnt = chunk;

        while (cnt-- && i < array.length) {
            console.log('processando: ' + i);
            ultimo = array.length - 1; //guarda posicao do ultimo envio
            metade = Math.round(ultimo  / 2);//guarda posicao do envio que está na metade da fila

            if(i == 0 || i == metade || i == ultimo) { //se for algum dos envios especiais conta 1 msg enviada da remessa a mais
                config.contagem++;
            }

            if ((config.contagem + 1) >= config.quantidade) { //se a contagem ja atingiu o limite pelo intervalo estabelecido incrementa o intervalo para as proximos msgs com a quantidade de tempo estabelecido
                config.intervaloInicial += config.intervalo;
                config.contagem = 0;
            } else {
                config.contagem++;
            }


            (function(i, intervaloInicial){
                setTimeout(function(){
                            console.log('enviando: ' + i);
                            montarMsg(i, _sendSms);
                }, intervaloInicial);
            }(i, config.intervaloInicial));

            ++i;
        }
        if (i < array.length) {
            setTimeout(doChunk, 1);
        }
    }

    doChunk();
}



function respond(req, res, next) {
    res.send('ok!');
    next();
}

server.listen(8081, function() {
    console.log('%s listening at %s', server.name, server.url);
});

var clients = [];

io.on('connection', function (socket) {
    console.info('New client connected (id=' + socket.id + ').');
    clients.push(socket);

    socket.on('disconnect', function() {
        var index = clients.indexOf(socket);
        if (index != -1) {
            clients.splice(index, 1);
            console.info('Client gone (id=' + socket.id + ').');
        }
    });

    socket.on('stop', function() {
       console.log('kill the server');
       process.exit();
    });
});



