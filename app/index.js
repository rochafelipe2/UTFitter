let express = require('express'),
    http = require('http'),
    path = require('path'),
    //Cidades = require('./Model/Cidades'),
    app = express();


    app.set('views', path.join(__dirname, '/views'));
    app.use(express.static(__dirname + '/public'));
    app.set('view engine', 'hbs');
    app.use(express.urlencoded({extended: false}));
    
    app.get('/login',(request, response) => {
    
        response.render('login');
    });

    app.post('/login',(request, response) => {
    
    
    });
    
    
    // app.get('/cidades',(request, response) => {

    //     if(request.query.cidade){
    //         Cidades.find({nome: request.query.cidade}).then((cidades) =>{
    //             console.log("cidade: " +request.query.cidade + "Result: " +cidades);
    //             response.render('cidades', {cidades: cidades});
    //         });
    //     }else{
    //         Cidades.find().then((cidades) =>{
    //             console.log("nome: " +request.query.cidade + "Result: " +cidades);
    //             response.render('cidades', {cidades: cidades});
    //         });
    //     }
    // });

    
    // app.post('/cidades',(request, response) => {
    //     console.log('Recebi a req');
    //     if(request.body.novaCidade){
    //         data = {
    //             nome: request.body.novaCidade
    //         };
    //        var cidadeService = new Cidades(data);
    //        cidadeService.save();
    //         console.log('sai novaCidade');
    //     }

    //     Cidades.find({},10).then((cidades) =>{
    //         console.log("nome: " +request.query.cidade + "Result: " +cidades);
    //         response.render('cidades', {cidades: cidades});
    //     });
    //     console.log('sai method');
    // });

    http.createServer(app).listen(3000);