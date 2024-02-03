var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
const fs = require('fs');

/* GET users listing. */
router.get('/', function (req, res, next) {
  productHelpers.getAllProducts().then((Products)=>{
    res.render('admin/view-products', { Products, admin: true })
  })
  
});
router.get('/add-product', function (req, res) {
  res.render('admin/add-product')
})
router.post('/add-product', (req, res) => {
  productHelpers.addProduct(req.body, (id) => {
    let image = req.files.Image
    image.mv('./public/product-image/' + id + '.jpg', (err) => {
      if (!err) {
        res.redirect("/admin")
      } else {
        console.log(err);
      }
    })

  })
})
router.get('/delete-product/:id',(req,res)=>{
  let proId = req.params.id
  productHelpers.deleteProduct(proId).then((response)=>{
    fs.unlinkSync('./public/product-image/' + proId + '.jpg')
    res.redirect('/admin')
  })
})

module.exports = router;
