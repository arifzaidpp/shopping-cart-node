var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { pipeline } = require('stream')
var objectId = require('mongodb').ObjectId
module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.Password = await bcrypt.hash(userData.Password, 10)
            db.get().collection(collection.USER_COLLECTIONS).insertOne(userData).then((data) => {
                resolve(data)
            })
        })
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTIONS).findOne({ Email: userData.Email })
            if (user) {
                bcrypt.compare(userData.Password, user.Password).then((status) => {
                    if (status) {
                        console.log("login success");
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        console.log('login failed');
                        resolve({ status: false })
                    }
                })
            } else {
                console.log('login failed');
                resolve({ status: false })
            }
        })
    },
    addToCart: (proId, userId) => {
        let proObj = {
            item: new objectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let objId = new objectId(proId);
            let usrId = new objectId(userId)
            let userCart = await db.get().collection(collection.CART_COLLECTIONS).findOne({ user: usrId })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId)
                console.log(proExist);
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTIONS)
                        .updateOne({ 'products.item': objId },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }
                        ).then(() => {
                            resolve()
                        })
                } else {
                    db.get().collection(collection.CART_COLLECTIONS)
                        .updateOne({ user: usrId },
                            {
                                $push: { products: proObj }
                            }
                        ).then((response) => {
                            resolve()
                        })
                }
            } else {
                let cartObj = {
                    user: usrId,
                    products: [proObj]
                }
                db.get().collection(collection.CART_COLLECTIONS).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let usrId = new objectId(userId)
            let cartItems = await db.get().collection(collection.CART_COLLECTIONS).aggregate([
                {
                    $match: { user: usrId }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                }
            ]).toArray()
            resolve(cartItems)
        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let usrId = new objectId(userId)
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTIONS).findOne({ user: usrId })
            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        })
    }
}