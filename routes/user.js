var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  var Products = [{
    image: "https://media-ik.croma.com/prod/https://media.croma.com/image/upload/v1662418953/Croma%20Assets/Communication/Mobiles/Images/230106_nxtpnk.png?tr=w-640",
    title: "IPHONE 11",
    description: "This is a good mobile"
  },
  {
    image: "https://media-ik.croma.com/prod/https://media.croma.com/image/upload/v1662424567/Croma%20Assets/Communication/Mobiles/Images/229922_biq8sa.png?tr=w-640",
    title: "IPHONE 12",
    description: "This is a good mobile"
  },
  {
    image: "https://media-ik.croma.com/prod/https://media.croma.com/image/upload/v1664009521/Croma%20Assets/Communication/Mobiles/Images/243468_0_wevddw.png?tr=w-640",
    title: "IPHONE 13",
    description: "This is a good mobile"
  },
  {
    image: "https://media-ik.croma.com/prod/https://media.croma.com/image/upload/v1662703105/Croma%20Assets/Communication/Mobiles/Images/261963_oqrd6j.png?tr=w-640",
    title: "IPHONE 14",
    description: "This is a good mobile"
  }]
  res.render('index', {Products, admin:false});
});

module.exports = router;
