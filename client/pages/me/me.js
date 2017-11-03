const app = getApp()
const qcloud = require('../../plugins/wafer2-client-sdk/index')
const foot = require('../../views/foot/index.js')


class listItem {
	constructor(title) {
		this.title = title
	}
}

Page(Object.assign({}, foot, {
	data: {
		listItems: [
			new listItem('发起的报名'),
			new listItem('参与的报名'),
		],
		userInfo: undefined
	},

	onShow() {
		const _this = this
		wx.showLoading({
			title: '请稍后',
		})
		qcloud.login({
			success(userInfo) {
				console.log('获取userInfo成功:', userInfo)
				_this.setData({
					userInfo: userInfo
				})
				app.userInfo = userInfo
				wx.hideLoading()
			},
			fail() {
				wx.hideLoading()
			}
		})
	},

	//打开设置页
	onClickOpenSettingPage() {
		wx.openSetting({
		})
	},

	onClickCell(event) {
		const flag = event.currentTarget.dataset.index
		wx.navigateTo({
			url: `../list/list?flag=${flag}`,
		})
	}
}))