var vue = new Vue({
  el: "#app",
  data: {
    currentEnvironment: ['pc', 'ios'],//当前运行环境
    authorized_address: 'http://game.flyh5.cn/game/wx1da84b6515b921cd/jan_blessing_tdw',//后台端授权地址
    requestUrl: 'http://game.flyh5.cn/game/wx1da84b6515b921cd',//请求接口地址URL
    userInfo: {},//个人用户信息
    friendInfo: {},//朋友的用户信息
    myVoice: null,//当前录音
    curPro: 0,//当前录制进度条
    curPageIndex: 0,//当前页面index索引
    transitionType: 'rightLeft',//页面切换效果
    curPingIndex: 1,//当前是选择是哪只猪
    curLoingIndex: 0,//loadin页6个猪头像当前显示索引
    interval_loadingImg: null,//定时器-首页6个猪头像切换
    progressSpeed: 50,//进度条速率
    progressSpeed2: 40,//进度条速率 
    progressSpeed3: 30,//进度条速率
    progress: 0,//进度条当前进度
    progress1: 50,//进度条当前进度
    progress2: 90,//进度条当前进度    
    progress3: 100,//进度条当前进度
    interval_progressStart: null,//定时器-loading加载页开始
    interval_progressComplete: null,//定时器-loading加载页结束
    interval_recordingTime: null,//定时器-录制时计时
    interval_curPro: null,//定时器-录制进度条
    interval_effects: null,//定时器-序列帧
    timeout_autoStop: null,//定时器-自动关闭播放音效
    mySwiper: null,//6只猪选择页swiper
    btnStatus: [1 , 0, 0],//开始、暂停、5种音效状态值
    isShare: false,//分享弹层
    isPlayinag: false,//是否在播放刚刚保存或者朋友发过来的录音
    canvasImgUrl: '',//生成的海报图路径
    effectCurindex: 1,//序列帧索引
    totast: [0, 0, '', 1, 2500, true, null],//第一项为类型0为纯文字、1为纯图标、2为图文，第二项为显示/隐藏,第三项为文案,第四项为是否可以点击立马关闭，第五项为自动关闭定时器
    isBackInit: false,//背景音乐是否初始化Ok
    backIsPaused: false,//背景音乐是否暂停
    isSharePage: false,//是否用户分享过来页面
    serverId: '',//用录音的本地localId换来的服务器serverId
    voiceSrc: '',//朋友分享过来的src
    soundEffects: 0,//朋友分享的是个音效
    share_ma: '',//保存后的share_ma
    isShowFriend: false,//是否是显示的朋友传过来的祝福页面
    stopManyClick: false//防止多次点击
  },
  created() {
    var _self = this;
    this.init();
    // this.audioMusic("myAudio", function(){
    //   _self.bindPause();
    // });
  },
  beforemount() {

  }, 
  mounted() {
    this.wxConfigInit();
    this.progressStart();
    this.progressComplete();
    this.bindPause();
  },
  watch: {
    totast() {
      var _self = this
      _self.totast[6] = setTimeout(function(){
        _self.closeTotast(true);
      }, _self.totast[4] || 2500)
    }
  },
  methods: {
    //页面初始化
    init() {
      var _self = this;
      //运行环境
      if (window.location.href.indexOf("localhost") == -1) {
        this.currentEnvironment[0] = 'phone';
      } else {
        this.currentEnvironment[0] = 'pc';
      }
      //手机环境
      _self.isSystem(function(res){
        if (res.isiOS) {
          _self.currentEnvironment[1] = 'ios';
        } else {
          _self.currentEnvironment[1] = 'and';
        }  
      });
      //移动端
      if (this.currentEnvironment[0] == 'phone') {
        if (!sessionStorage.getItem("openid")) {
          window.location.replace(this.authorized_address);
        } else {
          this.getUserInfo();
        }
      //pc端 
      } else if (this.currentEnvironment[0] == 'pc') {
        this.requestUrl = '';
        if (sessionStorage.getItem("openid")) {
          sessionStorage.setItem("openid", "omwDg0wnbInuXEsS3WevSx1XcFdo");
          sessionStorage.setItem("nickname", "扬帆");
          sessionStorage.setItem("head_url", "http://img.flyh5.cn/game/admin_chj/Jan_tdw/15482082635c47c887597ab.jpg");
        } else {
          this.getUserInfo();
          console.log(this.userInfo);
        }
      }
      FastClick.attach(document.body);
      //开始loading页面
      this.logadingSwitch();
    },
    //判断是否是从朋友分享过来的
    isFriendShare(){
      var _self = this;
      if (this.getUrlParameter("shareid")) {
        _self.isShowFriend = true;
        console.log("【是从朋友分享进的项目】");
        console.log("朋友的shareid---->", this.getUrlParameter("shareid"));
        _self.isSharePage = true;
        _self.curPageIndex = 4;
        _self.getVoice(this.getUrlParameter("shareid"), function(res){
          var _friendInfo = res.data.userinfo;
          _self.friendInfo.head_url = _friendInfo.head_url;
          _self.friendInfo.nickname = _self.fontNormal(_friendInfo.nickname);
          _self.curPingIndex = parseInt(_friendInfo.pig);
          _self.friendInfo.dur = _friendInfo.dur;
          _self.voiceSrc = _friendInfo.vido_url;
          _self.btnStatus[2] = _friendInfo.bgvoice;
        });
      } else {
        this.nextPage();
      }
    },
    //从本地缓存中获取个人信息
    getUserInfo() {
      this.userInfo.openid = sessionStorage.getItem("openid");
      this.userInfo.nickname = this.fontNormal(sessionStorage.getItem("nickname"));
      this.userInfo.head_url = sessionStorage.getItem("head_url");
    },
    //昵称过长处理
    fontNormal(font) {
      if (!font) return '--';
      var _font = font;
      if (_font.length > 8) {
        _font = _font.slice(0, 6) + '...';
      }
      return _font;
    },
    //序列帧
    effectsPlay() {
      var _self = this
      if (_self.interval_effects) return;
      _self.interval_effects = setInterval(function(){
        _self.effectCurindex < 24 ? _self.effectCurindex++ : _self.effectCurindex = 1
      }, 50);
    },
    //获取上传的祝福音频文件
    getVoice(shareid, callback) {
      var _self = this;
      $.post(_self.requestUrl + '/jan_blessing_tdw/api.php?a=return_vido', {shareid: shareid}, function(res){
        callback(res);
      });
    },
    //背景音乐
    backMusicPlay(){
      var _self = this;
      this.startBackMusic('./images/music_bg.mp3', 'myAudio', 'music-switch', function(res){
        if (res.status === 2) {//音乐开始播放回调
          _self.isBackInit = true;
          if (_self.currentEnvironment[1] == 'phone' && _self.currentEnvironment[1] == 'ios') {  _self.backIsPaused = true; }
        } else if (res.status === 1) {//播放回调
          _self.backIsPaused = false;
        } else {//暂停回调
          _self.backIsPaused = true;
        }
      });
    },
    //绑定暂录音和音效事件
    bindPause() {
      var _self = this;
      var myAudio = document.getElementById("myAudio");
      var voice = document.getElementById("voice");
      var music02 = document.getElementById("music02");
      var music03 = document.getElementById("music03");
      var music04 = document.getElementById("music04");
      var music05 = document.getElementById("music05");
      controls1.onclick = function(){ voice.pause(); } 
      controls2.onclick = function(){ music02.pause(); }
      controls3.onclick = function(){ music03.pause(); }
      controls4.onclick = function(){ music04.pause(); }
      controls5.onclick = function(){ music05.pause(); }
      // bgcontrols.onclick = function(){ 
      //   console.log(111);
      //   console.log(myAudio);
      //   console.log(myAudio.paused);
      //   if (myAudio.paused) {
      //     console.log(222);
      //     //myAudio.pause();
      //     _self.playPauseBg(0); 
      //   } else {
      //     console.log(333);
      //     _self.playPauseBg(0); 
      //     //myAudio.pause(); 
      //   }
      // }
    },
    backPlayPause() {
      this.playPauseBg(0);
    },
    //选择音效
    selectVoice(curIndex) {
      var _self = this;
      if (!_self.isShowFriend) {
        if (!_self.isSoundRecording()) return;
      }
      _self.btnStatus[2] = curIndex;
      _self.pauseAllAudio();
      _self.playPauseBg(0);
      if (curIndex == 1) {
        _self.musicPlay("voice", function(){
          _self.autoStopPlay();
        });
      } else {
        _self.musicPlay("voice", function(){
          _self.autoStopPlay();
        });
        _self.musicPlay("music0" + curIndex);
      }
      _self.autoStopPlay();
    },
    //首页向上滑动切换到下一页
    swipeup() {
      //this.musicPlay('myAudio')
      this.nextPage();
      this.effectsPlay();
      this.swiperInit();
      return;
    },
    //loading页6个猪头像切换
    logadingSwitch() {
      var _self = this;
      this.interval_loadingImg = setInterval(function(){
        _self.curLoingIndex >= 5 ? _self.curLoingIndex = 0 : _self.curLoingIndex++
      }, 400);
    },
    //停止所有音效
    pauseAllAudio() {
      $("#controls1").trigger("click");
      $("#controls2").trigger("click");
      $("#controls3").trigger("click");
      $("#controls4").trigger("click");
      $("#controls5").trigger("click");
    },
    //定时播放停止
    autoStopPlay() {
      var _self = this;
      var _tims = (_self.isShowFriend ? (parseInt(_self.friendInfo.dur) + .5) : (parseInt(_self.curPro * .6) + .5)) * 1000;
      if (this.timeout_autoStop) {
        clearTimeout(this.timeout_autoStop)
      }
      this.timeout_autoStop = setTimeout(function(){
        _self.stopAllPlayBg();
      }, _tims);
    },
    //停止所有音效和语音恢复背景音乐
    stopAllPlayBg() {
      var _self = this;
      this.pauseAllAudio();
      if (sessionStorage.getItem("muted") != 1) {
        setTimeout(function(){
          _self.playPauseBg(1);
        }, 800)
      }
      this.isPlayinag = false;
    },
    //开始录音
    soundRecording_start() {
      console.log("【点击了录音按钮】");
      console.log("微信jssdk:", wx);
      var _self = this;
      if (this.btnStatus[0] == 0) return;
      wx.startRecord({
        success: function(res) {
          console.log("开始录音了");
          console.log(res);
          _self.playPauseBg(0);
          _self.recordingTime();
          _self.btnStatus[0] = 0;  
          _self.btnStatus[1] = 1; 
        },
        fail: function(res) {
          //录音失败
          this.totast = [0, 1, '录音失败,请稍后再试'];
        }
      }); 
    },
    //停止录音
    soundRecording_stop() {
      let _self = this;
      if (_self.btnStatus[1] == 0) return; 
      _self.btnStatus[1] = 0;
      wx.stopRecord({
        success: function (res) {
          _self.myVoice = res.localId;
          _self.playPauseBg(1);
          clearInterval(_self.interval_curPro);
          if (parseInt(_self.curPro * .6) < 2) { return; }
          _self.transformMp3(function(res){
            console.log("停止后换来的mp3");
            console.log(res.data.ret_mp3url);
            _self.voiceSrc = res.data.ret_mp3url;
            _self.totast = [2, 1, '祝福合成中', 3500, false];        
      });
        }
      }); 
    },
    //播放录音
    soundRecording_play(callback) {
      console.log("录制到的录音：");
      console.log(this.myVoice)  
      //this.stopVoice();
      wx.playVoice({
        localId: this.myVoice // 需要播放的音频的本地ID，由stopRecord接口获得
      });
    },
    //停止播放录音
    stopVoice() {
      wx.stopVoice({
        localId: this.myVoice // 需要停止的音频的本地ID，由stopRecord接口获得
      });
    },
    //计时
    recordingTime() {
      var _self = this;
      this.interval_curPro = setInterval(function() {
        if (_self.curPro < 100) {
          _self.curPro += (100 / 1200)
        } else {
          clearInterval(_self.interval_curPro);
          _self.curPro = 100
          console.log("时间到")
          //_self.btnStatus[1] = 0;
          _self.soundRecording_stop();
        }
      }, 50)
    },
    //保存录音
    preservation() {
      var _self = this;
      if (!_self.isSoundRecording()) return;
      if (_self.btnStatus[2] == 0) {
        this.totast = [0, 1, '请先选择一个您喜欢的音效吧~'];
        return;
      }
      var _url = _self.requestUrl + '/jan_blessing_tdw/api.php?a=get_vido';
      var _data = { 
        media_id: '',
        authorizer_access_token: sessionStorage.getItem("authorizer_access_token"),
        pigIndex: _self.curPingIndex,
        dur: parseInt(_self.curPro * .6),
        sefIndex: _self.btnStatus[2] 
      };
      _self.pauseAllAudio();
      this.totast = [2, 1, '祝福生成中'];
      //_self.uploadVoice(function(res){
        _data.media_id = _self.serverId;
        $.post(_url, _data, function(res){
          console.log("语音上传成功后的返回：");
          console.log(res);
          _self.share_ma = res.data.share_ma
          _self.shareConfig(1);
          _self.generateCode(function(res){
            _self.generateCanvasImg(res, function(res){
              _self.canvasImgUrl = res;
               setTimeout(function(){
                 _self.closeTotast(true);
                 _self.nextPage();
               }, 500); 
            });
          })
        })
      //}); 
    },
    //绘制二维码
    generateCode(callback){
      this.qr_code("#code", window.ShareUrl, 120, 120, '#000', '#fff');  
      var getCodeImg = setInterval(function(){
        if ($('#code img').attr('src')) {
          callback($('#code img').attr('src'));
          clearInterval(getCodeImg);
        }
      },10);
    },
    //本地语音转换成mp3
    transformMp3(callback) {
      var _url = this.requestUrl + '/jan_blessing_tdw/api.php?a=ret_mp3';
      this.uploadVoice(function(res){
        $.post(_url, {media_id: res, authorizer_access_token: sessionStorage.getItem("authorizer_access_token")}, function(res){
          callback(res);
        })
      });
    },
    //上传语音接口
    uploadVoice(callback) {
      var _self = this;
      wx.uploadVoice({
        localId: _self.myVoice, // 需要上传的音频的本地ID，由stopRecord接口获得
        isShowProgressTips: 1, // 默认为1，显示进度提示
        success: function (res) {
          var serverId = res.serverId; // 返回音频的服务器端ID
          if (callback) {
            _self.serverId = serverId;
            callback(serverId);
          }
        }
      });
    },
    //是否正确录音
    isSoundRecording() {
      if (this.btnStatus[1] == 1) {
        this.totast = [0, 1, '请先结束录制'];
        return false;
      } else  if (this.curPro == 0) {
        this.totast = [0, 1, '请先录制语音祝福~'];
        return false;
      } else if (parseInt(this.curPro * .6) < 2) {
        this.totast = [0, 1, '录制时间太短~'];
        return false;
      }
      return true;
    },
    //重新录制
    reRecording() {
      var _self = this;
      if (this.btnStatus[1] == 1) {
        this.totast = [0, 1, '请先结束录制'];
        return false;
      }
      this.pauseAllAudio();
      clearInterval(_self.interval_curPro);
      this.myVoice = null;
      this.curPro = 0;
      this.btnStatus = [1, 0, 0];  
      $('#code img').remove();
    },
    //生成海报
    generateCanvasImg(codeImgUrl, callback) {
      var _self = this
      console.log('./images/share/bg_0'+_self.curPingIndex+'.jpg');
      console.log(_self.userInfo.head_url);
      console.log(codeImgUrl);
      _self.canvasImg({
        canvasId: 'canvas', 
        psd_w: 750, 
        psd_h: 1334,
        bgImg: './images/share/bg_0'+_self.curPingIndex+'.jpg',
        imgList: [
          { url: _self.userInfo.head_url, imgW: 106, imgH: 106, imgX: 181, imgY: 781, radius: "50%" },
          { url: './images/generate/page8_16.png', imgW: 108, imgH: 108, imgX: 180, imgY: 781 },
          { url: codeImgUrl, imgW: 120, imgH: 120, imgX: 534, imgY: 1054 },
        ],
        textList: [
          { string: _self.userInfo.nickname, color: '#dc4a36', fontSize: '26px', fontFamily: 'Arial', textX: _self.fontCanvasCenter(_self.userInfo.nickname), textY: 920 },
          { string: parseInt(_self.curPro * .6) + '"', color: '#FF6600', fontSize: '22px', fontFamily: 'Arial', textX: 556, textY: 850 }
        ]
      }, function(res){
        if (callback) callback(res);
      });
    },
    //文字居中绘制
    fontCanvasCenter(font) {
      var _num = font.length;
      if (font.indexOf("...") != -1) {
        _num = _num -2;
      }
      return 327 + (230 - _num * 26) / 2;
    },
    //从朋友的分享点击我也玩按钮
    newGame(){
      var _self = this;
      _self.jumpPage(1);
      _self.stopAllPlayBg();
      setTimeout(function(){
        _self.isSharePage = false;
        _self.isShowFriend = false;
        _self.btnStatus[2] = 0;
      }, 1000)
    },
    //分享弹层
    shareHaze() {
      this.isShare = !this.isShare;
    },
    //分享配置
    shareConfig(type) {
      var _ShareUrl = this.authorized_address;
      var _Title = '领“猪宝”，送“猪福”';
      var _Desc = "这里有一只“神秘猪宝”帮你送出新年“猪福”。";
      var _ShareImage = "https://game.flyh5.cn/resources/game/wechat/szq/tuandaiwang/images/logo.ico";
      if (type == 1) {
        _ShareUrl = _ShareUrl + '?shareid=' + this.share_ma;
        _Title = this.userInfo.nickname + '给你送语音“猪福”啦！';
        _Desc = this.userInfo.nickname + '给你录制了一段专属于你的新年语音“猪福”，赶快点击进去听听吧！'
      }
      window.ShareUrl = _ShareUrl;
      window.Title = _Title;
      window.Desc = _Desc;
      window.ShareImage = _ShareImage;
      this.menuShareAppMessage();
    },
    //点击播放自己/朋友的录音
    playVoice() {
      var _self = this;
      if (_self.isPlayinag) {
        _self.isPlayinag = false;
        _self.stopAllPlayBg();
      } else {
        _self.isPlayinag = true;
        _self.selectVoice(_self.btnStatus[2]);
      }
    },
    //重新编辑
    reEdit() {
      this.stopAllPlayBg();
      this.prevPage();
    },
    //swiper初始化
    swiperInit() {
      var _self = this
      this.mySwiper = new Swiper('.swiper-container', {
        observer:true,
        observeParents:true,
        observeSlideChildren:true,
        //loop: true,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        on: {
          slideChangeTransitionStart: function(){
            _self.curPingIndex =  this.activeIndex + 1;
          }
        }
      });
    },
    //loading开始
    progressStart() {
      this.interval_progressStart = setInterval(() => {
        if (this.progress < this.progress2) {
          this.progress++;    
          if (this.progress > this.progress1) {
            this.progressSpeed = this.progressSpeed2;
          }  
        } else {
          clearInterval(this.interval_progressStart);
        }  
      }, this.progressSpeed);
    },
    //loading结束
    progressComplete() {
      var _self = this;
      if (this.interval_progressStart) {
        clearInterval(this.interval_progressStart);
      } 
      this.interval_progressComplete = setInterval(() => {
        if (this.progress < this.progress3) {
          this.progress++;     
        } else {
          clearInterval(this.interval_progressComplete);
          this.isFriendShare();
          //this.nextPage();
        }  
      }, this.progressSpeed3); 
    },
    //跳转到某个页面
    jumpPage(pageIndex) {
      this.curPageIndex = pageIndex || 0;
    },
    //切下一个页面
    nextPage() {
      var _self = this;
      if (_self.stopManyClick) { return; } 
      _self.stopManyClick = true;
      this.curPageIndex == 1 ? this.transitionType = 'bottomTop' : this.transitionType = 'rightLeft';
      this.curPageIndex++;
      setTimeout(function(){ _self.stopManyClick = false; }, 1000);
    },
    //返回上一个页面
    prevPage() {
      var _self = this;
      if (_self.stopManyClick) { return; } 
      this.transitionType = 'leftRight';
      this.curPageIndex--;
      setTimeout(function(){ _self.stopManyClick = false; }, 1000);
    },
    //关闭消息框
    closeTotast(isAuto) {
      // if (!this.totast[5] && !isAuto) { return; }
      console.log(this.totast[0]);
      console.log(isAuto);
      if (this.totast[0] == 2 && !isAuto) { return; }
      if (this.totast[6]) clearTimeout(this.totast[6]);
      this.totast[1] = 0;
    },
    canvasImg(options, callback) {
      var _self = this;
      var P_W = window.innerWidth;
      var P_H = window.innerHeight;
      var PSD_W = options.psd_w;
      var PSD_H = options.psd_h;
      var canvas = document.getElementById(options.canvasId);
      var ctx = canvas.getContext("2d");  
      var devicePixelRatio = window.devicePixelRatio || 1;
      var backingStoreRatio = ctx.webkitBackingStorePixelRatio || 1;
      var ratio = devicePixelRatio / backingStoreRatio;
      canvas.width = options.psd_w * ratio / 2;
      canvas.height = options.psd_h  * ratio / 2; 
      ctx.scale(ratio / 2, ratio / 2);
      if (options.bgImg) {options.imgList.unshift({url: options.bgImg,imgW: PSD_W,imgH: PSD_H,imgX: 0,imgY: 0});}
      var vars = {};
      for (var m in options.imgList) {
        vars["newImg" + m] = new Image();
        vars["newImg" + m].setAttribute("crossOrigin",'anonymous');
        vars["newImg" + m].src = options.imgList[m].url;
      }
      var progress = 0;
      for (var z in options.imgList) {
        vars["newImg" + z].onload = function(){
          progress += 2520/options.imgList.length;
          if (progress === 2520) {
            startDraw();
          }
        }
      }
      function addRoundRectFunc() {
        CanvasRenderingContext2D.prototype.roundRect =
          function (x, y, width, height, radius, fill, stroke) {
            if (typeof stroke == "undefined") { stroke = false; }
            if (typeof radius === "undefined") { radius = 5; }
            this.beginPath();
            this.moveTo(x + radius, y);
            this.lineTo(x + width - radius, y);
            this.quadraticCurveTo(x + width, y, x + width, y + radius);
            this.lineTo(x + width, y + height - radius);
            this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            this.lineTo(x + radius, y + height);
            this.quadraticCurveTo(x, y + height, x, y + height - radius);
            this.lineTo(x, y + radius);
            this.quadraticCurveTo(x, y, x + radius, y);
            this.closePath();
            if (stroke) { this.stroke(); }
            if (fill) { this.fill(); }
          };
      }
      function startDraw() {
        //绘制图片  
        for (var n in options.imgList) {
          if (!options.imgList[n].radius) {
            drawImg();
          } else if (options.imgList[n].radius == "50%") {
            ctx.save();
            var r = options.imgList[n].imgW * .5;
            ctx.arc(options.imgList[n].imgX + r, options.imgList[n].imgY + r, r, 0, 2 * Math.PI);
            ctx.clip();
            ctx.fill();
            drawImg(true);
            ctx.restore();
          } else {
            ctx.save();
            addRoundRectFunc();
            ctx.roundRect(options.imgList[n].imgX, options.imgList[n].imgY, options.imgList[n].imgW, options.imgList[n].imgH, options.imgList[n].radius, true);
            ctx.globalCompositeOperation = 'source-in';
            ctx.clip();
            drawImg();
            ctx.restore();
          }
          function drawImg(arc) {
            ctx.drawImage(vars["newImg" + n], 0, 0, vars["newImg" + n].width, vars["newImg" + n].height, options.imgList[n].imgX, options.imgList[n].imgY, options.imgList[n].imgW, arc ? options.imgList[n].imgW : options.imgList[n].imgH);
          }
        }
        //绘制文字
        function drawFont() {
          var fonts = options.textList;
          for (var k in fonts) {
            ctx.fillStyle = fonts[k].color;
            ctx.font = fonts[k].fontSize + ' ' + fonts[k].fontFamily;
            ctx.textBaseline = 'hanging';
            _self.isSystem(function(res){
              if (res.isiOS) {fonts[k].textY -= 10;} 
            });
            if (fonts[k].vel) {
              for (var z in fonts[k].string) {
                ctx.fillText(fonts[k].string[z], fonts[k].textX, fonts[k].textY + z * (parseInt(fonts[k].fontSize) + fonts[k].vel));
              }
            } else {
              ctx.fillText(fonts[k].string, fonts[k].textX, fonts[k].textY); 
            }
          }
        }
        drawFont();
        callback(canvas.toDataURL("image/png"));
      }
    },
    //从地址栏获参
    getUrlParameter(name) {
      var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
      var URL =  decodeURI(window.location.search);
      var r = URL.substr(1).match(reg);
      if(r!=null){
          //decodeURI() 函数可对 encodeURI() 函数编码过的 URI 进行解码
          return  decodeURI(r[2]);
      };
      return null;
    },
    //判断手机系统
    isSystem(callback) {
      var u = navigator.userAgent;
      var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
      var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
      callback({isAndroid: isAndroid, isiOS: isiOS});  
    },
    //控制背景音乐
    playPauseBg(status, type) {
      var _audio = document.getElementById("myAudio");
      if (status == 0) {
        console.log("【背景音乐暂停】");
        _audio.pause(); 
      } else {
        console.log("【背景音乐播放】");
        if (type && sessionStorage.getItem("muted") == 1) { return; }
        _audio.play();
      }
    },
    //播放音频
    musicPlay(ele, callback) {
      var _audio = document.getElementById(ele);
      if (ele != "voice") {
        if (_audio.paused) {
          console.log(_audio.paused);
          console.log(sessionStorage.getItem("muted"));
          _audio.currentTime = 0;
          console.log("【点击触发的播放背景音乐】");
          _audio.play();
        }
        return;
      } 
      _audio.oncanplay = function () {
        console.log(ele + "--->oncanplay准备播放了");
        //_audio.currentTime = 0;
        _audio.play();
      }
      _audio.load();
      
      // _audio.addEventListener("canplaythrough",
      //   function() {
      //     _audio.currentTime = 0;
      //     _audio.play();
      //   },
      // false);
      
      // _audio.addEventListener("timeupdate",function(){
      //   if (Math.floor(_audio.currentTime) == 1 ) {
      //     if (callback) { callback(); }
      //   }
      // }, false);
      // _audio.load();
    },
    //audio播放音乐
    audioMusic(audio, callback) {
      var audio = document.getElementById(audio);
      audio.play();
      document.addEventListener("WeixinJSBridgeReady", function () {
        console.log("【背景音乐播放3】");
        audio.play();
        callback({status: 2});
      }, false); 
    },
    /*生成二维码*/
    qr_code(ele, src, width, height, color, color2) {
      for (var i = 0;i < $(ele).length; i++) {
        var _self = $(ele)[i];
        var qrcode = new QRCode(_self, {
          text: src,
          width: width,
          height: height,
          colorDark : color,
          colorLight : color2,
          correctLevel : QRCode.CorrectLevel.H
        });
      }    
    }, 
    wxConfigInit() {
      var _self = this;
      //加载jweixin标签，兼容6.7.2微信jssdk1.4.0版本
      _self.loadScript("./js/jweixin-1.2.0.js", function () { 
      //加载配置微信jssdk参数标签    
      _self.loadScript("https://game.flyh5.cn/game/xiyouji_jssdk/twolevel_autho/share.php?auth_appid=wx1da84b6515b921cd&type=js&isonlyopenid=true", function () {      
          //配置微信jssdk       
          _self.wxConfig({              
            appId: wx_config["appId"],           
            timestamp: wx_config["timestamp"],          
            nonceStr: wx_config["nonceStr"],          
            signature: wx_config["signature"]        
          }, window.openJssdkDebug)        
        });
      })
    },
    loadScript(src, callback) {
      var s = document.createElement("script");
      s.async = false;
      s.src = src;
      var evtName = null;
      var evtListener = null;
      function logic() {
        s.parentNode.removeChild(s);
        s.removeEventListener(evtName, evtListener, false);
        callback && callback();
      }
      if (!-[1,]) {
        evtName = "readystatechange";
        evtListener = function () {
          (this.readyState == "loaded" || this.readyState == "complete") && logic();
        }
      } else {
        evtName = "load";
        evtListener = logic;
      }
    s.addEventListener(evtName, evtListener, false);
    console.log(s);
    document.body.appendChild(s);
  },
    wxConfig(configData, openJssdkDebug) {
      var _self = this;
      wx.ready(function () {
          wx.checkJsApi({
              jsApiList: ["chooseImage"],
              success: function (res) {
                  if (res.checkResult.chooseImage) {
                      console.log("wx.checkJsApi success");
                      window.wxConfigReady = true;
                      document.dispatchEvent(new Event("wxConfigReady"));
                  }
                  console.log("wx.checkJsApi result:", res.checkResult);
              },
              fail: function (res) {
                  console.log("wx.checkJsApi fail:", res);
              }
          });
          _self.shareConfig();
      });
      wx.error(function (res) {
          console.log("wx.config error:", res);
      });
      wx.config({
          debug: openJssdkDebug,
          appId: configData.appId,
          timestamp: configData.timestamp,
          nonceStr: configData.nonceStr,
          signature: configData.signature,
          jsApiList: [
            'checkJsApi', 'onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'onMenuShareQZone', 'hideMenuItems', 'showMenuItems', 'hideAllNonBaseMenuItem', 'showAllNonBaseMenuItem', 'translateVoice', 'startRecord', 'stopRecord', 'onVoiceRecordEnd', 'playVoice',
            'onVoicePlayEnd', 'pauseVoice', 'stopVoice', 'uploadVoice', 'downloadVoice', 'chooseImage', 'previewImage', 'uploadImage', 'downloadImage', 'getNetworkType', 'openLocation', 'getLocation', 'hideOptionMenu', 'showOptionMenu', 'closeWindow', 'scanQRCode', 'chooseWXPay', 'openProductSpecificView', 'addCard', 'chooseCard', 'openCard'
          ]
      });
    },
    menuShareAppMessage() {
      // 2.1监听“分享到朋友”按钮点击、自定义分享内容及分享结果接口
      wx.onMenuShareAppMessage({
        title: window.Title,
        desc: window.Desc,
        link: window.ShareUrl,
        imgUrl: window.ShareImage,
        success: function(res) {},
        cancel: function(res) {},
        fail: function(res) {}
      });
      // 2.2 监听“分享到朋友圈”按钮点击、自定义分享内容及分享结果接口
      wx.onMenuShareTimeline({
        title: window.Title,
        desc: window.Desc,
        link: window.ShareUrl,
        imgUrl: window.ShareImage,
        success: function(res) {},
        cancel: function(res) {},
        fail: function(res) {}
      });
    }
  }    
})        