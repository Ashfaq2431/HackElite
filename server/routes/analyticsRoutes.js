const express = require('express');
const router = express.Router();
const { getCampusAnalytics } = require('../controllers/analyticsController');

router.get('/', getCampusAnalytics);

module.exports = router;
