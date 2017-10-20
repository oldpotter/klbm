// session.js
const observer = require('../../plugins/observer').observer
const extendObservable = require('../../plugins/mobx').extendObservable
const isObservable = require('../../plugins/mobx').isObservable
const moment = require('../../utils/moment.min.js');
import { timeBlockStore, dateAndTimeStore, scheduleStore } from '../../stores/schedulestore.js'
const Zan = require('../../plugins/zanui-weapp/dist/index')
const app = getApp()
const config = require('../../config')

let store = function () {
	extendObservable(this, {
		title: '',
		description: '',
		dateStart: '',
		dateEnd: '',
		timeBlocks: [],
		maxApplyQuantity: 0,
		get isValid() {
			return this.title.trim() != '' && this.description.trim() != '' && this.dateStart != '' && this.dateEnd != '' && this.timeBlocks.length != 0 && !this.timeBlocks.some((tb) => tb.end == '')
		},
	})

	this.getObservableTimeBlocks = function () {
		return this.timeBlocks.map((timeBlock) => new timeBlockStore(timeBlock.start, timeBlock.end))
	}
}

Page(Object.assign({}, Zan.Quantity, observer({

	data: {
		quantityItem: {
			quantity: 0,
			min: 0,
			max: 99
		},
	},

	props: {
		store: new store(),
	},

	onShow: function () {
		//测试数据
		let store = this.props.store
		const debug = config.DEBUG
		store.title = debug ? '测试标题' : ''
		store.description = debug ? '描述，省略1000字，\n测试换行asdf&^*' : ''
		store.dateStart = debug ? moment().format('YYYY-MM-DD') : ''
		store.dateEnd = debug ? moment().add(7, 'd').format('YYYY-MM-DD') : ''
		store.timeBlocks.splice(0, store.timeBlocks.length)
		store.maxApplyQuantity = 0
		if (debug) {
			store.timeBlocks.push(new timeBlockStore('08:00', '10:00'), new timeBlockStore('11:00', '12:00'), new timeBlockStore('13:00', '15:00'), )
		}
	},


	//改标题
	handleTitleChanged: function (event) {
		this.props.store.title = event.detail.value
	},

	
	//改描述
	handleDescriptionChanged: function (event) {
		this.props.store.description = event.detail.value;
	},

	//修改开始日期
	handleDateStartChanged: function (event) {
		this.props.store.dateStart = event.detail.value
	},

	//修改结束日期
	handleDateEndChanged: function (event) {
		this.props.store.dateEnd = event.detail.value
	},

	//添加时间段
	handlePickTime: function (event) {
		let timeBlock = new timeBlockStore(event.detail.value)
		this.props.store.timeBlocks.push(timeBlock)
	},

	//修改开始时间
	handleStartTimeChange: function (event) {
		let start = event.detail.value
		let index = event.currentTarget.dataset.timeBlockIndex
		this.props.store.timeBlocks[index].start = start
	},

	//修改结束时间
	handleEndTimeChange: function (event) {
		let end = event.detail.value
		let index = event.currentTarget.dataset.timeBlockIndex
		this.props.store.timeBlocks[index].end = end
	},

	//长按时间段
	handleLongPressTimeBlock: function (event) {
		let index = event.currentTarget.dataset.timeBlockIndex
		let timeBlock = this.props.store.timeBlocks[index]
		let _this = this;
		wx.showModal({
			title: '删除时间段',
			content: '确定删除 ' + timeBlock.start + " -- " + timeBlock.end + " 吗？",
			confirmText: "删除",
			confirmColor: '#FF0000',
			cancelText: "取消",
			success: function (res) {
				if (res.confirm) {
					_this.props.store.timeBlocks.splice(index, 1)
				}
			}
		});
	},


	//点击生成列表按钮
	handleOKBtnTap: function () {
		let count = moment.duration(moment(this.props.store.dateEnd) - moment(this.props.store.dateStart)).asDays()
		let schedule = new scheduleStore(this.props.store.title, this.props.store.description, this.props.store.dateStart, this.props.store.dateEnd)
		schedule.maxApplyQuantity = this.props.store.maxApplyQuantity
		for (let i = 0; i <= count; i++) {
			let date = moment(this.props.store.dateStart).add(i, 'd').format('YYYY-MM-DD')
			let dateAndTime = new dateAndTimeStore(date)
			this.props.store.getObservableTimeBlocks().forEach((tb) => dateAndTime.timeBlocks.push(tb))
			schedule.dateAndTimes.push(dateAndTime)
		}
		app.schedule = schedule
		wx.redirectTo({
			url: '../preview/preview?action=new',
		})
	},


	//返回
	handleBackBtnTap() {
		wx.navigateBack({
			delta: 1,
		})
	},

	//修改最大报名数
	handleZanQuantityChange(event) {
		const quantity = event.quantity
		this.setData({
			'quantityItem.quantity': quantity
		})
		this.props.store.maxApplyQuantity = quantity
	}
})))