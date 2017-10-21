
const observer = require('../../plugins/observer').observer
const app = getApp()
const util = require('../../utils/forpromise')
const errors = require('../../utils/errors')
const config = require('../../config')
const Zan = require('../../plugins/zanui-weapp/dist/index')
import { ResultModel } from '../../stores/result_model'
const LoginError = require('../../plugins/wafer2-client-sdk/index').LoginError
import { timeBlockStore, dateAndTimeStore, scheduleStore, userInfoStore } from '../../stores/schedulestore.js'

//错误代码
const ERROR_CODES = {
	OVER_LIMIT: 1000//报名超过限制
}
const sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置


Page(Object.assign({}, Zan.TopTips, observer({

	props: {
		tabs: null,
		activeIndex: 1,
		sliderOffset: 0,
		sliderLeft: 0,
		schedule: null,
		isFromNative: null,//是否从本地进入页面（废弃）
		isOwner: undefined,//是否是计划的创建者
		scheduleId: null,
		checkItems: []
	},

	onLoad(options) {
		this.props.isOwner = options.isOwner
		this.props.isFromNative = options.isFromNative
		this.props.tabs = this.props.isFromNative != true ? ['全部', '可报名', '已报名'] : ['全部', '已报名', '已付款']
		this.props.scheduleId = options.scheduleId
		this.props.schedule = app.schedule

		wx.showShareMenu({
			withShareTicket: true,
		})

		const _this = this;
		wx.getSystemInfo({
			success: function (res) {
				_this.props.sliderLeft = (res.windowWidth / _this.props.tabs.length - sliderWidth) / 2
				_this.props.sliderOffset = res.windowWidth / _this.props.tabs.length * _this.props.activeIndex
			}
		});
	},

	onShow() {
		if (this.props.isFromNative == false) {//从网络进入页
			const _this = this
			if (wx.startPullDownRefresh) {
				wx.startPullDownRefresh({
					success() {
						_this.getSchedule()
					}
				})
			} else {
				_this.getSchedule()
			}
		}
	},

	onHide() {
		app.schedule = this.props.schedule
	},

	//点击nav bar slider
	tabClick: function (e) {
		this.props.sliderOffset = e.currentTarget.offsetLeft
		this.props.activeIndex = e.currentTarget.id
	},

	//选择checkbox
	handleClickCheckbox(event) {
		const _this = this
		let items = event.detail.value.map(str => {//str转obj
			const res = str.split(',')
			return {
				dateAndTimeIndex: res[0],
				timeBlockIndex: res[1]
			}
		})
			.filter(idx => {//过滤已经报名的
				let dateAndTime = _this.props.schedule.dateAndTimes[idx.dateAndTimeIndex]
				let timeBlock = dateAndTime.timeBlocks[idx.timeBlockIndex]
				return timeBlock.userInfo == null
			})

		//遍历所有timeblock
		this.props.checkItems = []
		this.props.schedule.dateAndTimes.forEach((dateAndTime, dateAndTimeIndex) => {
			dateAndTime.timeBlocks
				.forEach((timeBlock, timeBlockIndex) => {
					if (timeBlock.userInfo != null) {//跳过已经报名的
						return
					}
					timeBlock.checked = items.some(idxs => {//把每个timeblock和items里的比较
						return idxs.dateAndTimeIndex == dateAndTimeIndex &&
							idxs.timeBlockIndex == timeBlockIndex
					})
					if (timeBlock.checked) {
						_this.props.checkItems.push({ dateAndTimeIndex, timeBlockIndex })
					}
				})
		})
		//超过最大报名数则清除
		if (this.props.schedule.maxApplyQuantity > 0 && this.props.checkItems.length > this.props.schedule.maxApplyQuantity
		) {
			const idx = items[items.length - 1]
			let dateAndTime = _this.props.schedule.dateAndTimes[idx.dateAndTimeIndex]
			dateAndTime.timeBlocks[idx.timeBlockIndex].checked = false
			_this.props.checkItems.pop()
			this.showTopTips('超过限定报名数量')
		}
	},

	//分享
	onShareAppMessage(options) {
		const _this = this
		return {
			title: `${_this.props.schedule.title}`,
			path: `/pages/form/form?isOwner=0isFromNative=0&scheduleId=${_this.props.schedule.id}`,
			success(res) {
				app.resultModel = new ResultModel(
					'success',
					'分享成功',
					'',
					'',
					'',
					'返回',
					'back'
				)
				wx.navigateTo({
					url: './form_result',
				})
			},
			fail(err) {
				app.resultModel = new ResultModel(
					'fail',
					'分享失败',
					'请检查网络后返回重试',
					'返回',
					'back',
					'',
					''
				)
				wx.navigateTo({
					url: './form_result',
				})
			}
		}
	},


	//报名
	apply() {
		const _this = this
		let err = null
		if (this.props.checkItems.length === 0) {//还未选择新的
			this.showTopTips('你还没有选择时间...')
			return
		}
		//检查网络
		util.pLoading('正在报名...')
			.then(() => util.pLogin())
			.then(userInfo => {//获得到个人信息
				_this.props.userInfo = userInfo
				return userInfo
			})
			.then(userInfo => {//检查是否超过报名限制
				if (_this.props.schedule.maxApplyQuantity > 0) {
					let count = 0
					_this.props.schedule.dateAndTimes.forEach(dateAndTime => {
						dateAndTime.timeBlocks.forEach(timeBlock => {
							if (timeBlock.userInfo && timeBlock.userInfo.openId == userInfo.openId) {
								count++
							}
						})
					})
					if (count >= parseInt(_this.props.schedule.maxApplyQuantity)) {
						throw new Error(ERROR_CODES.OVER_LIMIT)
					}
				}

				return userInfo
			})
			.then(userInfo => {//设置timeblock openid 等
				_this.props.schedule.dateAndTimes.forEach(dateAndTime => {
					dateAndTime.timeBlocks.forEach(timeBlock => {
						if (timeBlock.checked && !timeBlock.userInfo) {
							// console.log('dateAndTime:',dateAndTime)
							timeBlock.userInfo = new userInfoStore()
							timeBlock.userInfo.nickName = userInfo.nickName
							timeBlock.userInfo.avatarUrl = userInfo.avatarUrl
							timeBlock.userInfo.openId = userInfo.openId
						}
					})
				})
			})
			.then(() => util.pRequest(config.service.applyScheduleUrl, { schedule: _this.props.schedule, checkItems: _this.props.checkItems }, 'POST'))//报名
			.then(res => {//修改成功
				_this.props.checkItems = []
				app.resultModel = new ResultModel(
					'success',
					'报名成功',
					'',
					'',
					'',
					'返回',
					'back'
				)
				wx.navigateTo({
					url: './form_result',
				})
				wx.hideLoading()
			})
			.catch(err => {//错误
				let resultModel = new ResultModel()
				resultModel.type = 'fail'
				resultModel.title = '报名失败'
				resultModel.description = '未知错误'
				//登录失败
				if (err instanceof LoginError) {
					resultModel.description = '获取个人信息失败，可能有以下原因:\n1:获取个人信息失败,请打开相关设置\n2:检查网络后返回重试'
					resultModel.primaryBtnTitle = '打开设置页'
					resultModel.primaryHandler = 'showSetting'
					resultModel.defaultBtnTitle = '返回'
					resultModel.defaultHandler = 'back'
				}
				//报名达到限制
				if (err.message == ERROR_CODES.OVER_LIMIT) {
					resultModel.description = '您的账号已经达到报名最大限制'
					resultModel.primaryBtnTitle = ''
					resultModel.primaryHandler = ''
					resultModel.defaultBtnTitle = '返回'
					resultModel.defaultHandler = 'back'
				}
				app.resultModel = resultModel
				wx.navigateTo({
					url: './form_result',
				})

			})

	},

	//显示错误
	showTopTips(err) {
		this.showZanTopTips(err);
	},

	//返回
	goBack() {
		wx.navigateBack({
			delta: 1,
		})
	},

	//获取数据
	getSchedule() {
		const _this = this
		util.pLoading('请稍后...')
			.then(() => util.pRequest(config.service.oneScheduleUrl, { scheduleId: _this.props.scheduleId }, 'POST'))
			.then(res => {
				_this.props.schedule = JSON.parse(res.data.data.detail)
			})
			.then(() => {
				wx.stopPullDownRefresh()
				wx.hideLoading()
			})
			.catch(err => {
				//request fail
				if (err.errMsg == "request:fail ") {
					_this.showTopTips('请检查网络后下拉刷新')
					wx.hideLoading()
					wx.stopPullDownRefresh()
				}
			})


	},

	//点击单元格
	clickCell(event) {
		const dateAndTimeIndex = event.currentTarget.dataset.dateAndTimeIndex
		const timeBlockIndex = event.currentTarget.dataset.timeBlockIndex
		let timeBlock = this.props.schedule.dateAndTimes[dateAndTimeIndex].timeBlocks[timeBlockIndex]
		const options = []
		if (!timeBlock.userInfo) {
			options.push('代为报名')
		} else {
			options.push('设置付款信息')
			options.push('取消报名')
			options.push('交换报名')
		}
		util.pActionSheet(...options)
			.then(res => {
				if (!timeBlock.userInfo) {//代为报名
					if (res.tapIndex === 0) {
						wx.navigateTo({
							url: `./form_input?dateAndTimeIndex=${dateAndTimeIndex}&timeBlockIndex=${timeBlockIndex}`,
						})
					}
				} else {
					if (res.tapIndex === 0) {//设置付款信息
						wx.navigateTo({
							url: `./form_payment?dateAndTimeIndex=${dateAndTimeIndex}&timeBlockIndex=${timeBlockIndex}`,
						})
					} else if (res.tapIndex === 1) {//取消报名
						wx.navigateTo({
							url: `./form_cancel?dateAndTimeIndex=${dateAndTimeIndex}&timeBlockIndex=${timeBlockIndex}`,
						})
					} else if (res.tapIndex === 2) {//交换报名
						wx.navigateTo({
							url: `./form_exchange?dateAndTimeIndex=${dateAndTimeIndex}&timeBlockIndex=${timeBlockIndex}`,

						})
					}
				}
			})
	},

})))