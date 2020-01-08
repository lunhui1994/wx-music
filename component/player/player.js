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
    playType: 'single', //播放模式：single 单曲循环/ loop 列表
    poster: "http://imgcache.qq.com/music/photo/album_300/9/300_albumpic_9612009_0.jpg", //封面图
    currentTime: 0, //当前播放时间点
    currentTimeText: "00:00", //歌曲时长格式
    duration: 0, //歌曲时长
    currentLyric: null, // 歌词对象
    currentLineNum: 0, // 歌词行
    playingLyric: '', // 歌词行内容
    songData: {
      id: "0039MnYb0qxYhV",
      lrcContext: "",
      name: "我是如此相信",
      pic: "http://imgcache.qq.com/music/photo/album_300/a9/300_albumpic_9612009_0.jpg",
      singer: "周杰伦",
      url: "http://ws.stream.qqmusic.qq.com/C400001PLl3C4gPSCI.m4a?fromtag=0&guid=126548448&vkey=29F971703CF4D78BFEE26925734ED65DD0DBEFD557E83BD837899912003ABAC59B2DC0E73CF81AEBF0F82122B82B302075F7878D0758F696",
      index: 0,
      vkey: "29F971703CF4D78BFEE26925734ED65DD0DBEFD557E83BD837899912003ABAC59B2DC0E73CF81AEBF0F82122B82B302075F7878D0758F696"
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
    musicGetSinglePlay: function (data) {
      let that = this;
      that.triggerEvent('musicGetSinglePlay', {}, {})
    },
    getSinglePlay: function (data) {
      let that = this;
      that.singlePlay(that, data);
    },
    // 背景音乐初始化
    audioBackInit: (that, url) => {
      that.data.backgroundAudioManager = wx.getBackgroundAudioManager();
      that.data.backgroundAudioManager.src = url; //歌曲播放地址
      that.data.backgroundAudioManager.coverImgUrl = that.data.songData.pic; //poster图片
      that.data.backgroundAudioManager.singer = that.data.songData.singer; // 歌手名字
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
        that.data.currentLyric.stop()
        //播放停止，销毁该实例
        that.setData({
          isplay: false
        })
      })
      that.data.backgroundAudioManager.onTimeUpdate(() => {
        //同步播放时间
        that.setData({
          duration: Math.floor(that.data.backgroundAudioManager.duration)
        })
        if ((Math.floor(that.data.backgroundAudioManager.currentTime) - that.data.currentTime) > 0.5 
        || (Math.floor(that.data.backgroundAudioManager.currentTime) - that.data.currentTime) < 0.5) {
          that.setData({
            currentTime: that.data.backgroundAudioManager.currentTime,
            currentTimeText: uitl.sTt(that.data.backgroundAudioManager.currentTime)
          })
          // 歌词同步
          /** 
           * miniprogram_npm/lyric-parser 579: seek 函数 增加isStop 判断seek是否自动播放
           * */ 
          that.data.currentLyric.seek(that.data.backgroundAudioManager.currentTime * 1000, true); 
        }
      })
      that.data.backgroundAudioManager.onEnded(() => {
        console.log('i am onEnded')
        console.log(that.data.songData);
        console.log(app.globalData.playerData.playList);
        that.data.currentLyric.stop();
        //播放结束，销毁该实例
        if (that.data.playType === 'single') {
          that.audioBackInit(that, that.data.songData.url);
          that.play();
        } else if (that.data.playType === 'loop') {
          /** 
           * todo 触发music界面的播放事件，以获取歌曲信息。
           * */ 
            // let index = that.data.songData.index;
            // that.musicGetSinglePlay(app.globalData.playerData.playList[index + 1])
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
      if (that.data.currentLyric != null) {
        // 清除字幕定时器
        that.data.currentLyric.stop()
      };
      let lyric = data.songData.lrcContext //歌词数据
      that.data.currentLyric = new Lyric(lyric, function ({ lineNum, txt }) {
        that.setData({
          currentLineNum: lineNum,
          playingLyric: txt
        })
      }) //handleLyric回调函数
    app.globalData.playerData.currentLyric = that.data.currentLyric;
  },
  singlePlay: (that, data) => {
      if (data.music.vkey === '') {
        console.log('歌曲权限不够！');
      }
      that.setData({
        songData: {
          id: data.music.songmid,
          lrcContext: data.music.lrcContext,
          name: data.music.songname,
          pic: data.music.albumimg,
          singer: data.music.singer.name,
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