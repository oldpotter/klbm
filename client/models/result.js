class Result {
	constructor(
		type,//sucess or fail
		title,
		desciption,
		primaryBtnTitle,
		primaryHandler,
		defaultBtnTitle,
		defaultHandler) {
		this.type = type
		this.title = title
		this.description = desciption
		this.primaryBtnTitle = primaryBtnTitle
		this.primaryHandler = primaryHandler
		this.defaultBtnTitle = defaultBtnTitle
		this.defaultHandler = defaultHandler
	}
}

module.exports = Result