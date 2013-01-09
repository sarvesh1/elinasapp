/**
 * Module dependencies.
 */

var express = require('express');
var ArticleProvider = require('./articleprovider-mongodb').ArticleProvider;
var fs = require('fs');
/*var routes = require('./routes');*/
var querystring = require('querystring');
var rest = require('./rest.js')
  , oauth = require('./oauth.js')
  , url = require('url');

/**
 * Setup some environment variables (heroku) with defaults if not present
 */
var port = process.env.PORT;
var cid = process.env.CLIENT_ID;
var csecr = process.env.CLIENT_SECRET;
var lserv = process.env.LOGIN_SERVER;
var redir = process.env.REDIRECT_URI;
var mongo_uri = process.env.MONGO_URI;
var mongo_port = process.env.MONGO_PORT;
var mongo_user = process.env.MONGO_USER;
var mongo_pass = process.env.MONGO_PASS;


var sslkey = fs.readFileSync('ssl-key.pem');
var sslcert = fs.readFileSync('ssl-cert.pem')


/**
 * Middleware to call identity service and attach result to session
 */
function idcheck() {
        return function(req, res, next) {
                // Invoke identity service if we haven't got one or access token has
                // changed since we got it
            if (!req.session || !req.session.identity || req.session.identity_check != req.oauth.access_token) {
                                rest.api(req).identity(function(data) {
                                        //json object of salesforce data
                                        console.log(data);
                                        req.session.identity = data;
                                        req.session.identity_check = req.oauth.access_token;
                                        next();
                                });
                } else {
                        next();
                }
        }
}


/**
 * Create the server
 */
var app = module.exports = express.createServer(
    {    key: sslkey,
         cert: sslcert
    },
    express.cookieParser(),
    express.session({ secret: csecr }),
    express.query(),
    oauth.oauth({
        clientId: cid,
        clientSecret: csecr,
        loginServer: lserv,
        redirectUri: redir,
    }),
        idcheck()
);

/**
 * Configuration the server
 */
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
/*  app.use(require('stylus').middleware({ src: __dirname + '/public' }));*/
});



app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

var articleProvider = new ArticleProvider(mongo_uri, mongo_port, mongo_user, mongo_pass);


app.get('/', function(req, res){
    fs.readFile(__dirname + '/public/index.html', 'utf8', function(err, text){
        res.send(text);
    });
});

app.get('/activity', function(req, res){
    articleProvider.findAll( function(error,docs){
        res.render('index.jade', {
            title: 'Blog',
            articles:docs
        });
    })
});

app.get('/activity/bydate', function(req, res){
    //TODO: check if params were retreived
    articleProvider.findDateActivity( function( error, docs) {
	var results = {};

    for (var item in docs) {
	//must make sure there is a node for the date so you can add activities
        if(typeof results[docs[item]._id.date]=="undefined") {
            results[docs[item]._id.date]={};
        }
   	 
        results[docs[item]._id.date][docs[item]._id.activity]=docs[item].total_activity
    }
        res.contentType('json');
	res.send(results);
    });
});

app.get('/activity/feedings', function(req, res){
    //TODO: check if params were retreived
    articleProvider.findDateFeedings( function( error, docs) {
        var results = {};

    for (var item in docs) {
        //must make sure there is a node for the date so you can add activities
        if(typeof results[docs[item]._id.date]=="undefined") {
            results[docs[item]._id.date]={};
        }

        results[docs[item]._id.date]["activity"] = docs[item]._id.activity;
	results[docs[item]._id.date]["total_activity"] = docs[item].total_activity;
	results[docs[item]._id.date]["total_amount"] = docs[item].total_amount;

    }
        res.contentType('json');
        res.send(results);
    });
});



app.post('/activity/new', function(req, res){
    //TODO: check if params were retreived
    articleProvider.save(
	req.body
    , function( error, docs) {
	if(error) {res.send("Sad Face");}
	else {
		//update status on chatter
		 rest.api(req).updateStatus(req.session.identity.user_id,
			{text:req.param('chatter_post')},
                	function(callback){
                        	console.log(callback);
                	},
                	function(error){
                        	console.log("Status update failed");
                	}
        	);

		res.contentType('json');
        	res.send(JSON.stringify(docs));
	}
    });
});

app.get('/activity/:id', function(req, res) {
    articleProvider.findById(req.params.id, function(error, article) {
        res.render('blog_show.jade',
        {
            title: article.title,
            article:article
        });
    });
});

//get chatter feed
app.get('/feed', function(req, res) {
        rest.api(req).newsFeed(req.session.identity.user_id, function(feed){

	var chatter_feed = [];
	for (var item in feed.items) {
		chatter_feed.push({"name":feed.items[item].actor.name,
			"me":(req.session.identity.user_id == feed.items[item].actor.id) ? "yes" : "no",
			"createdDate":feed.items[item].createdDate,
			"text":feed.items[item].body.text}
		);
	}
		res.contentType('json');
                res.send(chatter_feed);
        },
        function(error){
                console.log("Something went wrong getting the feed");
        });
});



app.get('/feed/new', function(req, res) {
        rest.api(req).updateStatus(req.session.identity.user_id,
                /*{text:req.body.status},*/
                {text:req.query.status},
                function(callback){
                        console.log(callback);
                },
                function(error){
                        console.log("Status update failed");
                }
        );
});

/*app.post('/blog/addComment', function(req, res) {
    articleProvider.addCommentToArticle(req.param('_id'), {
        person: req.param('person'),
        comment: req.param('comment'),
        created_at: new Date()
       } , function( error, docs) {
           res.redirect('/blog/' + req.param('_id'))
       });
});*/

app.listen(process.env.VCAP_APP_PORT || 3001);
console.log("Express server listening on port 3001 in %s mode", app.settings.env);
