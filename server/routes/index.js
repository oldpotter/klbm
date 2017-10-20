/**
 * ajax 服务路由集合
 */
const router = require('koa-router')({
	prefix: '/weapp'   // 定义所有路由的前缀都已 /weapp 开头
})
const controllers = require('../controllers')

// 从 sdk 中取出中间件
// 这里展示如何使用 Koa 中间件完成登录态的颁发与验证
const { auth: { authorizationMiddleware, validationMiddleware } } = require('../qcloud')

// --- 登录与授权 Demo --- //
// 登录接口 /weapp/login
router.get('/login', authorizationMiddleware, controllers.login)
// 用户信息接口（可以用来验证登录态） /weapp/user
router.get('/user', validationMiddleware, controllers.user)

// --- 图片上传 Demo --- //
// 图片上传接口，小程序端可以直接将 url 填入 wx.uploadFile 中 /weapp/upload
router.post('/upload', controllers.upload)

// --- 信道服务接口 Demo --- //
// GET  用来响应请求信道地址的 /weapp/tunnel
router.get('/tunnel', controllers.tunnel.get)
// POST 用来处理信道传递过来的消息
router.post('/tunnel', controllers.tunnel.post)

// --- 客服消息接口 Demo --- //
// GET  用来响应小程序后台配置时发送的验证请求 /weapp/message
router.get('/message', controllers.message.get)
// POST 用来处理微信转发过来的客服消息
router.post('/message', controllers.message.post)

//测试下数据插入
router.get('/testget', controllers.test.get)
router.post('/testpost', controllers.test.post)
router.post('/get_openId', controllers.test.getOpenId)

//schedule
//传数据的话用post
router.post('/new_schedule', controllers.schedule.add)
router.get('/all_schedules', controllers.schedule.all)
router.post('/edit_schedule', controllers.schedule.edit)
router.post('/remove_schedule', controllers.schedule.remove)
router.post('/one_schedule', controllers.schedule.one)
router.post('/apply_schedule', controllers.schedule.apply)
router.post('/schedules_own', controllers.schedule.allOwn)
router.post('/schedules_join', controllers.schedule.allJoin)

//admin
router.post('/admin_login', controllers.admin.login)

module.exports = router
