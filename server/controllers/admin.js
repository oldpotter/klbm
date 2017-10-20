const mysql = require('../tools/mysql')('baoming')
const STATE_CODES = {
	LOGIN_SUCCESS: 1001,
	LOGIN_FAIL: -1001
}


async function login(ctx, next) {
	const { userName, password } = ctx.request.body
	await mysql('admin')
		.where({ userName: userName, password: password })
		.then(res => {
			ctx.state.code = res.length > 0 ? STATE_CODES.LOGIN_SUCCESS : STATE_CODES.LOGIN_FAIL
		})
		.catch(err => {
			ctx.state.code = -1
		})
}

module.exports = {
	login
}