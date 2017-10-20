const Zan = require('../../plugins/zanui-weapp/dist/index')
const observer = require('../../plugins/observer').observer
const util = require('../../utils/forpromise')
const app = getApp()
const config = require('../../config')
import { ResultModel } from '../../stores/result_model'

Page(Object.assign({}, Zan.TopTips, observer({
	props: {
		schedule: null,
		dateAndTimeIndex: null,
		timeBlockIndex: null,
		checkIdx1: 0,
		checkIdx2: 0,
	},

	onLoad(options) {
		this.props.dateAndTimeIndex = options.dateAndTimeIndex
		this.props.timeBlockIndex = options.timeBlockIndex
		this.props.schedule = app.schedule
	},

	onHide() {
		app.schedule = this.props.schedule
	},

	handleRadioChange(event) {
		const _this = this
		const checkIdx1 = event.detail.value.split(',')[0]
		const checkIdx2 = event.detail.value.split(',')[1]
		if (checkIdx1 == this.props.dateAndTimeIndex && checkIdx2 == this.props.timeBlockIndex) {
			_this.showZanTopTips('不能和自己交换')
			return
		}
		this.props.checkIdx1 = checkIdx1
		this.props.checkIdx2 = checkIdx2
	},

	handleBtnTap() {
		const _this = this
		let originTimeBlock = this.props.schedule.dateAndTimes[this.props.dateAndTimeIndex].timeBlocks[this.props.timeBlockIndex]
		let newTimeBlock = this.props.schedule.dateAndTimes[this.props.checkIdx1].timeBlocks[this.props.checkIdx2]

		let userInfo = newTimeBlock.userInfo
		newTimeBlock.userInfo = originTimeBlock.userInfo
		newTimeBlock.checked = true
		originTimeBlock.userInfo = userInfo
		originTimeBlock.checked = userInfo != null

		util.pLoading('请稍后...')
			.then(() => util.pRequest(config.service.editScheduleUrl, _this.props.schedule, 'POST'))
			.then(res => {
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
			.catch(err => {
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
	}

})))