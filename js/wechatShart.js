//配置微信jssdk
function wxConfig(configData, openJssdkDebug) {
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
            "checkJsApi",
            "onMenuShareTimeline",
            "onMenuShareAppMessage",
            "onMenuShareQQ",
            "onMenuShareWeibo",
            "onMenuShareQZone",
            "updateAppMessageShareData",
            "updateTimelineShareData",
            "hideMenuItems",
            "showMenuItems",
            "hideAllNonBaseMenuItem",
            "showAllNonBaseMenuItem",
            "translateVoice",
            "startRecord",
            "stopRecord",
            "onVoiceRecordEnd",
            "playVoice",
            "onVoicePlayEnd",
            "pauseVoice",
            "stopVoice",
            "uploadVoice",
            "downloadVoice",
            "chooseImage",
            "previewImage",
            "uploadImage",
            "downloadImage",
            "getNetworkType",
            "openLocation",
            "getLocation",
            "hideOptionMenu",
            "showOptionMenu",
            "closeWindow",
            "scanQRCode",
            "chooseWXPay",
            "openProductSpecificView",
            "addCard",
            "chooseCard",
            "openCard"
        ]
    });
}

//加载jweixin标签，兼容6.7.2微信jssdk1.4.0版本
          
loadScript("./js/jweixin-1.2.0.js", function () { 
//加载配置微信jssdk参数标签    
loadScript("https://game.flyh5.cn/game/xiyouji_jssdk/twolevel_autho/share.php?auth_appid=wx1da84b6515b921cd&type=js&isonlyopenid=true", function () {      
  //配置微信jssdk       
  wxConfig({              
    appId: wx_config["appId"],           
    timestamp: wx_config["timestamp"],          
    nonceStr: wx_config["nonceStr"],          
    signature: wx_config["signature"]        
  }, window.openJssdkDebug)        
  });
})

//加载script
function loadScript(src, callback) {
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
}