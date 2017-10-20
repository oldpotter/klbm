// pages/preview/preview.js
const observer = require('../../plugins/observer').observer;
const extendObservable = require('../../plugins/mobx').extendObservable;
import { timeBlockStore, dateAndTimeStore, scheduleStore } from '../../stores/schedulestore.js'
const qcloud = require('../../plugins/wafer2-client-sdk/index')
const config = require('../../config')
const app = getApp()
const util = require('../../utils/forpromise')
import { ResultModel } from '../../stores/result_model'

Page(observer({

	props: {
		schedule: null,
		action: null,//new or edit
		scheduleIndex: null
	},

	onLoad(options) {
		this.props.schedule = app.schedule
		this.props.action = options.action
		this.props.scheduleIndex = options.index
	},


	//添加时间段
	handlePickTime: function (event) {
		var timeBlock = new timeBlockStore(event.detail.value)
		var index = event.currentTarget.dataset.dateAndTimeIndex
		this.props.schedule.dateAndTimes[index].timeBlocks.push(timeBlock)
	},

	//修改开始时间
	handleStartTimeChange: function (event) {
		var start = event.detail.value
		var dtIndex = event.currentTarget.dataset.dateAndTimeIndex
		var tbIndex = event.currentTarget.dataset.timeBlockIndex
		this.props.schedule.dateAndTimes[dtIndex].timeBlocks[tbIndex].start = start
	},

	//修改结束时间
	handleEndTimeChange: function (event) {
		var end = event.detail.value
		var dtIndex = event.currentTarget.dataset.dateAndTimeIndex
		var tbIndex = event.currentTarget.dataset.timeBlockIndex
		this.props.schedule.dateAndTimes[dtIndex].timeBlocks[tbIndex].end = end
	},

	//删除时间段
	handleLongPressTimeBlock: function (event) {
		var dtIndex = event.currentTarget.dataset.dateAndTimeIndex
		var tbIndex = event.currentTarget.dataset.timeBlockIndex
		var timeBlock = this.props.schedule.dateAndTimes[dtIndex].timeBlocks[tbIndex]
		var _this = this;
		wx.showModal({
			title: '删除时间段',
			content: '确定删除 ' + timeBlock.start + " -- " + timeBlock.end + " 吗？",
			confirmText: "删除",
			confirmColor: '#FF0000',
			cancelText: "取消",
			success: function (res) {
				if (res.confirm) {
					_this.props.schedule.dateAndTimes[dtIndex].timeBlocks.splice(tbIndex, 1)
				}
			}
		});
	},

	//点击确定
	handleOKBtnTap: function () {
		let _this = this
		if (this.props.action == 'new') {//新增计划
			util.pLoading('请稍后...')
				.then(() => util.pRequest(config.service.addScheduleUrl, _this.props.schedule, 'POST'))
				.then(res => {
					const id = res.data.data
					_this.props.schedule.id = id
					app.schedules.splice(0, 0, _this.props.schedule)
				})
				.then(() => {
					app.resultModel = new ResultModel(
						'success',
						'保存成功',
						'计划已经成功保存到服务器',
						'查看计划',
						'goToForm',
						'返回',
						'backToIndex'
					)
					wx.hideLoading()
					wx.redirectTo({
						url: './preview_result',
					})
				})
				.catch(err => {
					app.resultModel = new ResultModel(
						'fail',
						'保存失败',
						'请检查网络，然后返回重试一次',
						'',
						'',
						'返回',
						'back'
					)
					wx.hideLoading()
					wx.redirectTo({
						url
						: './preview_result',
					})
				})
		} else if (this.props.action == 'edit') {//修改计划
			util.pLoading('请稍后...')
				.then(() => util.pRequest(config.service.editScheduleUrl, _this.props.schedule, 'POST'))
				.then(() => {
					app.schedules.splice(_this.props.scheduleIndex, 1, _this.props.schedule)
				})
				.then(() => {
					app.resultModel = new ResultModel(
						'success',
						'修改成功',
						'',
						'查看计划',
						'goToForm',
						'返回',
						'backToIndex'
					)
					wx.hideLoading()
					wx.redirectTo({
						url
						: './preview_result',
					})
				})
				.catch(() => {
					app.resultModel = new ResultModel(
						'fail',
						'修改失败',
						'请检查网络，然后返回重试一次',
						'',
						'',
						'返回',
						'back'
					)
					wx.hideLoading()
					wx.redirectTo({
						url
						: './preview_result',
					})
				})

		}
	},

	//删除计划
	handleDeleteBtnTap() {
		const _this = this
		util.pShowModel(
			'删除计划',
			'一旦删除后，所有报名信息都将删除，确定要删除吗？',
			true,
			'取消',
			'',
			'删除',
			config.color.red
		)
			.then(() => util.pLoading('正在删除...'))
			.then(() => util.pRequest(config.service.removeScheduleUrl, _this.props.schedule, 'POST'
			))
			.then(res => {
				//删除成功
				//把schedule从本地删除
				app.schedules.splice(_this.props.scheduleIndex, 1)
			})
			.then(() => {
				app.resultModel = new ResultModel(
					'success',
					'删除成功',
					'计划已从服务器上删除',
					'',
					'',
					'返回',
					'backToIndex'
				)
				wx.hideLoading()
				wx.redirectTo({
					url: './preview_result',
				})
			})
			.catch((err) => {
				//删除失败
				app.resultModel = new ResultModel(
					'fail',
					'删除失败',
					'请检查网络，然后返回重试',
					'',
					'',
					'返回',
					'back'
				)
				wx.hideLoading()
				wx.redirectTo({
					url: './preview_result',
				})
			})

	},

	//返回上一层
	handleBackBtnTap() {
		wx.navigateBack({
			delta: 1,
		})
	}
}))
