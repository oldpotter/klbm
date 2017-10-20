const util = require('../../utils/forpromise')
const app = getApp()
const config = require('../../config')
import { ResultModel } from '../../stores/result_model'

Page({

	props: {
		schedule: null,
		dateAndTimeIndex: null,
		timeBlockIndex: null
	},

	onLoad(options) {
		this.props.dateAndTimeIndex = options.dateAndTimeIndex
		this.props.timeBlockIndex = options.timeBlockIndex
		this.props.schedule = app.schedule
	},

	onHide() {
		app.schedule = this.props.schedule
	},

	handleCancel() {
		const _this = this
		const dateAndTimeIndex = this.props.dateAndTimeIndex
		const timeBlockIndex = this.props.timeBlockIndex
		let timeBlock = this.props.schedule.dateAndTimes[dateAndTimeIndex].timeBlocks[timeBlockIndex]
		timeBlock.checked = false
		timeBlock.userInfo = null
		util.pLoading('请稍后...')
			.then(() => util.pRequest(config.service.editScheduleUrl, _this.props.schedule, 'POST'))
			.then(() => {
				wx.hideLoading()
				app.resultModel = new ResultModel(
					'success',
					'操作成功',
					'',
					'',
					'',
					'返回',
					'back'
				)
				wx.redirectTo({
					url: './form_result',
				})
			})
			.catch(() => {
				wx.hideLoading()
				app.resultModel = new ResultModel(
					'fail',
					'操作失败',
					'',
					'',
					'',
					'返回',
					'back'
				)
				wx.navigateTo({
					url: './form_result',
				})
			})
	},

	handleBack() {
		wx.navigateBack({
			delta: 1,
		})
	},
})