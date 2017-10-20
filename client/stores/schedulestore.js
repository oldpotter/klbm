const extendObservable = require('../plugins/mobx').extendObservable;
const moment = require('../utils/moment.min.js')


let userInfoStore = function (nickName, avatarUrl, openId) {
	extendObservable(this, {
		nickName: null,//报名的用户名
		avatarUrl: null,//用户头像地址
		openId: null,//用户唯一性标示
		paid:null//是否已经付款
	})
}

/**
 * time block
 */
let timeBlockStore = function (start, end) {
	extendObservable(this, {
		start: start || '',
		end: end || '',
		checked: false,//是否被选择,
		userInfo: null
	})
}

/**
 * date
 */
let dateAndTimeStore = function (date, timeBlocks) {
	extendObservable(this, {
		date: date || '',
		timeBlocks: timeBlocks || [],
	})
}

/**
 * schedule
 */
let scheduleStore = function (title, description, dateStart, dateEnd, dateAndTimes) {
	extendObservable(this, {
		title: title || '',//标题
		description: description || '',//描述
		dateStart: dateStart || '',//开始日期
		dateEnd: dateEnd || '',//结束日期
		dateAndTimes: dateAndTimes || [],
		id: 0,//数据库id
		maxApplyQuantity: 0//每人限报时间段数
	})
}

export { timeBlockStore, dateAndTimeStore, scheduleStore, userInfoStore }
