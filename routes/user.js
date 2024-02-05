var express = require('express');
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
var router = express.Router();

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/', async function (req, res, next) {
  let user = req.session.user
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  productHelpers.getAllProducts().then((Products) => {
    res.render('user/view-products', { Products, user, admin: false, cartCount })
  })
});
router.get('/login', function (req, res) {
  if (req.session.loggedIn) {
    res.redirect('/')
  } else {
    res.render('user/login', { "loginErr": req.session.loginErr })
    req.session.loginErr = false
  }
});
router.get('/signup', function (req, res) {
  res.render('user/signup')
});
router.post('/signup', (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    req.session.loggedIn = true
    req.session.user = response
    res.redirect('/')
  })
})
router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true
      req.session.user = response.user
      res.redirect('/')
    } else {
      req.session.loginErr = "Invalid Username or Password"
      res.redirect('/login')
    }
  })
})
router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})
router.get('/cart', verifyLogin, async (req, res) => {
  let user = req.session.user
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  let products = await userHelpers.getCartProducts(req.session.user._id)
  let total = await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/cart', { products, user, cartCount, total })
})
router.get('/add-to-cart/:id', (req, res) => {
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true })
  })
})
router.post('/change-product-quantity', (req, res, next) => {
  userHelpers.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelpers.getTotalAmount(req.body.user)
    res.json(response)
  })
})
router.get('/delete-cart-item/:id', (req, res) => {
  let proId = req.params.id
  userHelpers.deleteCartItem(proId, req.session.user._id).then((response) => {
    res.redirect('back');
  })
})
router.get('/place-order', verifyLogin, async (req, res) => {
  let user = req.session.user
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  let products = await userHelpers.getCartProducts(req.session.user._id)
  let total = await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/place-order', { products, user, cartCount, total })
})
router.post('/place-order', async (req, res) => {
  let products = await userHelpers.getCartProductList(req.body.userId)
  let totalPrice = await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body, products, totalPrice).then((response) => {
    let idString = response.insertedId.toString();
    let orderId = idString.replace(/new ObjectId\(/, '');
    if (req.body['payment-method'] === 'COD') {
      res.json({ codSuccess: true })
    } else {
      userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
        res.json(response)
      })
    }

  })
})
router.get('/order-success', (req, res) => {
  res.render('user/order-success', { user: req.session.user })
})
router.get('/orders', verifyLogin, async (req, res) => {
  let orders = await userHelpers.getUserOrders(req.session.user)
  res.render('user/orders', { user: req.session.user, orders })
})
router.get('/view-order-products/:id', async (req, res) => {
  let products = await userHelpers.getOrderProducts(req.params.id)
  res.render('user/view-order-products', { user: req.session.user, products })
})
router.post('/verify-payment',(req,res)=>{
  console.log(req.body);
})

module.exports = router;