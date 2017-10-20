const observer = require('../../plugins/observer').observer
const extendObservable = require('../../plugins/mobx').extendObservable
const util = require('../../utils/forpromise')
const app = getApp()
const config = require('../../config')
import { ResultModel } from '../../stores/result_model'

let store = function () {
	extendObservable(this, {
		items: [
			{ name: '未付款', value: 0, checked: false },
			{ name: '已付款', value: 1, checked: true }
		],
	})

	this.setCheck = function (index) {
		if (this.items[index].checked) {
			return
		}
		this.items[index].checked = !this.items[index].checked
		this.items[1 - index].checked = !this.items[1 - index].checked
	}

	this.getCheck = function () {
		return this.items[0].checked ? false : true
	}
}

Page(observer({
	props: {
		store: new store(),
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

	handleRadioChange(event) {
		this.props.store.setCheck(event.detail.value)
	},

	handleSaveBtnTap() {
		const _this = this
		const dateAndTimeIndex = this.props.dateAndTimeIndex
		const timeBlockIndex = this.props.timeBlockIndex
		let timeBlock = this.props.schedule.dateAndTimes[dateAndTimeIndex].timeBlocks[timeBlockIndex]
		timeBlock.userInfo.paid = this.props.store.getCheck()
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

}))