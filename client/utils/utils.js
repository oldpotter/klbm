const parseSchedules = function (data) {
	return data.map(obj => {
		obj.detail = JSON.parse(obj.detail)
		obj.detail.id = obj.id
		return obj.detail
	})
}

module.exports = {
	parseSchedules: parseSchedules
}