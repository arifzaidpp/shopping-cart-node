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
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTIONS)
                        .updateOne({ user: usrId, 'products.item': objId },
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
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
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
                // count = cart.products[0].quantity+cart.products[1].quantity
                if (cart.products.length) {
                    let cartCount = cart.products.length
                    for (let index = 0; index < cartCount; index++) {
                        count += cart.products[index].quantity

                    }
                }
            }
            resolve(count)
        })
    },
    changeProductQuantity: (details) => {
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)
        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                db.get().collection(collection.CART_COLLECTIONS)
                    .updateOne({ _id: new objectId(details.cart) },
                        {
                            $pull: { products: { item: new objectId(details.product) } }
                        }

                    ).then((response) => {
                        resolve({ removeProduct: true })
                    })
            } else {
                db.get().collection(collection.CART_COLLECTIONS)
                    .updateOne({ _id:new objectId(details.cart), 'products.item':new objectId(details.product) },
                        {
                            $inc: { 'products.$.quantity': details.count }
                        }

                    ).then((response) => {
                        resolve(true)
                    })
            }
        })
    },
    deleteCartItem: (proId, userId) => {
        return new Promise((resolve, reject) => {
            let objId = new objectId(proId);
            db.get().collection(collection.CART_COLLECTIONS)
                .updateOne({
                    "user": new objectId(userId)
                },
                    {
                        "$pull": {
                            "products": {
                                "item": objId
                            }
                        }

                    }).then(() => {
                        resolve()
                    })
        })
    }
}