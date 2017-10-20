const observer = require('../../plugins/observer').observer
const extendObservable = require('../../plugins/mobx').extendObservable
const util = require('../../utils/forpromise')
const app = getApp()
const config = require('../../config')
import { ResultModel } from '../../stores/result_model'
import { timeBlockStore, dateAndTimeStore, scheduleStore, userInfoStore } from '../../stores/schedulestore.js'

const errorCodes = {
	APPLY_FAIL: 1001,//报名失败
}

let store = function () {
	extendObservable(this, {
		name: '',
		get isValid() {
			return this.name.trim() != ''
		}
	})
}

Page(observer({
	props: {
		store: new store(),
		schedule: null,
		dateAndTimeIndex: null,
		timeBlockIndex: null
	},

	onLoad(options) {
		this.props.store.name = ''
		this.props.dateAndTimeIndex = options.dateAndTimeIndex
		this.props.timeBlockIndex = options.timeBlockIndex
		this.props.schedule = app.schedule
	},



	onHide() {
		app.schedule = this.props.schedule
	},


	handleNameChanged(event) {
		this.props.store.name = event.detail.value
	},

	handleSaveBtnTap() {
		const _this = this
		const dateAndTimeIndex = this.props.dateAndTimeIndex
		const timeBlockIndex = this.props.timeBlockIndex
		let timeBlock = this.props.schedule.dateAndTimes[dateAndTimeIndex].timeBlocks[timeBlockIndex]
		timeBlock.userInfo = new userInfoStore()
		timeBlock.userInfo.nickName = this.props.store.name
		timeBlock.checked = true
		const data = {
			schedule: _this.props.schedule,
			checkItems: [{ dateAndTimeIndex, timeBlockIndex }]
		}
		util.pLoading('请稍后...')
			.then(() => util.pRequest(config.service.applyScheduleUrl, data, 'POST'))
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

}))