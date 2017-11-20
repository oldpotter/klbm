module.exports = {
	onPayAuthor() {
		this.setData({
			shangHidden: false
		})
	},
	onClickShang() {
		this.setData({
			shangHidden: true
		})
	},
}