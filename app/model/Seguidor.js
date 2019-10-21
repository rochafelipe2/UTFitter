let BaseDao = require('../dao/BaseDao.js');

module.exports = class Seguidor extends BaseDao {
    constructor(data){
        super(data);
        this.email_usuario = data.usuario.email;
        this.email_seguidor = data.seguidor.email;
        this.usuario = data.usuario;
        this.seguidor = data.seguidor;
        this._id = data._id;
        this.collection = 'seguidores'
    }

    static find(query ={}, limit){      
        return super.find(query,{nome:1},limit,'seguidores').then((results) => {
            return results.map((seguidor) => new Seguidor(seguidor))
        });
    }
 
};