import express from "express";
import ejs from "ejs"
import mongoose from "mongoose";
import bodyParser from "body-parser";
import session from 'express-session';
import passport from 'passport';
import passportLocalMongoose from "passport-local-mongoose";
import findOrCreate from "mongoose-findorcreate";


const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"))

app.use(session({
    secret: "Out littile Secrets",
    resave: false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://0.0.0.0:27017/userDB2");

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, {
        id: user.id,
      });
    });
  });
  
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });

app.get("/", (req, res)=>{
    res.render("index");
});

app.get("/login", (req, res)=>{
    res.render("signin");
});

app.get("/register", (req, res)=>{
    res.render("signup");
});

app.get("/home", async (req, res)=>{
    if(req.isAuthenticated()){
        res.render("home");
    }else{
        res.redirect("/login")
    }
});
app.get("/play", async (req, res)=>{
    if(req.isAuthenticated()){
        res.render("movie");
    }else{
        res.redirect("/login")
    }
});

app.post("/register", (req, res)=>{
    User.register({username: req.body.username}, req.body.password, (err, user)=>{
        if(err){
            console.log(err);
            res.redirect("/signup");
        }else{
            passport.authenticate('local')(req,res,()=>{
                res.redirect("/home");
            })
        }
    })
    });
    
app.post("/login", async (req, res)=>{
    const user = new User({
        username: req.body.username,
        password: req.body.password,
    });
    
    req.login(user, (err)=>{
        if(err){
            console.log(err);
        }else{
            passport.authenticate('local')(req,res,()=>{
                res.redirect("/home");
            })
        }
    });
});

app.listen(port, (req, res)=>{
    console.log(`Server is runnig on ${port}`);
});