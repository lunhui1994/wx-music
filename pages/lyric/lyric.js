// pages/lyric/lyric.js
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    songData: {},
    lyricTimer: null,
    currentLineNum: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
      songData: app.globalData.playerData.songData,
      currentLineNum: app.globalData.playerData.songData.currentLineNum
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that = this;
    that.data.lyricTimer = setInterval(()=>{
      if (that.data.currentLineNum !== that.data.songData.currentLineNum) {
        that.setData({
          currentLineNum: that.data.songData.currentLineNum,
        })
      }
      if (that.data.songData.id !== app.globalData.playerData.songData.id) {
        that.setData({
          songData: app.globalData.playerData.songData,
        })
      }
    }, 500);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})