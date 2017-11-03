const Zan = require('../../plugins/zanui-weapp/dist/index')
const TimeBlock = require('../../models/schedule.js').TimeBlock
const DateAndTime = require('../../models/schedule.js').DateAndTime
const Schedule = require('../../models/schedule.js').Schedule
const moment = require('../../utils/moment.min.js')
const app = getApp()
const config = require('../../config')
const Result = require('../../models/result.js')

Page(Object.assign({}, Zan.Quantity, Zan.TopTips, {

	data: {
		action: null,//add or edit
		title: null,//标题
		description: null,//描述
		dateStart: undefined,//开始日期
		dateEnd: undefined,//结束日期
		timeBlocks: [],//时间段
		maxApplyQuantity: 0,//每人最多报名数
		quantityItem: {
			quantity: 0,
			min: 0,
			max: 99
		},
		isGenerated: false,//是否已经生成日期数据
	},

	onLoad(options) {
		if (options.action == 'edit') {
			this.setData({
				action: options.action,
				title: app.schedule.title,
				description: app.schedule.description,
				dateStart: app.schedule.dateStart,
				dateEnd: app.schedule.dateEnd,
				// timeBlocks: app.schedule.dateAndTimes[0].timeBlocks,
				maxApplyQuantity: app.schedule.maxApplyQuantity,
				appendDateStart: undefined,
				appendDateEnd: undefined
			})
		}
	},

	//修改标题
	onTitleChange(event) {
		this.setData({
			title: event.detail.value
		})
	},

	//修改描述
	onDescriptionChange(event) {
		this.setData({
			description: event.detail.value
		})
	},

	//修改开始日期
	onDateStartChange(event) {
		this.setData({
			dateStart: event.detail.value
		})
	},

	//修改结束日期
	onDateEndChange(event) {
		this.setData({
			dateEnd: event.detail.value
		})
	},

	onAppendDateStartChange(event) {
		this.setData({
			appendDateStart: event.detail.value
		})
	},

	onAppendDateEndChange(event) {
		this.setData({
			appendDateEnd: event.detail.value
		})
	},

	//添加时间段
	handlePickTime(event) {
		let timeBlock = new TimeBlock(event.detail.value)
		let timeBlocks = this.data.timeBlocks
		timeBlocks.push(timeBlock)
		this.setData({
			timeBlocks: timeBlocks
		})
	},

	//修改开始时间
	handleStartTimeChange(event) {
		const start = event.detail.value
		const index = event.currentTarget.dataset.timeBlockIndex
		const param = `timeBlocks[${index}].start`
		this.setData({
			[param]: start
		})
	},

	//修改结束时间
	handleEndTimeChange(event) {
		const end = event.detail.value
		const index = event.currentTarget.dataset.timeBlockIndex
		const param = `timeBlocks[${index}].end`
		this.setData({
			[param]: end
		})
	},

	//长按时间段
	onLongPressTimeBlock(event) {
		const index = event.currentTarget.dataset.timeBlockIndex
		const timeBlock = this.data.timeBlocks[index]
		const _this = this;
		wx.showModal({
			title: '删除时间段',
			content: '确定删除 ' + timeBlock.start + " -- " + timeBlock.end + " 吗？",
			confirmText: "删除",
			confirmColor: '#FF0000',
			cancelText: "取消",
			success: function (res) {
				if (res.confirm) {
					let timeBlocks = _this.data.timeBlocks
					timeBlocks.splice(index, 1)
					_this.setData({
						timeBlocks: timeBlocks
					})
				}
			}
		});
	},

	//修改最大报名数
	handleZanQuantityChange(event) {
		const quantity = event.quantity
		this.setData({
			'quantityItem.quantity': quantity
		})
		this.setData({
			maxApplyQuantity: quantity
		})
	},

	//保存计划
	onSave() {
		const _this = this
		if (!this.data.isGenerated) {
			app.schedule = this.generateData()
		}
		app.schedule.title = this.data.title
		app.schedule.description = this.data.description
		app.schedule.ownerOpenId = app.userInfo.openId
		app.schedule.maxApplyQuantity = this.data.maxApplyQuantity
		app.schedule.dateStart = this.data.dateStart
		app.schedule.dateEnd = app.schedule.dateAndTimes[app.schedule.dateAndTimes.length - 1].date
		wx.showLoading({
			title: '请稍后...',
			mask: true,
		})

		wx.request({
			url: _this.data.action == 'edit' ? config.service.editScheduleUrl : config.service.addScheduleUrl,
			data: app.schedule,
			method: 'POST',
			success: function (res) {
				if (res.data.code == 0) {
					wx.showToast({
						title: '操作成功',
					})
					setTimeout(() => {
						wx.navigateBack({
							delta: 1,
						})
					}, 1700)
				} else {
					_this.showZanTopTips('操作失败')
					wx.hideLoading()
				}
			},
			fail: function (res) {
				_this.showZanTopTips('请求失败')
				wx.hideLoading()
			},
		})
	},

	//预览计划
	onPreview() {
		if (!this.data.isGenerated) {
			app.schedule = this.generateData()
		}
		wx.navigateTo({
			url: './edit_preview',
		})
	},

	//生成日期数据
	generateData() {
		let schedule = this.data.action == 'edit' ? app.schedule : new Schedule()
		let count = moment.duration(moment(this.data.action == 'edit' ? this.data.appendDateEnd : this.data.dateEnd) - moment(this.data.action == 'edit' ? this.data.appendDateStart : this.data.dateStart)).asDays()//相隔天数
		for (let i = 0; i <= count; i++) {
			let date = moment(this.data.action == 'edit' ? this.data.appendDateStart : this.data.dateStart).add(i, 'd').format('YYYY-MM-DD')
			let dateAndTime = new DateAndTime(date)
			this.data.timeBlocks.forEach(timeBlock => dateAndTime.timeBlocks.push(Object.assign({}, timeBlock)))
			schedule.dateAndTimes.push(dateAndTime)
		}
		this.setData({
			isGenerated: true
		})
		return schedule
	}

}))