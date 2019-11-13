let express = require('express'),
    http = require('http'),
    path = require('path'),
    Usuario = require(path.join(__dirname,'/model/Usuario')),
    Publicacao = require(path.join(__dirname,'/app/model/Publicacao')),
    Seguidor = require(path.join(__dirname,'/app/model/Seguidor')),
    Util = require(path.join(__dirname,'/app/public/Util'))
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
    
        importarUsuarios();
        response.render('cadastro');
    });

    app.post('/cadastro',(request, response) => {
        var data = {
            nome: request.body.nome,
            email: request.body.email,
            senha: request.body.senha,
            avatar: "/style/images/avatar.jpg"
        }

        Usuario.find({email: data.email}).then((usuario) =>{
            if(usuario[0]){
                response.render("cadastro",{serverMessage:"Usuário existente"})
            }else{
                var usuarioService = new Usuario(data);
                usuarioService.save();
                response.render("login", {serverMessage: "Usuário cadastrado com sucesso!"});
            }
        });

        
    
    });

    app.get('/home', async (request, response, next) => {
        
        var publicacoes = [];
        if(request.session.user){
            
            var allPublicacoes = [];
            var minhasPublicacoes = await  Publicacao.find({"autor.email":request.session.user.email}).then((_publicacoes) =>{
                 return _publicacoes;
            });
            
            var outrasPublicacoes = [];
            
            var seguindo = await Seguidor.find({"seguidor.email": request.session.user.email}).then((_seguindo)=>{
                return _seguindo;
            });
          

            for(var i=0; i < seguindo.length; i++){  
                var publicacoesSeguindo = await Publicacao.find({"autor.email":seguindo[i].usuario.email}).then((_publicacoes) =>{
                    return _publicacoes;
                })
                
                for(var j=0; j < publicacoesSeguindo.length; j++)
                {
                    minhasPublicacoes.push(publicacoesSeguindo[j]); 
                }
            }
            
            minhasPublicacoes.sort(function (a, b) {
                    if (a.data < b.data) {
                      return 1;
                    }
                    if (a.data > b.data) {
                      return -1;
                    }
                    // a must be equal to b
                    return 0;
                  });


            response.render('home', {usuario:{nome: request.session.user.nome, email: request.session.user.email , avatar: request.session.user.avatar}, publicacoes: minhasPublicacoes});

        }else{
            response.redirect('/login');
        }

       
    });

    app.post('/publicar',(request,response) => {
        
        if(request.session.user){
           
           
            var data = {
                texto: request.body.texto,
                autor: request.session.user,
                data: Util.getDateTimeNow()
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
        
        Usuario.find({email:{$ne:request.session.user.email}}).then((people) =>{

            response.render('explorar', {people: people});
        });
    });

    app.get('/seguir',async (request,response) => {
        var serverMessage = "";
        if(request.session && request.session.user){
            var mailSeguir = request.url.split("?")[1];
            var mail =  request.session.user.email;

            var alreadyMatch = await Seguidor.find({$and:[{"seguidor.email":mail},{ "usuario.email":mailSeguir}]}).then((s) =>{
                return s;
            });
            if(alreadyMatch.length>0){
                serverMessage = "Você já segue esta pessoa.";
            }else{
                var data = {usuario: {}, 
                seguidor: {},
                };

                Usuario.find({email: mailSeguir}).then((user) =>{
            
            data.usuario = user[0]; 
            serverMessage = "Boa, agora você segue: "+ mailSeguir;
            Usuario.find({email: request.session.user.email}).then((_seguidor) =>{
            
                data.seguidor = _seguidor[0];
                
                var seguidorService = new Seguidor(data);
                seguidorService.save();
                
            });
        }).catch((error) =>{
            console.log(error);
        });
            }
            var people  = await Usuario.find().then((people) =>{

                return people;
            });
            response.render('explorar',{people: people,serverMessage:serverMessage});
        }else{
            response.redirect('/login');
        }
    });

    app.get('/logout',(request,response) => {
        request.session.user = null;
        response.redirect('/login');
    });
    
    


    function importarUsuarios(){
        axios
        .get('https://randomuser.me/api/?nat=br&results=32')
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

    var porta = process.env.PORT || 8080;
    http.createServer(app).listen(porta);