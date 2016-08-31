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
        return res.format({
            json: function() {
                res.status(401).json({err: 'incomplete input data'});
            }
        });
    }

    if ( user.user.length < 4 ) {
        return res.format({
            json: function() {
                res.status(401).json({err: 'user length is not 8'});
            }
        });
    }

    if ( user.PWD != user.PWD ) {
        return res.format({
            json: function() {
                res.status(401).json({err: 'PWD and PWD2 are not match'});
            }
        });
    }



    User.findUserByUser(user.user, function(err, one) {
        if (err) {
            return res.format({
                json: function() {
                    res.status(401).json({err: 'database error'});
                }
            });
        }

        if (one) {
            return res.format({
                json: function() {
                    res.status(401).json({err: 'User already exists'});
                }
            });
        } else {
            var userModel = new User(user);
            userModel.save(function(err){
                if (err) {
                    return res.format({
                        json: function() {
                            res.status(401).json({err: 'save to database error'});
                        }
                    });

                } else {
                    return res.format({
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
        return res.format({
            json: function() {
                res.status(401).json({err: '输入数据不完整!'});
            }
        });
    }

    User.loginByUser(user, function(err, one) {
        if (err) {
            return res.format({
                json: function() {
                    res.status(401).json({err: err.message});
                }
            });
        }

        req.session.uid = one.id;
        return res.format({
            json: function() {
                res.json(one);
            }
        });
    });
});




module.exports = router;
