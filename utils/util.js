const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function sTt(s) {
  var minute = padding(Math.floor(s / 60), 2, '0');
  var second = padding(Math.floor(s % 60), 2, '0');
  return [minute, second].join(':');
}

function padding(number, length, prefix) {
  if (String(number).length >= length) {
    return String(number);
  }
  return padding(prefix + number, length, prefix);
}
module.exports = {
  formatTime: formatTime,
  sTt: sTt,
  padding: padding
}

