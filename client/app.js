//app.js
const qcloud = require('./plugins/wafer2-client-sdk/index')
const config = require('./config')

App({
	onLaunch() {
		const _this = this
		qcloud.setLoginUrl(config.service.loginUrl)
		//监听网络变化
		wx.onNetworkStatusChange(function (res) {
			if (res.isConnected) {
				wx.showToast({
					title: '网络已经连接',
				})
			}
		})

	},

	//用户信息
	userInfo: null,
	//选中的schedule(或是新增的schedule)
	schedule: null,
	result:null,
	//所有schedules 
	//在服务器的结构是{id:(int),detail:{schedule}}
	//本地结构{schedules}
	schedules: null,
	//resultModel
	resultModel: null,
	isNetConnected: null
})
