var orm = require('orm'),
	articles,
	users;

var db = orm.connect('mysql://root:123@localhost/wiki', function (success, db) {
    if (!success) {
        console.log('Не подключена БД!!!');
        return;
    }
    console.log('База подключена');
	articles = db.define('articles', {
	    'id'        : { 'type': 'int' },
	    'header'    : { 'type': 'string'},
	    'text'      : { 'type': 'string' },
	    'parent'    : { 'type': 'integer' }
	}, {
	    'methods' : {
	        'getId' :function () {
	            return this.id;
	        }

	    }
	});
	articles.sync();

	articles.getTree = function (article, array, callback) {
		var self = this;

		array.push(article);
		if (article.parent != 0) {
			self.find({ id: article.parent }, function (articleParent) {
				self.getTree(articleParent[0], array, callback);
			});
		}

		for (var i = 0; i <= array.length - 1; i++) {
			array[i] = {
				header: array[i].header,
				parent: array[i].parent,
				id: array[i].id,
				last: false
			};
  		};
  		array[0].last = true;
		callback.call(self, array);
	}
	users = db.define('users', {
		'id'          : { 'type': 'int' },
	    'login'       : { 'type': 'string'},
	    'password'    : { 'type': 'string' },
	    'params'      : { 'type': 'object' }
	}, {
		'methods' : {
			'getId' : function () {
				return this.id;
			}
		}
	});
	users.sync();

	exports.users = users;
	exports.articles = articles;
});
