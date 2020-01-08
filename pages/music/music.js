// pages/music/music.js
const uitl = require("../../utils/util.js");
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
    urlList: [api_music + "url?id=0039MnYb0qxYhV&key=579621905"], //播放列表
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
  getSinglePlay: function(event, musicData) {
    let data = null;
    if (event != null) {
      data = event.currentTarget.dataset;
    } else {
      data = musicData;
    }
    let that = this;
    wx.request({
      url: api_music + "song?songmid=" + data.music.songmid + "&guid=126548448&lyric=1",
      method: 'GET',
      header: {
        "Content-Type": "application/json;charset=utf-8;"
      },
      success: function (res) {
        data.music.url = res.data.data.musicUrl;
        data.music.vkey = res.data.data.vkey;
        data.music.lrcContext = res.data.data.lyric;
        let songData = {
          id: data.music.songmid,
          lrcContext: data.music.lrcContext,
          name: data.music.songname,
          pic: data.music.albumimg,
          singer: data.music.singer.name,
          index: data.music.index
        };
        that.setData({
          songData: songData
        })
        app.globalData.playerData.songData = songData;
        // 播放器组件 内部api 加载歌曲信息。
        that.player.getSinglePlay(data);
      }
    })
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
    that.player = that.selectComponent('#myplayer'); // 播放器组件实例
    //初始化播放
    getQMusic(that); // 获取排行榜
    getQjayChou(that); // 获取周董歌曲列表
  },
})

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
        songList: list,
      })
      app.globalData.playerData.playList = list;
      that.getSinglePlay(null, {
        music: list[0]
      });
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