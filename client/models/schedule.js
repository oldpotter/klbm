class Userinfo {
	constructor(nickName, avatarUrl, openId, paid) {
		this.nickName = nickName//昵称
		this.avatarUrl = avatarUrl//头像地址
		this.openId = openId
		this.paid = paid//是否已经付款
	}
}

class TimeBlock {
	constructor(start, end, checked = false, userinfo) {
		this.start = start//开始时间
		this.end = end//结束时间
		this.checked = checked//是否已经有人报名
		this.userinfo = userinfo
	}
}

class DateAndTime {
	constructor(date, timeBlocks=[]) {
		this.date = date//日期
		this.timeBlocks = timeBlocks//时间段
	}
}


class Schedule {
	constructor(title, description, dateAndTimes = [], maxApplyQuantity = 0, id, ownerOpenId) {
		this.title = title//标题
		this.description = description//描述
		this.dateAndTimes = dateAndTimes
		this.maxApplyQuantity = maxApplyQuantity//每个人最多报名次数
		this.id = id
		this.ownerOpenId = ownerOpenId//创建者openId
	}
}

module.exports = {
	Userinfo: Userinfo,
	TimeBlock: TimeBlock,
	DateAndTime: DateAndTime,
	Schedule: Schedule
}