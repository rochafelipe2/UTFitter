let express = require('express'),
    http = require('http'),
    path = require('path'),
    Usuario = require('./model/Usuario'),
    Publicacao = require('./model/Publicacao'),
    Seguidor = require('./model/Seguidor'),
    app = express();
    var axios = require('axios');
    var session = require('express-session');

    app.set('views', path.join(__dirname, '/views'));
    app.use(express.static(__dirname + '/public'));
    app.set('view engine', 'hbs');
    app.use(express.urlencoded({extended: false}));
    app.use(session({
        secret: 'secret_key',
        resave: false,
        saveUninitialized: true,
        cookie:{secure:false}
    }));

    app.get('/',(request, response) => {
        // popup.alert({
        //     content: 'Hello!'
        // });
        response.render('login');
    });

    app.get('/login',(request, response) => {
        if(request.session.user){
            response.redirect("/home");
        }else{
            response.render('login');
        }
        
    });

    app.post('/login',(request, response, next) => {
        
        var user = null;
        Usuario.find({email: request.body.email, senha: request.body.senha}).then((usuario) =>{

            if(usuario[0])
            {
                request.session.user = usuario[0];
                response.redirect("/home");
            }else{
                response.render('login', {status: "false"});
            }
        }).catch((error) => {
        
            console.log(error);
        });
    
    });

    app.get('/usuarios',(request, response) => {
    
        Usuario.find().then((usuarios) =>{

            for(var i =0; i< usuarios.length;i++)
            {
                if(usuarios[i].avatar == null){
                    usuarios[i].avatar = "/style/images/avatar.jpg";
                    var update = new Usuario(usuarios[i]);

                    update.save();
                }
            }

            response.render('usuarios', {usuarios: usuarios});
        });
    });

    app.get('/cadastro',(request, response) => {
    
        //importarUsuarios();
        response.render('cadastro');
    });

    app.post('/cadastro',(request, response) => {
        var data = {
            nome: request.body.nome,
            email: request.body.email,
            senha: request.body.senha
        }
        var usuarioService = new Usuario(data);
        usuarioService.save();

        response.redirect("/usuarios");
    
    });

    app.get('/home',(request, response, next) => {
        
        var publicacoes = [];
        if(request.session.user){
             Publicacao.find({"autor.email":request.session.user.email}).then((_publicacoes) =>{
                 
                //TODO: Felipe rocha - adicionar as publicacoes de quem sigo.
                response.render('home', {usuario:{nome: request.session.user.nome, email: request.session.user.email , avatar: request.session.user.avatar}, publicacoes: _publicacoes});

            });

        //     Seguidor.find({"seguidor.email": request.session.user.email}).then((seguindo) =>{
        //         for(var i=0; i< seguindo.length; i++)
        //         {
        //             Publicacao.find({"autor.email":seguindo[i].email}).then((_publicacoes) =>{
        //                 publicacoes.push(_publicacoes);
        //             });
        //         }
        // });
        

        }else{
            response.redirect('/login');
        }

       
    });

    app.post('/publicar',(request,response) => {
        
        if(request.session.user){
           
           
            var data = {
                texto: request.body.texto,
                autor: request.session.user,
                data: getDateTimeNow()
            }
    
            var publicacaoService = new Publicacao(data);
            publicacaoService.save();
            response.redirect("/home");
        }else{
            response.redirect('/login');
        }

    });
    
    app.get('/seguidores',(request, response) => {
        
        if(request.session.user){
            Seguidor.find({"usuario.email": request.session.user.email}).then((seguidores) =>{
                response.render('seguidores', {seguidores: seguidores});
            });
        }else{
            response.redirect('/login');
        }
       
    });

    app.get('/seguindo',(request, response) => {
        
        if(request.session.user){
            Seguidor.find({"seguidor.email":request.session.user.email}).then((seguidores) =>{
                response.render('seguindo', {seguidores: seguidores});
            });
        }else{
            response.redirect('/login');
        }
     
    });

    app.get('/explorar',(request, response) => {
        
        Usuario.find().then((people) =>{

            people.rem

            response.render('explorar', {people: people});
        });
    });

    app.get('/seguir',(request,response) => {
        
        if(request.session && request.session.user){
            var mailSeguir = request.url.split("?")[1];
            var data = {usuario: {}, 
                        seguidor: {},
                        };

                Usuario.find({email: mailSeguir}).then((user) =>{
                    
                    data.usuario = user[0]; 
                    
                    Usuario.find({email: request.session.user.email}).then((_seguidor) =>{
                    
                        data.seguidor = _seguidor[0];
                        
                        var seguidorService = new Seguidor(data);
                        seguidorService.save();
                    });
                }).catch((error) =>{
                    console.log(error);
                });
                
              
                
               
            response.redirect('/explorar');
        }else{
            response.redirect('/login');
        }
    });

    app.get('/logout',(request,response) => {
        request.session.user = null;
        response.redirect('/login');
    });
    
    
    function getDateTimeNow(){
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var hh = today.getHours();
        var min = today.getMinutes();
        var yyyy = today.getFullYear();
        if (dd < 10) {
            dd = '0' + dd;
        } 
        if (mm < 10) {
            mm = '0' + mm;
        } 
        var today = dd + '/' + mm + '/' + yyyy + " - "+ hh + ":" + min ;
        return today;
    }

    function importarUsuarios(){
        axios
        .get('https://randomuser.me/api/?nat=br&results=10')
        .then(response =>{
          const {results} = response.data;
          
            for(var i=0 ; i < results.length; i++)
            {
                var data = {
                    nome: results[i].name.first + " " + results[i].name.last,
                    email: results[i].email,
                    avatar: results[i].picture.large,
                    senha: "123456"
                }

                var newUser = new  Usuario(data);
                newUser.save();
                
            }
            }).catch(error =>{
                console.log("Erro na importação "+  error);
            });
        }

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