var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

ArticleProvider = function(host, port) {
  this.db= new Db('node-mongo-test', new Server(host, port, {auto_reconnect: true}, {}));
  this.db.open(function(){});
};

ArticleProvider.prototype.addCommentToArticle = function(articleId, comment, callback) {
  this.getCollection(function(error, article_collection) {
    if( error ) callback( error );
    else {
      article_collection.update(
        {_id: article_collection.db.bson_serializer.ObjectID.createFromHexString(articleId)},
        {"$push": {comments: comment}},
        function(error, article){
          if( error ) callback(error);
          else callback(null, article)
        });
    }
  });
};

//getCollection

ArticleProvider.prototype.getCollection= function(callback) {
  this.db.collection('articles', function(error, article_collection) {
    if( error ) callback(error);
    else callback(null, article_collection);
  });
};

//findAll
ArticleProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, article_collection) {
      if( error ) callback(error)
      else {
        article_collection.find().toArray(function(error, results) {
          if( error ) callback(error)
          else {callback(null, results)}
        });
      }
    });
};

//findById

ArticleProvider.prototype.findById = function(id, callback) {
    this.getCollection(function(error, article_collection) {
      if( error ) callback(error)
      else {
        article_collection.findOne({_id: article_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
          if( error ) callback(error)
          else callback(null, result)
        });
      }
    });
};

//save
ArticleProvider.prototype.save = function(articles, callback) {
    this.getCollection(function(error, article_collection) {
      if( error ) callback(error)
      else {
	//TODO: Learn MongoDB and redo this
	articles.date_of_activity = new Date(articles.time_of_activity).toLocaleDateString();
	articles.current_time = new Date(articles.current_time);
	articles.time_of_activity = new Date(articles.time_of_activity);
	articles.eat_how_much = (articles.eat_how_much > 0) ? parseInt(articles.eat_how_much) : 0;

        /*if( typeof(articles.length)=="undefined")
          articles = [articles];

        for( var i =0;i< articles.length;i++ ) {
          article = articles[i];
        }*/

        article_collection.insert(articles, function() {
          callback(null, articles);
        });
      }
    });
};

//group by date and activity
ArticleProvider.prototype.findDateActivity= function(callback) {
    this.getCollection(function(error, article_collection) {
      if( error ) callback(error)
      else {
      article_collection.aggregate([
	{ $group :
                         { _id : {activity: "$what_activity", date: ("$date_of_activity")},
                           total_activity : { $sum : 1 }	
			  }
	  }
        ], function(err, results) {
          if( error ) callback(error)
          else {callback(null, results)}
      });
      }
    });
};

//group by date and amount of feedings 
ArticleProvider.prototype.findDateFeedings = function(callback) {
    this.getCollection(function(error, article_collection) {
      if( error ) callback(error)
      else {
      article_collection.aggregate([
	{ $group :
                         { _id : {activity: "$what_activity", date: ("$date_of_activity")},
                           total_activity : { $sum : 1 },
			   total_amount : { $sum: "$eat_how_much" }
                          }
          },
	{ $match: {"_id.activity": "eat" } }
        ], function(err, results) {
          if( error ) callback(error)
          else {callback(null, results)}
      });
      }
    });
};



exports.ArticleProvider = ArticleProvider;
