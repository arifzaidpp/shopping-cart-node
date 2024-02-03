var db = require('../config/connection')
var collection = require('../config/collections')
var objectId = require('mongodb').ObjectId
module.exports = {

    addProduct: (product, callback) => {

        db.get().collection('product').insertOne(product).then((data) => {
            
            callback(data.insertedId)

        })

    },
    getAllProducts:()=>{
        return new Promise((resolve, reject)=>{
            let products = db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            let objId = new objectId(proId);
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objId}).then((response)=>{
                resolve(response)
            })
        })
    }

}