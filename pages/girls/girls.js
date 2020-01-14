// pages/meizi/meizi.js
const uitl = require("../../utils/util.js");
const service = require("../../module/service.js");
Page({

  /** 
   * 页面的初始数据
   */
  data: {
    items: [],
    hidden: false,
    myPage: 1
  },
  getGirls: function(targetPage) {
    let that = this;
    service.getGirls({
      targetPage: targetPage
    }, function(res) {
      console.log(res);
      res = res.data;
      if (res == null ||
        res.data == null ||
        res.data.results == null ||
        res.data.results.length <= 0) {
        that.setData({
          hidden: true
        });
        wx.showToast({
          title: Constant.DATA_IS_NULL,
          icon: 'success',
          duration: 2000
        })
        console.error(Constant.DATA_IS_NULL);
        return;
      }
      var list = [];
      var time = "";
      var src = "";
      for (var i = 0; i < res.data.results.length; i++) {
        time = res.data.results[i].publishedAt.split("T")[0];
        src = res.data.results[i].url;
        list.push({
          src: src,
          time: time
        });
      }
      that.setData({
        items: list,
        hidden: true
      });
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // console.log("longtime加载了");
    var that = this;
    that.data.myPage++;
    that.getGirls(that.data.myPage);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    // console.log("longtime初次渲染完成了");
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // console.log("longtime显示了");
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    // console.log("longtime隐藏了");
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    // console.log("卸载");
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
   
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    // console.log("触底了");
    var that = this;
    that.data.myPage++;
    that.setData({
      hidden: false
    });
    that.getGirls(that.data.myPage);
    wx.stopPullDownRefresh()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  upper: function() {

  },

  lower: function() {

  },

  scroll: function() {

  }
})