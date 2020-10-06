const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');


mongoose.connect(config.database);
let db = mongoose.connection;

//check connection
db.once('open', function(){
	console.log("Connected to MongoDB");
});

//Check for Db errors
db.on('error', (err)=>{
	console.log(err);
});
//init App
const app = express();

//Bring in Models
let Article = require('./models/articles');

//Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body Parser Middleware
//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


//Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));


//Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));



//Express messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});



// Express Validator Middleware
app.use(expressValidator({
	errorFormatter: function(param, msg, value){
		var namespace = param.split('.')
		, root = namespace.shift()
		, formParam = root;

		while(namespace.length){
			formParam += '[' + namespace.shift() + ']';
		}
		return{
			param: formParam,
			msg : msg,
			value : value
		};
	}
}));

//Passport Config
require('./config/passport')(passport);
//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next)=>{
res.locals.user = req.user || null;
next();
});


//Route files
let articles = require('./Routes/articles');
app.use('/articles', articles);
let users = require('./Routes/users');
app.use('/users', users);


//Home route
app.get('/', (req, res, next)=>{
	Article.find({}, (err, articles)=>{
		if(err){
			console.log(err);
		}else{
	res.render('index', {
		title: 'Articles',
		articles: articles
	});	
	}
	});	
	

}); 





//Start Server
app.listen(3000, ()=>{
	console.log('Server started on 3000');
});