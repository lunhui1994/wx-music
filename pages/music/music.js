// pages/music/music.js
const uitl = require("../../utils/util.js");
const service = require("../../module/service.js");
const api_music = uitl.interface.tencent; // kugou migu netease
let app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    TabCur: 1, //nav
    scrollLeft: 0,
    // 加载框
    loadModal: false, //搜索加载框
    innerAudioContext: null,
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
    topList: [], // 歌曲列表 top100
    searchList: [], //搜索列表 前100
    jayList: [], //jaychou 前60
    playList: [], //播放列表
    playHistoryList: [], //历史播放记录
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
      tapsinglePlay(data);
    } else {
      that.setData({
        playType: 'single'
      })
    }
  },
  searchNameFn: function (event) {
    let that = this;
    that.setData({
      'searchData.musicName': event.detail.value
    })
  },
  searchMusic: function () { //搜索音乐 fn
    let that = this;
    that.setData({
      loadModal: true
    })
    let param = {
      n: 30,
      p: 1,
      w: that.data.searchData.musicName
    }
    let url = api_music + "list" + uitl.json2str(param);
    service.getSearchMusic({url: url}, function (res) {
      let list = res.data.data.list;
      for (let i = 0; i < list.length; i++) {
        list[i].index = i;
        list[i].lrcContext = '';
      }
      that.setData({
        searchList: list,
        loadModal: false //搜索结果框
      })
    })
  },
   // 获取音乐top100列表
   getQMusic: function () {
    let that = this;
    service.getQMusic(function (res) {
      let list = res.data.data.list;
      for (let i = 0; i < list.length; i++) {
        list[i].index = i;
        list[i].lrcContext = '';
      }
      console.info(list)
      that.setData({
        topList: list,
      })
      app.globalData.playerData.playList = list;
      that.getSinglePlay(list[0]);
    })
  },
  // 获取周董歌曲列表
  getQjayChou: function () {
    let that = this;
    service.getQjayChou(function (res) {
      let list = res.data.data.list;
      for (let i = 0; i < list.length; i++) {
        list[i].index = i;
        list[i].lrcContext = '';
      }
      that.setData({
        jayList: list
      })
    })
  },
  getSinglePlay: function (data) {
    let that = this;
    service.getSongurl({ songmid: data.songmid }, function (res) {
      data.url = res.data.data.musicUrl;
      data.vkey = res.data.data.vkey;
      data.lrcContext = res.data.data.lyric;
      if (data.vkey === '') {
        
        return that.getSinglePlay(app.globalData.playerData.playList[data.index + 1])
      }
      // 播放器组件 内部api 加载歌曲信息。
      that.player.getSinglePlay(data);
    })
  },
  //歌曲点播 
  tapSinglePlay: function (event) {
    let that = this;
    let data = event.currentTarget.dataset.music;
    switch (that.data.TabCur) {
      case 0: 
        app.globalData.playerData.playList = that.data.searchList;
        break;
      case 1: 
        app.globalData.playerData.playList = that.data.topList;
        break;
      case 2: 
        app.globalData.playerData.playList = that.data.jayList;
        break;
    }
    that.getSinglePlay(data);
  },
  // 子组件调用music getSinglePlay点播
  toPlayerSinglePlay: function (e) {
    let that = this;
    let data = app.globalData.playerData.playList[e.detail.index];
    that.getSinglePlay(data)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    that.player = that.selectComponent('#myplayer'); // 播放器组件实例
    //初始化播放
    that.getQMusic(); // 获取排行榜
    that.getQjayChou(); // 获取周董歌曲列表
  },
})