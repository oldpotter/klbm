const mysql = require('../tools/mysql')('baoming')
const errorCodes = {
	APPLY_FAIL: 1001,//报名失败
	OTHER_ERROR: 1333
}

/**
 * knex返回的基本都是数组[]，取值时需要作相关操作！！！
 * 
 */
//添加新计划
async function add(ctx, next) {
	let schedule = JSON.stringify(ctx.request.body)
	let scheduleId
	await mysql('schedule')
		// .returning(['id', 'detail'])//mysql返回影响的rows数
		.insert({ detail: schedule })
		.then(ids => mysql('schedule').where('id', ids[0]).select())
		.then(schedules => {
			let schedule = schedules[0]
			let detail = JSON.parse(schedule.detail)
			detail.id = schedule.id
			scheduleId = schedule.id
			return mysql('schedule')
				.where('id', schedule.id)
				.update('detail', JSON.stringify(detail))
		})
		.then(() => {
			ctx.state.data = scheduleId
		})
		.catch((err) => {
			ctx.state.code = -1
		})
}

//查询所有计划
async function all(ctx, next) {
	await mysql.select().from('schedule')
		.then(res => {
			ctx.state.data = res
		})
		.catch(err => {
			ctx.state.code = -1
		})
}

//所有创建的计划
async function allOwn(ctx, next) {
	const { openId } = ctx.request.body
	await mysql.select().from('schedule')
		.whereRaw('detail->"$.ownerOpenId" = ?', [openId])
		.orderBy('id', 'desc')
		.then(res => {
			ctx.state.data = res
		})
		.catch(err => {
			ctx.state.code = -1
		})
}

//所有参加的计划
async function allJoin(ctx, next) {

}

//修改一个计划
async function edit(ctx, next) {
	let schedule = ctx.request.body
	await mysql('schedule')
		.where('id', schedule.id)
		.update({
			id: schedule.id,
			detail: JSON.stringify(schedule)
		})
		.then(res => {
			ctx.state.code = 0
		})
		.catch(() => {
			ctx.state.code = -1
		})
}

//报名
async function apply(ctx, next) {
	let { schedule, checkItems } = ctx.request.body
	const _this = this
	let resultId
	await mysql('schedule')
		.where('id', schedule.id)
		.select()
		.then(res => {
			try {
				let detail = JSON.parse(res[0].detail)
				const valid = !checkItems.some(item => {
					const dateAndTime = detail.dateAndTimes[item.dateAndTimeIndex]
					const timeBlock = dateAndTime.timeBlocks[item.timeBlockIndex]
					return timeBlock.checked
				})
				if (!valid) {
					throw new Error(errorCodes.APPLY_FAIL)
				}
				return mysql('schedule').where('id', schedule.id).update('detail', JSON.stringify(schedule)).then(res => resultId = res[0])
			} catch (err) {
				throw new Error(errorCodes.OTHER_ERROR)
			}

		})
		.then(() => {
			ctx.state.code = 0
			ctx.state.data = resultId
		})
		.catch(err => {
			ctx.state.code = err.message
		})
}

//删除一个计划
async function remove(ctx, next) {
	const schedule = ctx.request.body
	await mysql('schedule')
		.where('id', schedule.id)
		.del()
		.then(res => ctx.state.data = res[0])
		.catch(err => ctx.state.code = -1)
}

//选择一个计划
async function one(ctx, next) {
	const { scheduleId } = ctx.request.body
	await mysql('schedule')
		.where('id', scheduleId)
		.select()
		.then(res => ctx.state.data = res[0])
		.catch(err => ctx.state.code = -1)
}

module.exports = {
	add,
	all,
	edit,
	remove,
	one,
	apply,
	allOwn,
	allJoin
}