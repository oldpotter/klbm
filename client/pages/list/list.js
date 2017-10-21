const config = require('../../config')
const utils = require('../../utils/utils')
const app = getApp()
Page({
	data: {
		/**
		 * 0:发起的列表
		 * 1:参加的列表
		 */
		index: undefined,
		schedules: undefined,
	},

	onLoad(options) {
		//获取页面类型
		this.setData({
			index: options.index
		})

		this.getSchedules()
	},

	//获取数据
	getSchedules() {
		const _this = this
		wx.showLoading({
			title: '正在获取数据...',
		})
		wx.request({
			url: _this.data.index == 0 ? config.service.schedulesOwnUrl : config.service.schedulesJoinUrl,
			data: { openId: app.userInfo.openId },
			method: 'POST',
			success: function (res) {
				console.log('获取schedules成功：', res)
				_this.setData({
					schedules: utils.parseSchedules(res.data.data)
				})
			},
			fail: function (res) {
				console.error('获取schedules失败')
			},
			complete: function (res) {
				wx.hideLoading()
			},
		})
	},


	//编辑计划
	onEdit(event) {
		const index = event.currentTarget.dataset.index
		app.schedule = this.data.schedules[index]
		wx.navigateTo({
			url: `../preview/preview?action=edit&index=${index}`,
		})
	},


	//查看报名
	onLook(event) {
		const index = event.currentTarget.dataset.index
		app.schedule = this.data.schedules[index]
		wx.navigateTo({
			url: `../form/form?isOwner=${index == 0 ? 1 : 0}`,
		})
	},

	//新建
	onClickBtn() {
		wx.navigateTo({
			url: '../schedule/schedule',
		})
	}
})