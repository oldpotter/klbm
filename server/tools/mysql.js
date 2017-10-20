const config = require('../config')
module.exports = (database) => require('knex')({
	client: 'mysql',
	connection: {
		host: '127.0.0.1',
		user: 'root',
		password: config.mysql.pass,
		database: database
	}
})