let BaseDao = require('../dao/BaseDao.js');

module.exports = class Publicacao extends BaseDao {
    constructor(data){
        super(data);
        this.texto = data.texto;
        this.data = data.data;
        this.autor = data.autor;
        this._id = data._id;
        this.collection = 'publicacoes'
    }

    static find(query ={}, limit){      
        return super.find(query,{nome:1},limit,'publicacoes').then((results) => {
            return results.map((publicacao) => new Publicacao(publicacao))
        });
    }
 
};