var express = require('express'),
    app = express(),
    cors = require('cors'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    mongoose = require('mongoose'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    User = require('./models/User'),
    Bug = require('./models/Bug');

mongoose.connect('mongodb://localhost:27017/post-it');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
    secret:'Get Your Party On',
    resave: false,
    saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.Username = User.username;
    next();
 });

app.get('/', (req, res) => {
    res.send(JSON.stringify('You\'ve reached the post-it backend!'));
});

app.post('/login', (req, res) => {
    passport.authenticate('local')(req, res, ()=> {
        if (req.user) {
            res.send(JSON.stringify({message: req.user.username + ' logged in!', error: null, user: req.user}));
        } else {
            res.send(JSON.stringify({error: 'There was an error logging you in'}));
        }
    });
});

app.post('/signup', (req, res) => {
    console.log('creating a user!' + req.body.username);
    User.register(new User(
        {
            username: req.body.username,
            bugs: []
        }),
        req.body.password,
    function(err, user){
        if(err){
            res.send(JSON.stringify({error: 'There was an error signing up: ' + err}));
        }else{
            res.send(JSON.stringify(user));
        }
    });
});

app.post('/addBug', isLoggedIn, (req, res) => {
    User.findById(req.user._id, (err, user) => {
        if (!err) {
            var bug = {
                name: req.body.name,
                details: req.body.details,
                type: req.body.type,
                dateCreated: new Date(),
                completed: false
            }
            Bug.create(bug, (err, bug)=> {
                if (!err) {
                    user.bugs.push(bug);
                    user.save();
                    res.send({message: 'Created a bug! ' + bug});
                } else {
                    res.send(JSON.stringify({error: err}));
                }
            })
        } else {
            res.send(JSON.stringify(err));
        }
    })
});

app.get('/bugs', isLoggedIn, (req, res) => {
    Bug.find({'_id': req.user.bugs}, (err, bugs) => {
        if (!err) {
            res.send(JSON.stringify(bugs));
        } else {
            res.send(JSON.stringify(err));
        }
    })
});

app.get('/bugs/:type', isLoggedIn, (req, res) => {
    Bug.find({'_id': req.user.bugs, 'type': req.params.type, 'completed': false}, (err, bugs) => {
      if (!err) {
        res.send(JSON.stringify(bugs));
      } else {
        res.send(JSON.stringify(err));
      }
    });
});

app.get('/completedbugs', isLoggedIn, (req, res) => {
    Bug.find({'completed': true}, (err, bugs) => {
        if (!err) {
            res.send(JSON.stringify(bugs));
        } else {
            res.send(JSON.stringify(err));
        }
    });
});

app.get('/markcomplete/:id', (req, res) => {
    Bug.update({'_id': req.params.id}, { $set: {completed: true} })
    .then(res.send({message: 'successfully completed bug'}))
    .catch(err => {
        res.send(JSON.stringify({error: 'There was an error marking this bug complete: ' + err}));
    })
})

function isLoggedIn(req, res, next){
    if (req.isAuthenticated()){
          return next();
    }
    res.send({error: 'You are not logged in!'});
}

var port = process.env.PORT || 5000;


app.listen(port, ()=> {
    console.log('post-it backend running on port ' + port);
})
