const uitl = require("../utils/util.js");
const api_music = uitl.interface.tencent; // kugou migu netease
const api_welfare = uitl.interface.welfare; // kugou migu netease

let service = {
  getSongurl: (data, callback) => {
    wx.request({
      url: api_music + "song?songmid=" + data.songmid + "&guid=126548448&lyric=1",
      method: 'GET',
      header: {
        "Content-Type": "application/json;charset=utf-8;"
      },
      success: callback
    })
  },
  // 获取qq音乐top100榜单
  getQMusic: (callback) => {
    wx.request({
      url: api_music + 'top',
      header: {
        "Content-Type": "application/json;charset=utf-8;"
      },
      success: callback
    })
  },
  // 获取周杰伦歌曲列表
  getQjayChou: (callback) => {
    wx.request({
      url: api_music + "list?w='周杰伦'&n=30&p=1",
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8;"
      },
      success: callback
    })
  },
// 搜索
  getSearchMusic: (data, callback) => {
    wx.request({
      url: data.url,
      method: 'GET',
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8;"
      },
      success: callback
    })
  },


  // 图片列表
  getGirls: (data, callback) => {
    wx.request({
      url: api_welfare + "list?per_page=30&page=" + data.targetPage, //手动用encodeURI对url进行转码，小程序不自动转码
      success: callback
    });
  }
}

module.exports = service;