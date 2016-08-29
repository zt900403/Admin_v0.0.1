/**
 * Created by Lenovo on 2016/8/26.
 */
var express = require('express');
var User = require('../libs/User');

var router = express.Router();

/* GET home page. */
router.get('/validate', function(req, res, next) {
    var userid = req.session.uid;
    if (userid) {

        User.findUserById(userid, function(err, one) {
            if (err)
                return  res.format({
                                json: function() {
                                res.status(401).json(null);
                            }
            });

            res.format({
                json: function() {
                    res.json(one);
                }
            });
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
    var user = req.body.user;

    if (!user || !user.user || !user.PWD || !user.PWD2 ) {
        res.format({
            json: function() {
                res.status(401).json({err: 'incomplete input data'});
            }
        });
    }

    if ( user.user.length < 4 ) {
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



    User.findUserByUser(user.user, function(err, one) {
        if (err) {
            res.format({
                json: function() {
                    res.status(401).json({err: 'database error'});
                }
            });
        }

        if (one) {
            res.format({
                json: function() {
                    res.status(401).json({err: 'User already exists'});
                }
            });
        } else {
            var userModel = new User(user);
            userModel.save(function(err){
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
        }

    });

});

router.post('/login', function(req, res, next) {
    var user = req.body.user;
    if ( !user || !user.user || !user.PWD ) {
        res.format({
            json: function() {
                res.status(401).json({err: 'incomplete input data'});
            }
        });
    }



    User.loginByUser(user, function(err, one) {
        if (err) {
            res.format({
                json: function() {
                    res.status(401).json(err);
                }
            });
        }

        req.session.uid = one.id;
        res.format({
            json: function() {
                res.json(one);
            }
        });
    });
});




module.exports = router;
