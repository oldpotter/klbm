module.exports = {
	onPayAuthor(){
		wx.showModal({
			title: '谢谢支持',
			content: '暂时不支持微信支付',
			showCancel: false,
			confirmText: '关闭',
		})
	},
}