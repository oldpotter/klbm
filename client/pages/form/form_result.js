const app = getApp()
Page({
	data: {
		store: null
	},

	onLoad() {
		this.setData({
			store: app.resultModel
		})
	},

	
	back(){
		wx.navigateBack({
			delta: 1,
		})
	},

	showSetting(){
		wx.openSetting({
		})
		wx.navigateBack({
			delta: 1,
		})
	}


})