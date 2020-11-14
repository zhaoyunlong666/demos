const express =require('express');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const bodyParser =require('body-parser');
const app = express();
const passport = require('passport');

//引用users.js
const users = require('./routes/api/users');
const profiles = require('./routes/api/profiles');

//db config
const db = require('./config/keys').mongoURI;

//使用body-parser中间件
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());


//connect to mongodb
mongoose.connect(db,{useNewUrlParser: true ,useUnifiedTopology:true})
.then(() => console.log('mogoDB connected'))
.catch(err => console.log(err));

//配置passport
//passport 初始化
app.use(passport.initialize());//令牌验证
require('./config/passport')(passport);

// app.get('/',(req,res) =>{
//     res.send('hello word!');
// })

//使用routes
app.use('/api/users',users);
app.use('/api/profiles',profiles);


const port = process.env.PORT || 5000;

app.listen(port,()=>{
    console.log(`Server running on port ${port}`);
})