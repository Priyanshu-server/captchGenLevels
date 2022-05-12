const express = require('express');
var bodyParser = require('body-parser');
const sessions = require('express-session');
const path = require('path')
const fs = require('fs')

var users = [];
const app = express();


app.set('view engine','ejs')
app.set('views','templates')


// Middlewares ///////////////////////////////////////////////////////////////////////////
app.use(express.static('static'))
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    resave: false 
}));

const authCheck = (req,res,next) => {
    if (req.session.user){
        res.redirect("/")
    }else{
    next();
    }
}
/////////////////////////////////////////////////////////////////////////////////////////////

app.get("/",(req,res)=>{
    res.render("index.ejs",{loggedIn:req.session.user?true:false});

})

app.get("/login",authCheck,(req,res)=>{
    // Next move
    var hardLevel = (req.session.hardLevel?req.session.hardLevel:0)%3

    var capDicts = ['1','2','3']
    const directoryPath = path.join(__dirname, 'static','captcha');
    var captchDict = path.join(directoryPath,capDicts[hardLevel]);

    fs.readdir(captchDict,(err,files)=>{
        if (err){
            console.log(err)
            res.send("There is some error !")
        }
        item = files[Math.floor(Math.random()*files.length)];
        var staticRootCaptch = '/'+capDicts[hardLevel]+ '/'+item;
        var captchText = item.split('.')[0]

        res.render("login.ejs",{loggedIn:false,staticRootCaptch,captchText})
    })
    

    
})

app.post("/login",(req,res)=>{

    console.log(req.body)

    users.forEach(user=>{
        if (req.body.username == user.username & req.body.password == user.password & 
            req.body.captcha == req.body.realCaptcha){
            var session=req.session;
            session.user=req.body;
            session.user.isLoggedIn = true;
        }
    })
    if (!req.body.user){
        req.session.hardLevel = req.session.hardLevel?req.session.hardLevel+1:1
        res.redirect("/login")
    }else{
        res.redirect("/")
    }

})

app.get("/signup",authCheck,(req,res)=>{
    res.render("signup.ejs",{loggedIn:false})
})

app.post('/signup',(req,res)=>{
    var userData = req.body
    users.push(userData)
    console.log(users)
    res.redirect('/login')
})


app.get("/logout",(req,res)=>{
    req.session.user = null;
    res.redirect("/")
})


app.listen(80,()=>{
    console.log("http://localhost:80 ...");
})