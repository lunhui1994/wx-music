// pages/music/music.js
const uitl = require("../../utils/util.js")
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    innerAudioContext: null,
    urlList: ["http://ws.stream.qqmusic.qq.com/C400000btw1z1NPZtB.m4a?fromtag=64&guid=126548448&vkey=9AA464B102331F31FE02DB9D5AE1F68885F326FB3A8039160AEF75AD41209F168BA38EF200E67624B7C5B34BE40F178972E01234F7B46823","http://ws.stream.qqmusic.qq.com/M500001VfvsJ21xFqb.mp3?guid=ffffffff82def4af4b12b3cd9337d5e7&uin=346897220&vkey=6292F51E1E384E061FF02C31F716658E5C81F5594D561F2E88B854E81CAAB7806D5E4F103E55D33C16F3FAC506D1AB172DE8600B37E43FAD&fromtag=46"],
    audioPlayT: "播放",
    audioPauseT: "暂停",
    currentTime: 0,
    currentTimeText: "00:00",
    duration: 0,
    isplay: true,
    playType: 'single',
    searchData: {
      'musicName': ''
    },
    songList: [],
    searchList: [],
    poster: 'https://ws1.sinaimg.cn/large/610dc034ly1fhgsi7mqa9j20ku0kuh1r.jpg'
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
  },
  onAudioPlay: function () {
    this.data.innerAudioContext.play();
    this.setData({
      isplay: false
    })
  },
  onAudioPause: function () {
    this.data.innerAudioContext.pause();
    this.setData({
      isplay: true
    })
  },
  changeTime: function (e) {
    this.data.innerAudioContext.seek(Math.floor(e.detail.value));
    this.data.innerAudioContext.play();
    this.setData({
      isplay: false
    })
  },
  changingT: function (e) {
    this.data.innerAudioContext.pause();
    this.setData({
      isplay: true
    })
  },
  searchNameFn: function(event) {
    let that = this;
    that.setData({
      'searchData.musicName': event.detail.value
    })
  },
  searchMusic: function () {
    let that = this;
    let param = {
      key: 579621905,
      limit: 100,
      offset: 0,
      type: 'song',
      s: that.data.searchData.musicName
    }
    let url = "https://api.bzqll.com/music/tencent/search" + uitl.json2str(param);
    // https://api.bzqll.com/music/tencent/search?key=579621905&s=123&limit=100&offset=0&type=song
    wx.request({
      url: url,
      header: {
        "Content-Type": "application/json"
      },
      success: function(res) {
        that.setData({
          searchList: res.data.data
        })

      }
    })
  },
  // 搜索出来的歌点播
  searchSinglePlay: function (event) {
    let that = this;
    let musicData = event.currentTarget.dataset.music;
    
    that.setData({
      urlList: [musicData.url],
      poster: musicData.pic,
      isplay: true,
      currentTime: 0,
      currentTimeText: "00:00"
    })
    that.data.innerAudioContext.destroy();
    audioInit(that, that.data.urlList[0]);
    that.onAudioPlay();
  },
  flagMusicPlay: function (event) {
    let that = this;  
    let musicData = event.currentTarget.dataset.music.data;
    that.initPlay(musicData)
  },
  initPlay: function (musicData) {
    // 通过歌曲信息获取歌曲播放地址和poster地址。
    // 必要信息：songmid， filename
    var that = this;
    
    // 描述 musicData.albumdesc
    // 名字 musicData.albumname
    // id musicData.albumid
    var id = musicData.albumid;

    // poster url "http://imgcache.qq.com/music/photo/album_300/" + id%100 + "/300_albumpic_" + id + "_0.jpg"
    // 封面
    that.setData({
      poster: "https://imgcache.qq.com/music/photo/album_300/" + (id % 100) + "/300_albumpic_" + id + "_0.jpg"
    })
    
    // songmid musicData.songmid
    var songmid = musicData.songmid;
    var filename = 'C400' + songmid + '.m4a'

    wx.request({
      url: 'https://c.y.qq.com/base/fcgi-bin/fcg_music_express_mobile3.fcg?format=json205361747&platform=yqq&cid=205361747&songmid=' + songmid + '&filename=' + filename + '&guid=126548448',
      header: {
        "Content-Type": "application/json"
      },
      success: function (res) {
        var vkey = res.data.data.items[0].vkey;
        var songurl = 'https://ws.stream.qqmusic.qq.com/' + filename + '?fromtag=64&guid=126548448&vkey=' + vkey;
        that.setData({
          urlList: [songurl],
          isplay: true,
          currentTime: 0,
          currentTimeText: "00:00"
        })
        that.data.innerAudioContext.destroy();
        audioInit(that, that.data.urlList[0]);
        that.onAudioPlay();
      }
    })
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    //初始化播放
    audioInit(that, that.data.urlList[0]);
    getQMusic(that);
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


const audioInit = (that, url)=> {
  that.data.innerAudioContext = wx.createInnerAudioContext();
  that.data.innerAudioContext.src = url;
  that.data.innerAudioContext.autoplay = false
  
  that.data.innerAudioContext.onCanplay(() => {
    that.data.innerAudioContext.duration;
    setTimeout(()=> {
      that.setData({
        duration: Math.floor(that.data.innerAudioContext.duration)
      })
    }, 300)
  })
  that.data.innerAudioContext.onPlay(() => { 
    
  })
  that.data.innerAudioContext.onStop(() => {
    console.log('i am onStop')
    that.data.innerAudioContext.stop()
    //播放停止，销毁该实例
    that.data.innerAudioContext.destroy()
  })
  that.data.innerAudioContext.onTimeUpdate(() => {
    // if (!that.data.duration) {
    //   that.setData({
    //     duration: Math.floor(that.data.innerAudioContext.duration)
    //   })
    // }
    if ((Math.floor(that.data.innerAudioContext.currentTime) - that.data.currentTime) > 0.5 | (Math.floor(that.data.innerAudioContext.currentTime) - that.data.currentTime) < 0.5) {
      that.setData({
        currentTime: that.data.innerAudioContext.currentTime,
        currentTimeText: uitl.sTt(that.data.innerAudioContext.currentTime)
      })
    }
  })
  that.data.innerAudioContext.onEnded(() => {
    console.log('i am onEnded')
    //播放结束，销毁该实例
    if (that.data.playType === 'single') {
      that.data.innerAudioContext.seek(0);
      that.data.innerAudioContext.play();
    } else {
      that.data.innerAudioContext.destroy();
    }
  })
  that.data.innerAudioContext.onError((res) => {
    that.data.innerAudioContext.destroy()
  })
}

const getQMusic = (that) => {
  wx.request({
    url: 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg?g_tk=5381&uin=0&format=json&inCharset=utf-8&outCharset=utf-8¬ice=0&platform=h5&needNewCode=1&tpl=3&page=detail&type=top&topid=27&_=1519963122923',
    header: {
      "Content-Type": "application/json"
    },
    success: function(res) {
        that.setData({
          songList: res.data.songlist
        })
      that.initPlay(that.data.songList[0].data)
    }
  })
}

