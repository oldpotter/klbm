const app = getApp()
const TimeBlock = require('../../models/schedule.js').TimeBlock
Page({
	data: {
		schedule: null
	},

	onLoad() {
		this.setData({
			schedule: app.schedule
		})
	},

	onHide() {
		app.schedule = this.data.schedule
	},

	//添加时间段
	handlePickTime(event) {
		const timeBlock = new TimeBlock(event.detail.value)
		const index = event.currentTarget.dataset.dateAndTimeIndex
		let schedule = this.data.schedule
		schedule.dateAndTimes[index].timeBlocks.push(timeBlock)
		this.setData({
			schedule: schedule
		})
	},

	//修改开始时间
	handleStartTimeChange(event) {
		const start = event.detail.value
		const dateAndTimeIndex = event.currentTarget.dataset.dateAndTimeIndex
		const timeBlockIndex = event.currentTarget.dataset.timeBlockIndex
		let schedule = this.data.schedule
		schedule.dateAndTimes[dateAndTimeIndex].timeBlocks[timeBlockIndex].start = start
		this.setData({
			schedule: schedule
		})
	},

	//修改结束时间
	handleEndTimeChange(event) {
		const end = event.detail.value
		const dateAndTimeIndex = event.currentTarget.dataset.dateAndTimeIndex
		const timeBlockIndex = event.currentTarget.dataset.timeBlockIndex
		let schedule = this.data.schedule
		schedule.dateAndTimes[dateAndTimeIndex].timeBlocks[timeBlockIndex].end = end
		this.setData({
			schedule: schedule
		})
	},

	//长按时间段
	onLongPressTimeBlock(event) {
		const dateAndTimeIndex = event.currentTarget.dataset.dateAndTimeIndex
		const timeBlockIndex = event.currentTarget.dataset.timeBlockIndex
		const timeBlock = this.data.schedule.dateAndTimes[dateAndTimeIndex].timeBlocks[timeBlockIndex]
		const _this = this;
		wx.showModal({
			title: '删除时间段',
			content: '确定删除 ' + timeBlock.start + " -- " + timeBlock.end + " 吗？",
			confirmText: "删除",
			confirmColor: '#FF0000',
			cancelText: "取消",
			success: function (res) {
				if (res.confirm) {
					let schedule = _this.data.schedule
					schedule.dateAndTimes[dateAndTimeIndex].timeBlocks.splice(timeBlockIndex, 1)
					_this.setData({
						schedule: schedule
					})
				}
			}
		});
	},
})