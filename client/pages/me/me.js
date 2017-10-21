/**
 * 主页
 * 
 */

const app = getApp()
const qcloud = require('../../plugins/wafer2-client-sdk/index')
class listItem {
	constructor(title) {
		this.title = title
	}
}

Page({
	data: {
		listItems: [
			new listItem('我发起的'),
			// new listItem('我参与的'),
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
		const index = event.currentTarget.dataset.index
		wx.navigateTo({
			url: `../list/list?index=${index}`,
		})
	}
})