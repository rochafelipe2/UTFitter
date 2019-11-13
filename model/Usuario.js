let BaseDao = require('../dao/BaseDao.js');

module.exports = class Usuario extends BaseDao {
    constructor(data){
        super(data);
        this.nome = data.nome;
        this.email = data.email;
        this.senha = data.senha;
        this.avatar = data.avatar;
        this._id = data._id;
        this.collection = 'usuarios'
    }

    static find(query ={}, limit){      
        return super.find(query,{nome:1},limit,'usuarios').then((results) => {
            return results.map((usuario) => new Usuario(usuario))
        });
    }
 
};