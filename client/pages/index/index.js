// index.js
const observer = require('../../plugins/observer').observer;
const isObservable = require('../../plugins/mobx').isObservable
const app = getApp();
const qcloud = require('../../plugins/wafer2-client-sdk/index')
const config = require('../../config')
const util = require('../../utils/forpromise')

Page(observer({

	props: {
		schedules: null
	},

	onShow: function () {
		this.props.schedules = app.schedules
	},

	onHide() {
		app.schedules = this.props.schedules
	},

	onReady() {
		const _this = this
		if (wx.startPullDownRefresh) {
			wx.startPullDownRefresh({
				success: function (res) {
					_this.getSchedules()
				},
			})
		} else {
			_this.getSchedules()
		}

	},

	//编辑计划
	handleClickEditBtn: function (event) {
		let index = event.currentTarget.dataset.scheduleIndex
		let schedule = this.props.schedules[index]
		app.schedule = schedule
		wx.navigateTo({
			url: `../preview/preview?action=edit&index=${index}`,
		})
	},

	//新建计划
	handleBtnTap() {
		wx.navigateTo({
			url: '../schedule/schedule',
		})
	},

	//查看报名
	handleClickLookBtn(event) {
		let index = event.currentTarget.dataset.scheduleIndex
		let schedule = this.props.schedules[index]
		app.schedule = schedule
		wx.navigateTo({
			url: `../form/form?isFromNative=1`,
		})
	},

	//获取数据
	getSchedules() {
		const _this = this
		util.pLoading('从远程获取数据...')
			.then(() => util.pRequest(config.service.allSchedulesUrl))
			.then(res => {
				console.log(res)
				_this.props.schedules = res.data.data.map(obj => {
					obj.detail = JSON.parse(obj.detail)
					obj.detail.id = obj.id
					return obj.detail
				}).reverse()
			})
			.then(() => {
				setTimeout(() => {
					wx.hideLoading()
					wx.stopPullDownRefresh()
				}, 100)
			})
			.catch(err => {
				wx.showToast({
					title: '获取失败...',
				})
				wx.stopPullDownRefresh()
			})

	}

}))