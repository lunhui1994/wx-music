// pages/meizi/meizi.js
const uitl = require("../../utils/util.js");
const api_welfare = uitl.interface.welfare; // kugou migu netease
Page({

  /** 
   * 页面的初始数据
   */
  data: {
    items: [],
    hidden: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log("longtime加载了");
    var that = this;
    myPage++;
    console.log(myPage);
    findMeiZhi(that, myPage);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // console.log("longtime初次渲染完成了");
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // console.log("longtime显示了");
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    // console.log("longtime隐藏了");
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // console.log("卸载");
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
      var that = this;
      ++myPage;
      that.setData({
        hidden: false
      });
      findMeiZhi(that, myPage);
      wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // console.log("触底了");
  },
  
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  upper:function() {
  
  },

  lower:function(){

  },
  
  scroll: function() {

  }
})
var myPage = 1;

function findMeiZhi(that, targetPage) {
    // var BASE_URL= "http://gank.io/api/";
    // var BASE_URL = "https://www.zsfmyz.top:8080/api/";
    // var MEIZHI_URL = BASE_URL.concat("data/福利/50/");
  wx.request({
    url: api_welfare + "list?per_page=30&page=" + targetPage, //手动用encodeURI对url进行转码，小程序不自动转码
    header: {
      // "Content-Type": "application/json"
    },
    success: function (res) {
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
        // console.log(src);
        list.push({ src: src, time: time });
      }

      that.setData({
        items: list,
        hidden: true
      });
    },
    error: function (err) {
      console.log(err);
    }
  });
}