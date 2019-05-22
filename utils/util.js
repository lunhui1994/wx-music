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

function json2str(json) {
  var str = '';
  var num = 0;
  for (var k in json) {
    if ((typeof json[k] === 'string' && json[k])
      || (typeof json[k] === 'boolean')
      || (typeof json[k] === 'number' && json[k] >= 0)) {
      str += (num == 0 ? '' : '&') + k + '=' + json[k];
      num++;
    }
  }
  num && (str = '?' + str);
  return str;
}

const _Api = {
  music: 'https://v1.itooi.cn/'
}

const _Interface = {
  tencent: _Api.music + 'tencent/'
}

let fn = {
  formatTime: formatTime,
  sTt: sTt,
  padding: padding,
  json2str: json2str,
  api: _Api,
  interface: _Interface
}

module.exports = fn;

