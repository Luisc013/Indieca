//load in environment variables
if(process.env.NODE_ENV !== "production") {
  require('dotenv').config()
}

//dependency requirements
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const path = require('path')
const initializePassport = require('./passport-config')
const pg = require('pg')
const engine = require('ejs-locals')
const bodyParser = require('body-parser');
app.engine('ejs', engine)
//Database
const database = require('./config/database.js')

//Test database
  database.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

//Initiating Passpot
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

const users = []
// name of secret key in dotenv file, random string of number for security
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))



// take forms and access them in req variables to pass them thru post methods
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files 
app.use(express.static(path.join(__dirname, 'public')))

// set the view engine to ejs
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
// use res.render to load up an ejs view file
res.render('home.ejs')
})

app.get('/indies', (req, res) => {
  res.render('indie.ejs')
  })

app.get('/community', (req, res) => {
res.render('community.ejs')
})

app.get('/about', (req, res) => {
res.render('about.ejs')
})

app.get('/profile', checkAuthenticated, (req, res) => {
res.render('index.ejs', { name: req.user.name })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
})

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

//middleware thatll text req, res and the next function when we done with authentication
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
      return next()
  }
  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
      return res.redirect('/profile')
  }
  next()
}

//User routes
app.use('/users', require('./routes/users'))


module.exports = app
const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Server started on port ${PORT}`));