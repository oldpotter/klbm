const qcloud = require('../plugins/wafer2-client-sdk/index')
/**
 * 等待框
 */
function pLoading(title) {
	return new Promise((resolve, reject) => {
		wx.showLoading({
			title: title,
			mask: true,
			success: function (res) {
				resolve()
			},

		})
	})
}


/**
 * 下拉刷新
 */
function pRefreshing() {
	return new Promise((resolve) => {
		wx.startPullDownRefresh({
			success: function (res) {
				resolve()
			},
		})
	})
}

/**
 * 网络请求
 */
function pRequest(url, data, method = 'GET', header = {}, dataType = 'json') {
	return new Promise((resolve, reject) => {
		wx.request({
			url: url,
			data: data,
			header: header,
			method: method,
			dataType: dataType,
			success: function (res) {
				resolve(res)
			},
			fail: function (res) {
				reject(res)
			},
		})
	})
}


//登录
function pLogin() {
	const _this = this
	return new Promise((resolve, reject) => {
		qcloud.login({
			success(userInfo) {
				resolve(userInfo)
			},
			fail(err) {
				reject(err)
			}
		})

	})
}

/**
 * action sheet
 */
function pActionSheet(...options) {
	return new Promise(resolve => {
		wx.showActionSheet({
			itemList: [...options],
			success: function (res) {
				if (!res.cancel) {
					resolve(res)
				}
			},
		})
	})
}


/**
 * show model
 */
function pShowModel(title, content, showCancel, cancelText, cancelColor, confirmText, confirmColor) {
	return new Promise(resolve => {
		wx.showModal({
			title: title,
			content: content,
			showCancel: showCancel,
			cancelText: cancelText,
			cancelColor: cancelColor,
			confirmText: confirmText,
			confirmColor: confirmColor,
			success: function (res) {
				if (res.confirm) {
					resolve()
				}
			},
		})
	})
}

/**
 * set storage
 */
function pSetStorage(key, data) {
	return new Promise((resolve, reject) => {
		wx.setStorage({
			key: key,
			data: data,
			success() {
				resolve()
			},
			fail() {
				reject()
			}
		})
	})
}

//清理login session
function pClearLoginSession() {
	return new Promise((resolve) => {
		qcloud.clearSession()
		resolve()
	})
}

//获取网络状态
function pGetNetworkType(){
	return new Promise(resolve=>{
		wx.getNetworkType({
			success: function(res) {
				resolve(res)
			},
		})
	})
}


module.exports = {
	pLoading,
	pRefreshing,
	pRequest,
	pActionSheet,
	pShowModel,
	pLogin,
	pSetStorage,
	pClearLoginSession,
	pGetNetworkType
}