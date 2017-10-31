const DB = require('./mysql')('baoming')
const fs = require('fs')
const path = require('path')
const { mysql: config } = require('../config')


console.log('开始修改数据库...')
const INIT_DB_FILE = path.join(__dirname, './baoming.sql')


console.log(`准备读取 SQL 文件：${INIT_DB_FILE}`)

const content = fs.readFileSync(INIT_DB_FILE, 'utf8')

console.log('开始执行 SQL 文件...')

DB.raw(content).then(res => {
	console.log('SQL执行成功')
}, err => {
	throw new Error(err)
})


/*
mysql('schedule').select()
	.then(res => {
		return res.map(schedule => {
			let detail = JSON.parse(schedule.detail)
			detail.maxApplyQuantity = 0
			schedule.detail = detail
			return schedule
		})
	})
	.then(schedules => {
		schedules.forEach(schedule => {
			mysql('schedule').where('id', schedule.id)
				.update('detail', JSON.stringify(schedule.detail))
				.then(res => console.log('修改成功:', res))
				.catch(err => console.error('遇到错误:', err))
		})
	})
	.then(() => console.log('修复数据库结束...'))

*/