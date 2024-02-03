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
        return new Promise(async (resolve, reject) => {
            let objId = new objectId(proId);
            let usrId = new objectId(userId)
            let userCart = await db.get().collection(collection.CART_COLLECTIONS).findOne({ user: usrId })
            if (userCart) {
                db.get().collection(collection.CART_COLLECTIONS).updateOne({ user: usrId },
                    {
                        $push: { products: objId }
                    }
                ).then((response) => {
                    resolve()
                })
            } else {
                let cartObj = {
                    user: usrId,
                    products: [objId]
                }
                db.get().collection(collection.CART_COLLECTIONS).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },
    getCartProducts: (userId) => {
        return new Promise(async(resolve, reject) => {
            let usrId = new objectId(userId)
            console.log(usrId);
            let cartItems = await db.get().collection(collection.CART_COLLECTIONS).aggregate([
                {
                    $match: { user: usrId}
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        let: { prodList: '$products' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $in: ['$_id', "$$prodList"]
                                    }
                                }
                            }
                        ],
                        as: 'cartItems'
                    }
                }
            ]).toArray()
            resolve(cartItems[0].cartItems)
        })
    }
}