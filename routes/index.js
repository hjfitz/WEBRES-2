var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


/* GET home page. */
router.get('/car', function(req, res, next) {
  res.render('car', { title: 'Express' });
});


module.exports = router;
