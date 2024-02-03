var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  
  res.render('admin/view-products', { Products, admin: true })
});
router.get('/add-product', function (req, res) {
  res.render('admin/add-product')
})
router.post('/add-product', (req, res) => {
  productHelpers.addProduct(req.body, (id) => {
    let image = req.files.Image
    image.mv('./public/product-image/' + id + '.jpg', (err) => {
      if (!err) {
        res.render("admin/add-product")
      } else {
        console.log(err);
      }
    })

  })
})

module.exports = router;
