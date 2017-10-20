const mysql = require('./mysql')('schedule')

console.log('开始修改数据库...')

//增加schedule maxApplyQuantity字段
mysql('schedule').select()
	.then(res => {
		return res.map(schedule => {
			let detail = JSON.parse(schedule.detail)
			// detail.dateAndTimes.forEach(dateAndTime => {
			// 	dateAndTime.timeBlocks.forEach(timeBlock => {
			// 		timeBlock.nickName = null
			// 		timeBlock.avatarUrl = null
			// 	})
			// })
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

