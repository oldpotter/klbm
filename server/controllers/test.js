const mysql = require('../tools/mysql')()
const axios = require('axios')
const config = require('../config')

async function get(ctx, next) {
	ctx.state.data = 'Tom'
}

async function post(ctx, next) {
	await mysql('schedule').insert({ detail: '{ "name": "KKK" }' })
		.returning('id')
		.then(id => {
			ctx.state.data = 'okooookokkoo'
		})
		.catch(err => {
			ctx.state.code = -1
			console.log('post方法出错', err)
		})
}

async function getOpenId(ctx, next) {
	const { data, code } = ctx.request.body
	const appId = config.appId
	const secret = config.appSecret

	const ret = await axios.get(`https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${secret}&js_code=${code}&grant_type=authorization_code`)

	const sessionKey = ret.data.session_key
	const encryptedData = data.encryptedData
	const iv = data.iv

	const pc = new WXBizDataCrypt(appId, sessionKey)
	const result = pc.decryptData(encryptedData, iv)

	console.log('data: ', result)
	ctx.body = result
}

module.exports = {
	get,
	post,
	getOpenId
}