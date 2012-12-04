exports.index = function (req, res) {
	if (req.session.user) {
		db.pages.find({parent:0}, function (pages) {
			res.render('index', {login:req.session.login, pages: pages});
		});
	}
	else{
		res.redirect('/login');
	}
};

exports.logout = function (req, res) {
	req.session = null;
	res.redirect('/');
};

exports.login = function (req, res) {
	res.render('login');
};

exports.auth = function (req, res){
	console.log('Запрос на авторизацию пользователя ' + req.body.login);
	db.users.find({
		login: req.body.login,
		password: req.body.pass
	}, function (users) {
		if(!users){
			res.redirect('/login');
			console.log('Неверные данные');
			return false;
		}
		req.session = { user: users[0].id, login:users[0].login };
		console.log('Залогинился ' + req.body.login);
		res.redirect('/');
	});

};

exports.notFound = function (req, res) {
	res.render('404');
}
exports.changePass = function (req, res) {
	db.users.find({id:req.session.user}, function(users) {

		var user = users[0];
		if (user.password == req.body.oldPass) {
			user.password = req.body.newPass;
			user.save(function(err, copy) {
				if (err) console.log(err);

				console.log('Пароль изменен у пользователя ' + copy.login);
				res.json({status: 'ok'});
			});
		} else {
			res.json({status: 'wrong pass'});
		}
	});
}
exports.wiki = function (req, res) {
	if (req.session.user) {
		db.pages.find({parent:0}, function (pages) {
			res.render('empty', {login:req.session.login, pages: pages});
		});
	}
	else{
		res.redirect('/login');
	}
}

