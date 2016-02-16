require('dotenv').config({silent: true})

var randomColor = require('randomcolor')
var shortid = require('shortid')

var express = require('express')
var bodyParser = require('body-parser')
var exphbs  = require('express-handlebars')
var babelMiddleware = require('babel-connect')

var Pusher = require('pusher')

var pusher = new Pusher({
  appId:  process.env.APP_ID,
  key:    process.env.KEY,
  secret: process.env.SECRET
})

var app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.engine('hbs', exphbs())
app.set('view engine', 'hbs')


app.get('/', (req, res, next) => {
  res.redirect(shortid.generate())
})

app.get('/:shortid', (req, res, next) => {

  if(!shortid.isValid(req.params.shortid))
    return next()

  res.render('main', {
    id: req.params.shortid,
    key: process.env.KEY
  })
})

app.post('/pusher/auth', (req, res) => {
  var socketId = req.body.socket_id
  var channel = req.body.channel_name

  var auth = pusher.authenticate(socketId, channel, {
    user_id: shortid(),
    user_info: {
      color: randomColor({luminosity: 'bright'})
    }
  })

  res.send(auth)
})

app.use(babelMiddleware({src: 'views', options: {retainLines: true}}))

var port = process.env.PORT || 5000
app.listen(port)
