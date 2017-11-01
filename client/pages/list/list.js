const config = require('../../config')
const utils = require('../../utils/utils')
const app = getApp()
const Zan = require('../../plugins/zanui-weapp/dist/index.js')
Page(Object.assign({}, Zan.TopTips, {
	data: {
		/**
		 * 0:发起的列表
		 * 1:参加的列表
		 */
		flag: undefined,
		schedules: undefined,
	},

	onLoad(options) {
		//获取页面类型
		this.setData({
			flag: options.flag
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
			url: _this.data.flag == 0 ? config.service.schedulesOwnUrl : config.service.schedulesJoinUrl,
			data: { openId: app.userInfo.openId },
			method: 'POST',
			success: function (res) {
				if (res.data.code == 0) {
					console.log('获取schedules成功：', res)
					_this.setData({
						schedules: utils.parseSchedules(res.data.data)
					})
				} else {
					_this.showZanTopTips('获取计划失败...', res.data.data)
				}
			},
			fail: function (res) {
				_this.showZanTopTips('发起request失败...', res.data.data)
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
}))