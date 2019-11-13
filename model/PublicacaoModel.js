
module.exports = class PublicacaoModel  {
    constructor(data){
        super(data);
        this.texto = data.texto;
        this.data = data.data;
        this.autor = data.autor;
        this._id = data._id;
    }
};