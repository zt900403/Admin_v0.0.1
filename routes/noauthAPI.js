/**
 * Created by Lenovo on 2016/8/26.
 */
var express = require('express');
var router = express.Router();
var User = require('../models/user');

/* GET home page. */
router.get('/validate', function(req, res, next) {
    var userid = req.session.userid;
    if (userid) {
        res.format({
            json: function() {
                res.json({authed:true});
            }
        });
    } else {
        res.format({
            json: function() {
                res.status(401).json(null);
            }
        });
    }
});

router.post('/signin', function(req, res, next) {
    var user = req.body.uesr;

    if (!user || user.user || !user.PWD || !uesr.PWD2 ) {
        res.format({
            json: function() {
                res.status(401).json({err: 'no data or incomplete data'});
            }
        });
    }

    if ( user.user.length < 8 ) {
        res.format({
            json: function() {
                res.status(401).json({err: 'user length is not 8'});
            }
        });
    }

    if ( user.PWD != user.PWD ) {
        res.format({
            json: function() {
                res.status(401).json({err: 'PWD and PWD2 are not match'});
            }
        });
    }


    User.assign(user).save(function(err){
        if (err) {
            res.format({
                json: function() {
                    res.status(401).json({err: 'save to database error'});
                }
            });
        } else {
            res.format({
                json: function() {
                    res.json({result:true});
                }
            });
        }
    });

});



module.exports = router;
