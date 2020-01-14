// component/player/player.js
const uitl = require("../../utils/util.js");
const Lyric = require('../../miniprogram_npm/lyric-parser/index.js');
const api_music = uitl.interface.tencent; // kugou migu netease
let app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  options: {
    addGlobalClass: true, //继承 app.wxss
  },
  properties: {

  },
  /**
   * 组件的初始数据
   */
  data: {
    that: this,
    backgroundAudioManager: null,
    isplay: true, //是否在播放
    playType: 'loop', //播放模式：single 单曲循环/ loop 列表
    songData: {
      id: '', //"0039MnYb0qxYhV",
      lrcContext: "",
      name: '', //"我是如此相信",
      pic: '', //"http://imgcache.qq.com/music/photo/album_300/a9/300_albumpic_9612009_0.jpg",
      singer: {}, //"周杰伦",
      url: '', //"http://ws.stream.qqmusic.qq.com/C400001PLl3C4gPSCI.m4a?fromtag=0&guid=126548448&vkey=29F971703CF4D78BFEE26925734ED65DD0DBEFD557E83BD837899912003ABAC59B2DC0E73CF81AEBF0F82122B82B302075F7878D0758F696",
      index: 0,
      vkey: '', //"29F971703CF4D78BFEE26925734ED65DD0DBEFD557E83BD837899912003ABAC59B2DC0E73CF81AEBF0F82122B82B302075F7878D0758F696",
      currentLyric: null, // 歌词对象
      currentLineNum: 0, // 歌词行
      playingLyric: '', // 歌词行内容
      currentTime: 0, //当前播放时间点
      currentTimeText: "00:00", //歌曲时长格式
      duration: 0, //歌曲时长
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    play: function () { // 播放
      let that = this;
      that.data.backgroundAudioManager.play();
      that.setData({
        isplay: true
      })
    },
    pause: function () { // 暂停
      let that = this;
      that.data.backgroundAudioManager.pause();
      that.setData({
        isplay: false
      })
    },
    seek: function (e) { // seek时间
      let that = this;
      that.data.backgroundAudioManager.seek(Math.floor(e.detail.value));
      that.data.backgroundAudioManager.play();
      that.setData({
        isplay: true
      })
    },
    // 调用父页面music 函数
    musicGetSinglePlay: function (data) {
      let that = this;
      that.triggerEvent('musicGetSinglePlay', data, {})
    },
    getSinglePlay: function (data) {
      let that = this;
      that.singlePlay(that, data);
    },
    // 背景音乐初始化
    audioBackInit: (that, url) => {
      that.data.backgroundAudioManager = wx.getBackgroundAudioManager();
      that.data.backgroundAudioManager.src = url; //歌曲播放地址
      that.data.backgroundAudioManager.singer = that.data.songData.singer.name; // 歌手名字
      that.data.backgroundAudioManager.title = that.data.songData.name; // 歌曲名字
      that.data.backgroundAudioManager.onCanplay(() => {
        console.info('准备播放');
      })
      that.data.backgroundAudioManager.onPlay(() => {
        console.info('播放');
        that.setData({
          isplay: true
        })
      })
      that.data.backgroundAudioManager.onPause(() => {
        console.log('i am onPause')
        that.data.backgroundAudioManager.pause()
        that.data.songData.currentLyric.stop()
        //播放停止，销毁该实例
        that.setData({
          isplay: false
        })
      })
      that.data.backgroundAudioManager.onTimeUpdate(() => {
        //同步播放时间
        that.setData({
          [`songData.duration`]: Math.floor(that.data.backgroundAudioManager.duration)
        })
        if ((Math.floor(that.data.backgroundAudioManager.currentTime) - that.data.songData.currentTime) > 0.5 
        || (Math.floor(that.data.backgroundAudioManager.currentTime) - that.data.songData.currentTime) < 0.5) {
          that.setData({
            [`songData.currentTime`]: that.data.backgroundAudioManager.currentTime,
            [`songData.currentTimeText`]: uitl.sTt(that.data.backgroundAudioManager.currentTime)
          })
          // 歌词同步
          /** 
           * miniprogram_npm/lyric-parser 579: seek 函数 增加isStop 判断seek是否自动播放
           * */ 
          that.data.songData.currentLyric.seek(that.data.backgroundAudioManager.currentTime * 1000, true);
        }
      })
      that.data.backgroundAudioManager.onEnded(() => {
        console.log('i am onEnded')
        //播放结束
        that.data.songData.currentLyric.stop();
        //结束后判断播放模式 single loop jaychou
        if (that.data.playType === 'single') {
          that.audioBackInit(that, that.data.songData.url);
          that.play();
        } else if (that.data.playType === 'loop') {
            let index = that.data.songData.index;
            that.musicGetSinglePlay({ 'index': index + 1});
        } else if (that.data.playType === 'jaychou') {
          let index = that.data.songData.index;
          that.setData({
            songData: that.data.jayList[index + 1],
            isplay: true,
          })
          that.audioBackInit(that, that.data.songData.url);
          that.play();
        }
      })
      that.data.backgroundAudioManager.onError((res) => {
        console.info('出错了！');
      })
    },
  // 歌词初始化
  lyricInit: (that, data) => {
      if (that.data.songData.currentLyric != null) {
        // 清除字幕定时器
        that.data.songData.currentLyric.stop()
      };
      let lyric = data.songData.lrcContext //歌词数据
      that.data.songData.currentLyric = new Lyric(lyric, function ({ lineNum, txt }) {
        // 设置属性值并且需要动态更新的时候需要如下设置。
        that.setData({
          [`songData.currentLineNum`]: lineNum,
          [`songData.playingLyric`]: txt,
        })
        app.globalData.playerData.songData = that.data.songData;
      }) //handleLyric回调函数
      // 同步全局歌词播放状态
      app.globalData.playerData.songData = that.data.songData;
  },
  singlePlay: (that, data) => {
      if (data.vkey === '') {
        console.log('歌曲权限不够！');
      }
      that.setData({
        songData: {
          id: data.songmid,
          lrcContext: data.lrcContext,
          name: data.songname,
          pic: data.albumimg,
          singer: data.singer,
          url: data.url,
          vkey: data.vkey,
          index: data.index,
          currentTime: 0,
          currentTimeText: "00:00"
        },
        isplay: true,
      })
      that.audioBackInit(that, that.data.songData.url);
      that.lyricInit(that, that.data);
      that.play();
    }
  },
  ready: function() {
    var that = this;
    //初始化播放
    // that.singlePlay(that, that.data.songData);
  }
})