export function calcTimeDiff(startTime, endTime) {
  const start = new Date()
  const end = new Date()

  // 将时间字符串转换为 Date 对象
  const [startHour, startMinute] = startTime.split(':')
  const [endHour, endMinute] = endTime.split(':')

  start.setHours(startHour, startMinute, 0)
  end.setHours(endHour, endMinute, 0)

  // 计算时间间隔（毫秒为单位）
  const timeDiff = end.getTime() - start.getTime()

  // 将毫秒转换为小时和分钟
  const hours = Math.floor(timeDiff / (1000 * 60 * 60))
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))

  return {
    hours,
    minutes,
  }
}
