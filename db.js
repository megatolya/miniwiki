var orm = require('orm'),
	articles,
	users,
	db = orm.connect('mysql://root:123@localhost/wiki', function (success, db) {
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
		array.reverse();
		for (var i = 0; i <= array.length - 1; i++) {
			array[i] = { header: array[i].header, id: array[i].id, last: i==array.length - 1 ? true : false};
  		};
		callback.call(self, array);
	}
	exports.users = db.define('users', {
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
	exports.articles = articles;
});
