$(function(){
  /*背景音乐*/
  audioMusic('myAudio', 'bgcontrols', function(res){
    if (res.status === 2) {//音乐开始播放回调
        console.log("【背景音乐播放OK1】");
        sessionStorage.setItem("muted", 0);
      } else if (res.status === 1) {//播放回调
        $("#bgcontrols").removeClass("on");
        sessionStorage.setItem("muted", 0);
      } else {//暂停回调
        $("#bgcontrols").addClass("on");
        sessionStorage.setItem("muted", 1);
      } 
  });
  //audio播放音乐
  function audioMusic(audio, clickBtn, callback) {
    var audio = document.getElementById(audio);
    var clickBtn = document.getElementById(clickBtn);
    audio.play();
    document.addEventListener("WeixinJSBridgeReady", function () {
      audio.play();
    }, false);
    callback({status: 2});
    clickBtn.onclick = function(){
      if (audio.paused) {
        audio.play();
        callback({status: 1});
      } else { 
        audio.pause(); 
        callback({status: 0});
      }
    }  
  }
})