const express = require('express');
const router = express.Router();

router.get('/cand', function (req, res) {
    res.send('Hello World! This is the Candidates Page');
});

module.exports = router;
