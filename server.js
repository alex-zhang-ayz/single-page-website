
var express = require('express');
var mongoose = require('mongoose');
var path = require("path");
var bodyParser = require("body-parser");

var userSchema = mongoose.Schema({
	email: String,
	password: String,
	adminStatus: Number, //0: Regular user, 1: Admin, 2: Super Admin
	profileLink: String,
	displayName: String,
	description: String,
	ip: String,
	location: {
		latitude: String,
		longitude: String					
	}
});

var default_img = "HeadProfile.png";
var User = mongoose.model('User', userSchema);

mongoose.connect('mongodb://localhost:$PORT');

var dbc = mongoose.connection;
dbc.on('error', console.error.bind(console, 'connection error:'));
dbc.once('open', function callback () {
	console.log('Connected to MongoDB');
});

var app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(express.static(__dirname)); //Serves static html, css, & js

app.all('/*', function(req, res, next) { //Deals with the access-control issues
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      next();
    });

app.listen(3000);

var numUsers = 0;

User.count({}, function(err, count){
	if (err) return (err);
	numUsers = count;
});


app.post("/newUser", function(req, res){
	var gUser = req.body;
	var admSt = 0;
	if (numUsers == 0){
		admSt = 2;
	}
	var newUser = new User({
		email: gUser.email,
		password: gUser.password,
		adminStatus: admSt,
		profileLink: default_img,
		displayName: gUser.email,
		description: "",
		ip: req.ip,
		location: {
			latitude: gUser.latitude,
			longitude: gUser.longitude
		}
	});
	console.log(newUser.location);
	newUser.save(function(err, newUser){
		if (err) return console.error(err);
	});
	numUsers++;
	res.send(newUser);
});

app.post("/getUser", function(req, res){
	var bd = req.body;
	User.find({email: req.body.email, password: req.body.password}, function(err, user){
		if(err) return console.error(err);
		if (user.length > 0){
			//Update user ip & location
			var updobj = {ip: req.ip, location: req.body.location};
			user[0].update(updobj, function(err2, u){
				if (err2) return (err2);
				res.send(user[0]);
			});
			
		}else{
			res.send("No user found");
		}
	});
	
});

app.get("/getUserById/:id", function(req, res){
	var id = req.params.id.substring(1);
	User.findById(id, function(err, user){
		if (err) return (err);
		if (!user){
			return "User not found";
		}
		res.send(user);
	});
});

app.get("/getAllUsers", function(req, res){
	User.find({}, function(err, users){
		if (err) return (err);
		res.send(users);
	});
});

app.post("/checkUser", function(req, res){
	User.find({email: req.body.email}, function(err, data){
		if (err) return (err);
		if (data.length > 0){
			console.log("true");
			res.send(true);
		}else{
			console.log("false");
			res.send(false);
		}
	});
});

app.post("/delUser", function(req, res){
	var user = req.body;
	User.remove({_id: user._id}, function(err){
		if (err) return (err);
		res.send("success");
	});
});

app.put("/updateUser/:id", function(req, res){
	var id = req.params.id.substring(1);
	var rbody = req.body;
	User.findById(id, function(err, user){
		if (err) return (err);
		if (!user){
			return "User not found";
		}
		console.log("Found user: "+user);
		user.update(rbody, function(err, user){
			if (err) return (err);
			console.log("Updated user: "+user);
			res.send(user)
		});
	});

});


