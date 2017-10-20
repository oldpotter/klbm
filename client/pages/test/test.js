Page({
	data: {
		items: null
	},

	onLoad() {
		let items = []
		let i = 0
		while (i < 200) {
			items.push(i)
			i++
		}
		this.setData({
			items: items
		})
	}

})