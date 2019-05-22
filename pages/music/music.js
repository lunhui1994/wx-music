// pages/music/music.js
const uitl = require("../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //nav
    TabCur: 1,
    scrollLeft: 0,
    //当前播放歌曲信息
    songData: {
      id: "0039MnYb0qxYhV",
      lrc: "https://api.bzqll.com/music/tencent/lrc?id=0039MnYb0qxYhV&key=579621905",
      lrcContext: "",
      name: "晴天",
      pic: "https://api.bzqll.com/music/tencent/pic?id=0039MnYb0qxYhV&key=579621905",
      singer: "周杰伦",
      time: 269,
      url: "https://api.bzqll.com/music/tencent/url?id=0039MnYb0qxYhV&key=579621905",
      index: 0
    },
    // 加载框
    loadModal: false,

    innerAudioContext: null,
    backgroundAudioManager: null,
    urlList: ["https://api.bzqll.com/music/tencent/url?id=0039MnYb0qxYhV&key=579621905"],
    audioPlayT: "播放",
    audioPauseT: "暂停",
    currentTime: 0, //当前播放时间点
    currentTimeText: "00:00", //歌曲时长格式
    duration: 0, //歌曲时长
    isplay: false, //是否在播放
    playType: 'single', //播放模式：single 单曲循环/

    // typePickerName: ['歌名', '专辑', '歌单', 'MV', '用户', '歌词'], // 搜索种类名称
    // typePicker: ['song', 'album', 'list', 'mv', 'user', 'lrc'], // 搜索种类

    multiArray: [
      ['QQ音乐'], //['QQ音乐', '网易云', '酷狗']
      ['歌名'] //['歌名', '专辑', '歌单', 'MV', '用户', '歌词']
    ],
    multiIndex: [0, 0],
    searchData: {
      'musicName': '',
      type: "song",
      source: "tencent"
    }, //搜索信息
    songList: [], // 歌曲列表 top100
    searchList: [], //搜索列表 前100
    jayList: [], //jaychou 60
    poster: 'https://api.bzqll.com/music/tencent/pic?id=0039MnYb0qxYhV&key=579621905' //封面图
  },
  PickerChange(e) {
    let that = this;
    this.setData({
      index: e.detail.value
    })
  },
  // 歌曲条件
  MultiChange(e) {
    let that = this;
    this.setData({
      multiIndex: e.detail.value
    })
  },
  //歌曲条件选择多选事件
  MultiColumnChange(e) {
    let that = this;
    console.log(e.detail);
    let data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    let source = "tencent";
    let type = "song";
    data.multiIndex[e.detail.column] = e.detail.value;
    switch (e.detail.column) {
      case 0:
        switch (data.multiIndex[0]) {
          case 0:
            data.multiArray[1] = ['歌名']; //['歌名', '专辑', '歌单', 'MV', '用户', '歌词']
            source = 'tencent';
            break;
          case 1:
            data.multiArray[1] = ['歌名']; //['歌名', '专辑', '歌单', 'MV', '用户', '歌词', '歌手', '电台']
            source = 'netease';
            break;
        }
        data.multiIndex[1] = 0;
        break;
      case 1:
        switch (data.multiIndex[1]) {
          case 0:
            type = "song";
            break;
          case 1:
            type = "album";
            break;
          case 2:
            type = "list";
            break;
          case 3:
            type = "mv";
            break;
          case 4:
            type = "user";
            break;
          case 5:
              type = "lrc";
            break;
        }
        break;
    }
    that.setData({
      'searchData.source': source,
      'searchData.type': type
    });
    that.setData(data);
  },
  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60
    })
  }, //nav事件
  jaySwicth(e) {
    let that = this;
    if (e.detail.value) {
      that.setData({
        playType: 'jaychou'
      })
      let data = that.data.jayList[0];
      that.setData({
        songData: data
      })
      singlePlay(that, {
        music: data
      });
    } else {
      that.setData({
        playType: 'single'
      })
    }
  },
  onAudioPlay: function() {
    this.data.backgroundAudioManager.play();
    this.setData({
      isplay: false
    })
  },
  onAudioPause: function() {
    this.data.backgroundAudioManager.pause();
    this.setData({
      isplay: true
    })
  },
  changeTime: function(e) {
    this.data.backgroundAudioManager.seek(Math.floor(e.detail.value));
    this.data.backgroundAudioManager.play();
    this.setData({
      isplay: false
    })
  },
  changingT: function(e) {
    this.data.backgroundAudioManager.pause();
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
  searchMusic: function() {
    let that = this;
    that.setData({
      loadModal: true
    })
    let param = {
      key: 579621905,
      limit: 100,
      offset: 0,
      type: that.data.searchData.type,
      s: that.data.searchData.musicName
    }
    let url = "https://api.bzqll.com/music/" + that.data.searchData.source +"/search" + uitl.json2str(param);
    // https://api.bzqll.com/music/tencent/search?key=579621905&s=123&limit=100&offset=0&type=song
    wx.request({
      url: url,
      header: {
        "Content-Type": "application/json"
      },
      success: function(res) {
        let list = res.data.data;
        for (let i = 0; i < list.length; i++) {
          list[i].index = i;
          list[i].lrcContext = '';
        }
        that.setData({
          searchList: list,
          loadModal: false //搜索结果框
        })
      }
    })
  },
  // 搜索出来的歌点播
  searchSinglePlay: function(event) {
    let data = event.currentTarget.dataset;
    let that = this;
    singlePlay(that, data);
    getLrc(that, that.data.songData.lrc);
  },
  //周董歌曲点播
  jaySinglePlay: function(event) {
    let data = event.currentTarget.dataset;
    let that = this;
    singlePlay(that, data);
    getLrc(that, that.data.songData.lrc);
  },
  // 排行榜歌曲点播
  flagMusicPlay: function(event) {
    let that = this;
    let musicData = event.currentTarget.dataset.music.data;
    that.initPlay(musicData)
  },
  // 初始化播放
  initPlay: function(musicData) {
    // 通过歌曲信息获取歌曲播放地址和poster地址。
    // 必要信息：songmid， filename
    var that = this;

    // 描述 musicData.albumdesc
    // 名字 musicData.songname
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
    // https://api.bzqll.com/music/tencent/url?key=579621905&id=001fXNWa3t8EQQ&br=192

    var songurl = 'https://api.bzqll.com/music/tencent/url?key=579621905&id=' + songmid + '&br=192';
    that.setData({
      urlList: [songurl],
      isplay: true,
      currentTime: 0,
      currentTimeText: "00:00",
      songData: {
        id: songmid,
        lrc: "https://api.bzqll.com/music/tencent/lrc?key=579621905&id=" + songmid,
        name: musicData.songname,
        pic: "https://api.bzqll.com/music/tencent/pic?key=579621905&id=" + songmid,
        singer: musicData.singer[0].name,
        time: musicData.interval,
        url: songurl
      },
    })

    // that.data.backgroundAudioManager.destroy();
    audioBackInit(that, that.data.songData.url);
    that.onAudioPlay();
    getLrc(that, that.data.songData.lrc);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    var that = this;
    //初始化播放
    audioBackInit(that, that.data.songData.url);
    getLrc(that, that.data.songData.lrc); //获取歌词
    getQMusic(that); // 获取排行榜
    getQjayChou(that); // 获取周董歌曲列表
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }

})


// 初始化音频组件 this ，歌曲地址
const audioInit = (that, url) => {
  that.data.innerAudioContext = wx.createInnerAudioContext();
  that.data.innerAudioContext.src = url;
  that.data.innerAudioContext.autoplay = false

  that.data.innerAudioContext.onCanplay(() => {
    that.data.innerAudioContext.duration;
    setTimeout(() => {
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
    } else if (that.data.playType === 'jaychou') {
      let index = that.data.songData.index;
      that.setData({
        songData: that.data.jayList[index + 1],
        urlList: [that.data.songData.url],
        poster: that.data.songData.pic,
        isplay: true,
        currentTime: 0,
        currentTimeText: "00:00"
      })
      that.data.innerAudioContext.destroy();
      audioInit(that, that.data.songData.url);
      that.onAudioPlay();
    } else {
      that.data.innerAudioContext.destroy();
    }
  })
  that.data.innerAudioContext.onError((res) => {
    that.data.innerAudioContext.destroy()
  })
}


// 背景播放 初始化音频组件 this ，歌曲地址
const audioBackInit = (that, url) => {
  that.data.backgroundAudioManager = wx.getBackgroundAudioManager();
  // id: "0039MnYb0qxYhV",
  // lrc: "https://api.bzqll.com/music/tencent/lrc?id=0039MnYb0qxYhV&key=579621905",
  // lrcContext: "",
  // name: "晴天",
  // pic: "https://api.bzqll.com/music/tencent/pic?id=0039MnYb0qxYhV&key=579621905",
  // singer: "周杰伦",
  // time: 269,
  // url: "https://api.bzqll.com/music/tencent/url?id=0039MnYb0qxYhV&key=579621905",
  // index: 0
  that.data.backgroundAudioManager.src = url;
  that.data.backgroundAudioManager.title = that.data.songData.name;
  that.data.backgroundAudioManager.coverImgUrl = that.data.songData.pic;
  that.data.backgroundAudioManager.singer = that.data.songData.singer;
  that.data.backgroundAudioManager.title = that.data.songData.name;
  that.data.backgroundAudioManager.title = that.data.songData.name;
  // that.data.backgroundAudioManager.autoplay = false

  that.data.backgroundAudioManager.onCanplay(() => {
    // that.data.backgroundAudioManager.duration;
    setTimeout(() => {
      that.setData({
        duration: Math.floor(that.data.backgroundAudioManager.duration)
      })
    }, 300)
  })
  that.data.backgroundAudioManager.onPlay(() => {

  })
  that.data.backgroundAudioManager.onStop(() => {
    console.log('i am onStop')
    that.data.backgroundAudioManager.stop()
    //播放停止，销毁该实例
  })
  that.data.backgroundAudioManager.onTimeUpdate(() => {
    // if (!that.data.duration) {
    //   that.setData({
    //     duration: Math.floor(that.data.backgroundAudioManager.duration)
    //   })
    // }
    if ((Math.floor(that.data.backgroundAudioManager.currentTime) - that.data.currentTime) > 0.5 | (Math.floor(that.data.backgroundAudioManager.currentTime) - that.data.currentTime) < 0.5) {
      that.setData({
        currentTime: that.data.backgroundAudioManager.currentTime,
        currentTimeText: uitl.sTt(that.data.backgroundAudioManager.currentTime)
      })
    }
  })
  that.data.backgroundAudioManager.onEnded(() => {
    console.log('i am onEnded')
    //播放结束，销毁该实例
    if (that.data.playType === 'single') {
      that.data.backgroundAudioManager.seek(0);
      that.data.backgroundAudioManager.play();
    } else if (that.data.playType === 'jaychou') {
      let index = that.data.songData.index;
      that.setData({
        songData: that.data.jayList[index + 1],
        urlList: [that.data.songData.url],
        poster: that.data.songData.pic,
        isplay: true,
        currentTime: 0,
        currentTimeText: "00:00"
      })
      audioBackInit(that, that.data.songData.url);
      that.onAudioPlay();
    }
  })
  that.data.backgroundAudioManager.onError((res) => {

  })
}



//获取qq音乐top100榜单
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
    }
  })
}

const getQjayChou = (that) => {
  wx.request({
    url: "https://api.bzqll.com/music/tencent/search?key=579621905&s='周杰伦'&limit=100&offset=0&type=song",
    header: {
      "Content-Type": "application/json"
    },
    success: function(res) {
      let list = res.data.data;
      for (let i = 0; i < list.length; i++) {
        list[i].index = i;
        list[i].lrcContext = '';
      }
      that.setData({
        jayList: list
      })
    }
  })
}
// data : music
const singlePlay = (that, data) => {
  let musicData = data.music;
  that.setData({
    songData: {
      id: musicData.id,
      lrc: musicData.lrc,
      lrcContext: "",
      name: musicData.name,
      pic: musicData.pic,
      singer: musicData.singer,
      time: musicData.time,
      url: musicData.url,
      index: musicData.index
    }
  })
  that.setData({
    urlList: [musicData.url],
    poster: musicData.pic,
    isplay: true,
    currentTime: 0,
    currentTimeText: "00:00"
  })
  // that.data.innerAudioContext.destroy();
  audioBackInit(that, that.data.songData.url);
  that.onAudioPlay();
}

const getLrc = (that, url) => {
  // 获取歌词接口
  wx.request({
    url: url,
    header: {
      'Content-Type': 'text/plain'
    },
    success: function(res) {
      that.setData({
        "songData.lrcContext": res.data.replace(/↵/g, "\n")
      })
    }
  })
}