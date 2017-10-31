const config = require('../config')
module.exports = (database) => require('knex')({
	client: 'mysql',
	connection: {
		host: config.mysql.host,
		user: 'root',
		password: config.mysql.pass,
		database: database
	}
})