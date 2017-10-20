const observer = require('../../plugins/observer').observer
const extendObservable = require('../../plugins/mobx').extendObservable
const util = require('../../utils/forpromise')
const config = require('../../config')
const Zan = require('../../plugins/zanui-weapp/dist/index')

const STATE_CODES = {
	LOGIN_SUCCESS: 1001,
	LOGIN_FAIL: -1001
}

let Store = function () {
	extendObservable(this, {
		userName: '',
		password: '',
		get isValid() {
			return this.userName.trim() != '' && this.password.trim() != ''
		}
	})
}

Page(Object.assign({}, Zan.TopTips, observer({
	props: {
		store: new Store()
	},

	onShow(){
		this.props.store.userName = ''
		this.props.store.password = ''
	},

	//用户名输入
	handleUserNameInput(event) {
		this.props.store.userName = event.detail.value
	},

	//密码输入
	handlePasswordInput(event) {
		this.props.store.password = event.detail.value
	},

	//登录
	login() {
		const _this = this
		const user = {
			userName: this.props.store.userName,
			password: this.props.store.password
		}
		util.pLoading('正在登录')
			.then(() => util.pRequest(config.service.adminLoginUrl, user, 'POST'))
			.then(res => {
				wx.hideLoading()
				const code = res.data.code
				if (code == STATE_CODES.LOGIN_SUCCESS) {
					wx.redirectTo({
						url: '../index/index',
					})
				} else if (code == STATE_CODES.LOGIN_FAIL) {
					_this.showZanTopTips('用户名或密码错误')
				}
			})
			.catch(err => {
				wx.hideLoading()
				_this.showZanTopTips(`登录失败:${err}`);
			})
	}
})))

