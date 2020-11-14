// @login & register
const express =require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const gravatar =require('gravatar');
const keys = require('../../config/keys');
const passport  = require('passport');

const User = require('../../models/User');

//$router GET api/users/test
//@desc 返回的请求的json数据
//@access public
// router.get('/test',(req,res) => {
//     res.json({msg:"login works"})
// })

//$router POST api/users/register  需要安装模块body-parser
//@desc 返回的请求的json数据
//@access public
router.post('/register',(req,res) => {
    //console.log(req.body);
    //查询数据库中是否拥有邮箱
    User.findOne({email:req.body.email})
    .then((user)=>{
        if(user){
            return res.status(400).json('邮箱已被注册');
        } else {
            const avatar = gravatar.url(req.body.email, {s: '200', r: 'pg', d: 'mm'});
            const newUser =new User({
                name:req.body.name,
                email:req.body.email,
                //头像模块 install gravatar
                avatar,
                //加密密码用到bcrypt模块 install吧
                password:req.body.password,
                identity:req.body.identity
            })

            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if(err) throw err;

                    newUser.password =hash;

                    newUser.save()
                           .then(user => res.json(user))
                           .catch(err => console.log(err));
                });
            });
        }
    })
});


//$router GET api/users/login
//@desc 返回token jwt passport
//@access public

router.post('/login',(req,res) => {
    const email =req.body.email;
    const password =req.body.password;
    //查询数据库
    User.findOne({email})
    .then(user => {
        if(!user){
            return res.status(404).json('用户不存在');
        }
        //匹配密码
        bcrypt.compare(password, user.password)
        .then(isMatch => {
            if(isMatch){
                
                //这里需要获取token安装 jsonwebtoken 模块
                //jwt.sign('规则','加密名字','过期时间','箭头函数')
                //规则
                const rule = {
                    id:user.id,
                    name:user.name,
                    avatar:user.avatar,
                    identity:user.identity
                };
                jwt.sign(rule,keys.secretOrKey,{expiresIn:3600},(err,token)=>{
                    if(err) throw err;
                    res.json({
                        success:true,
                        token:"Bearer "+token
                    })
                })
                //res.json({msg:"success"});
            } else {
                return res.status(400).json('密码错误');
            }
        })
        })
})

//$router GET api/users/current
//@desc 返回 current user  [userinfo]
//@access private   验证令牌 passport-jwt passport 安装模块
router.get('/current',passport.authenticate('jwt',{session:false}),(req,res) => {
    // res.json({msg:'success'});
    //req.user
    res.json({
        id:req.user.id,
        name:req.user.name,
        email:req.user.email,
        identity:req.user.identity
    });
})


module.exports = router;