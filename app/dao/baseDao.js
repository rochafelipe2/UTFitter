let client = require('mongodb').MongoClient;
let config = require('./Config');
let connection = client.connect(config.uri, config.options).then((connection) => {
    return {
        db: connection.db(config.db),
        close: function(){
            connection.close();
        }
    };
});

module.exports = class BaseDao {
    save(){
        if(this._id){
            return connection.then((connection) => {
                return connection.db.collection(this.collection).updateOne({_id: this._id},{$set:this});
            });
        }
        return connection.then((connection) => {
            return connection.db.collection(this.collection).insertOne(this);
        });
    }

    static find (query={}, sort={}, limit = 10, collection){
        return connection.then((connection) => {  
            return connection.db.collection(collection).find(query).sort(sort).limit(limit).toArray();
        });
    }
};

