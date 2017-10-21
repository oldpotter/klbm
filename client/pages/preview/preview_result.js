import { ResultModel } from '../../stores/result_model'
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

	/**
	 * 返回index页
	 */
	backToIndex() {
		wx.navigateBack({
			delta: 3,
		})
	},

	/**
	 * 返回上一层
	 */
	back() {
		wx.navigateBack({
			delta: 1,
		})
	},

	/**
	 * 查看计划
	 */
	goToForm(){
		wx.redirectTo({
			url: `../form/form?isFromNative=1&scheduleId=${app.schedule.id}`,
		})
	}

})