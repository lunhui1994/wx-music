// pages/lyric/lyric.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    songData: {

    },
    currentLyric: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let app = getApp();
    let that = this;
    that.setData({
      songData: app.globalData.playerData.songData,
      currentLyric: app.globalData.playerData.currentLyric,
      currentLineNum: app.globalData.playerData.currentLineNum,
      playingLyric: app.globalData.playerData.playingLyric,
    })
    console.log(that.data);
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