// pages/music/music.js
const uitl = require("../../utils/util.js");
const Lyric = require('../../miniprogram_npm/lyric-parser/index.js');
const api_music = uitl.interface.tencent; // kugou migu netease
Page({
  /**
   * 页面的初始数据
   */
  data: {
    TabCur: 1, //nav
    scrollLeft: 0,
    //当前播放歌曲信息
    songData: {
      id: "0039MnYb0qxYhV",
      // lrc: api_music + "lrc?id=0039MnYb0qxYhV&key=579621905",
      lrcContext: "",
      name: "我是如此相信",
      pic: "http://imgcache.qq.com/music/photo/album_300/a9/300_albumpic_9612009_0.jpg",
      singer: "周杰伦",
      time: 269,
      url: api_music + "url?id=0039MnYb0qxYhV&key=579621905",
      index: 0
    },
    // 加载框
    loadModal: false, //搜索加载框
    innerAudioContext: null,
    backgroundAudioManager: null,
    urlList: [api_music + "url?id=0039MnYb0qxYhV&key=579621905"], //播放列表
    audioPlayT: "播放",
    audioPauseT: "暂停",
    currentTime: 0, //当前播放时间点
    currentTimeText: "00:00", //歌曲时长格式
    duration: 0, //歌曲时长
    isplay: false, //是否在播放
    playType: 'single', //播放模式：single 单曲循环/
    multiArray: [
      ['QQ音乐'], //['QQ音乐', '网易云', '酷狗']
      ['歌名'] //['歌名', '专辑', '歌单', 'MV', '用户', '歌词']
    ],
    multiIndex: [0, 0],
    searchData: {
      musicName: '',
      type: "song",
      source: "tencent"
    }, //搜索信息
    songList: [], // 歌曲列表 top100
    searchList: [], //搜索列表 前100
    jayList: [], //jaychou 前60
    poster: "http://imgcache.qq.com/music/photo/album_300/9/300_albumpic_9612009_0.jpg", //封面图
    currentLyric: null,
    currentLineNum: 0
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
  onAudioPlay: function() { // 播放
    let that = this;
    that.data.backgroundAudioManager.play();
    that.setData({
      isplay: true
    })
  },
  onAudioPause: function() { // 暂停
    let that = this;
    that.data.backgroundAudioManager.pause();
    that.setData({
      isplay: false
    })
  },
  changeTime: function(e) { // seek时间
    let that = this;
    that.data.backgroundAudioManager.seek(Math.floor(e.detail.value));
    that.data.backgroundAudioManager.play();
    that.setData({
      isplay: true
    })
  },
  searchNameFn: function(event) {
    let that = this;
    that.setData({
      'searchData.musicName': event.detail.value
    })
  },
  searchMusic: function() { //搜索音乐 fn
    let that = this;
    that.setData({
      loadModal: true
    })
    let param = {
      n: 30,
      p: 1,
      w: that.data.searchData.musicName
    }
    let url = api_music +"list" + uitl.json2str(param);
    wx.request({
      url: url,
      method: 'GET',
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8;"
      },
      success: function(res) {
        let list = res.data.data.list;
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

  //歌曲点播
  getSinglePlay: function(event) {
    let data = event.currentTarget.dataset;
    let that = this;
    wx.request({
      url: api_music + "song?songmid=" + data.music.songmid + "&guid=126548448&lyric=1",
      method: 'GET',
      header: {
        "Content-Type": "application/json;charset=utf-8;"
      },
      success: function (res) {
        data.music.url = res.data.data.musicUrl;
        data.music.lrcContext = res.data.data.lyric;
        singlePlay(that, data);
      }
    })
  },
  //歌词handler
  handleLyric: function ({lineNum, txt}) {
    let that = this;
    that.setData({
        currentLineNum: lineNum,
        playingLyric: txt
      })
    // if (lineNum > 5) {
    //   let lineEl = this.$refs.lyricLine[lineNum - 5]
    //   this.$refs.lyricList.scrollToElement(lineEl, 1000)// 滚动到元素
    // } else {
    //   this.$refs.lyricList.scrollTo(0, 0, 1000)// 滚动到顶部
    // }
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
    getQMusic(that); // 获取排行榜
    getQjayChou(that); // 获取周董歌曲列表
  },
})

// 背景播放 初始化音频组件 this ，歌曲地址
const audioBackInit = (that, url) => {
  that.data.backgroundAudioManager = wx.getBackgroundAudioManager();
  // id: "0039MnYb0qxYhV",
  // lrc: "https://v1.itooi.cn/music/tencent/lrc?id=0039MnYb0qxYhV&key=579621905",
  // lrcContext: "",
  // name: "晴天",
  // pic: "https://v1.itooi.cn/music/tencent/pic?id=0039MnYb0qxYhV&key=579621905",
  // singer: "周杰伦",
  // time: 269,
  // url: "https://v1.itooi.cn/music/tencent/url?id=0039MnYb0qxYhV&key=579621905",
  // index: 0
  that.data.backgroundAudioManager.src = url;
  that.data.backgroundAudioManager.coverImgUrl = that.data.songData.pic;
  that.data.backgroundAudioManager.singer = that.data.songData.singer;
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
    if ((Math.floor(that.data.backgroundAudioManager.currentTime) - that.data.currentTime) > 0.5 || (Math.floor(that.data.backgroundAudioManager.currentTime) - that.data.currentTime) < 0.5) {
      that.setData({
        currentTime: that.data.backgroundAudioManager.currentTime,
        currentTimeText: uitl.sTt(that.data.backgroundAudioManager.currentTime)
      })
      // 歌词同步
      that.data.currentLyric.seek(that.data.backgroundAudioManager.currentTime * 1000);
    }
  })
  that.data.backgroundAudioManager.onEnded(() => {
    console.log('i am onEnded')
    //播放结束，销毁该实例
    if (that.data.playType === 'single') {
      // that.data.backgroundAudioManager.seek(0);
      // that.data.backgroundAudioManager.play();
      audioBackInit(that, that.data.songData.url);
      that.onAudioPlay();
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

// 获取qq音乐top100榜单
const getQMusic = (that) => {
  wx.request({
    url: api_music + 'top',
    header: {
      "Content-Type": "application/json;charset=utf-8;"
    },
    success: function (res) {
      let list = res.data.data.list;
      for (let i = 0; i < list.length; i++) {
        list[i].index = i;
        list[i].lrcContext = '';
      }
      that.setData({
        songList: list
      })
    }
  })
}
// 获取周杰伦歌曲列表
const getQjayChou = (that) => {
  wx.request({
    url: api_music + "list?w='周杰伦'&n=30&p=1",
    header: {
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8;"
    },
    success: function(res) {
      let list = res.data.data.list;
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
// 点播
const singlePlay = (that, data) => {
  that.setData({
    songData: {
      id: data.music.songmid,
      lrcContext: data.music.lrcContext,
      name: data.music.songname,
      pic: data.music.albumimg,
      singer: data.music.singer.name,
      // time: data.music.time,
      url: data.music.url,
      index: data.music.index
    }
  })
  that.setData({
    urlList: [data.music.url],
    poster: data.music.albumimg,
    isplay: true,
    currentTime: 0,
    currentTimeText: "00:00"
  })
  // that.data.innerAudioContext.destroy();
  audioBackInit(that, that.data.songData.url);
  lyricInit(that, that.data);
  that.onAudioPlay();
}
// 歌词初始化
const lyricInit = (that, data)=>{
  if (that.data.currentLyric != null) {
    // 清除字幕定时器
    // clearTimeout(that.data.currentLyric.timer);
    // that.data.currentLyric.stop()
  };
  let lyric = data.songData.lrcContext //歌词数据
  that.data.currentLyric = new Lyric(lyric, that.handleLyric) //this.handleLyric回调函数
  // that.data.currentLyric.play(); //字幕播放
}