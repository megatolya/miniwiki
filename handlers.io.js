exports.newWikiPage = function (data) {
	var page = new db.pages(data);
	page.save(function (err, copy) {
	    if (!err) {
	        console.log('Новая вики страница #' + page.id);
	        socket.emit('newWikiPageSave', page.id);
	    }
	});
};
exports.getWikiPage = function(data) {
	console.log('запрос wiki страницы #' , data.id);
  	db.pages.find({ id : data.id}, function (article) {
  		article = article[0];
  		db.pages.find({parent: article.id}, function(children) {
  			db.pages.getTree(article, [], function(breadCrumbs) {
  				article.breadCrumbs = breadCrumbs;
  				if (children) {
	  				article.children = [];
		  			for (var i = children.length - 1; i >=  0; i--) {
		  				article.children[i] = {}
		  				article.children[i].header = children[i].header;
		  				article.children[i].id = children[i].id;
		  			};
	  			}
	  			socket.emit('buildWikiPage', article);
  			});
  		});

  	});
};

exports.disconnect = function () {
	console.log('Отключился транспорт');
};