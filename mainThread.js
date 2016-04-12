//*************************
//爬虫主进程casperjs
//*************************

var msgPage = require("casper").create({
    pageSettings: {
        loadImages: false,
        loadPlugins: false,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53'
    }
//        ,
//        verbose: true,
//        logLevel: "debug"

});

var focusPage = require("casper").create({
    pageSettings: {
        loadImages: false,
        loadPlugins: false,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53'
    }
//        ,
//        verbose: true,
//        logLevel: "debug"

});

var userPage = require("casper").create({
    pageSettings: {
        loadImages: false,
        loadPlugins: false,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53'
    }
//        ,
//        verbose: true,
//        logLevel: "debug"

});


var x = require('casper').selectXPath;
var weibo = require('./tools/caspWeibo');
var cookies = require('./tools/Cookies');
var socket = require('./tools/ioHub');
//console.log("state:"+ws.readyState);

var USER = '13267241477';
var PASS = 'ql13530088648';
var URL = 'http://m.weibo.cn/';
var UID;
var NUM = 0;

var fs = require('fs');
var messages = [];
//'1793285524';
var self_PID = msgPage.cli.get(0);


//事件绑定
function bindThreadListener(casper,PID) {
    casper.echo('begin listen');
    casper.on('thread.completed', function () {
        if (NUM == 3) {
            //this.exit(1);
            this.echo("[WEBSOCKET]sending END signal");
            socket.sendWs(0,'END',PID);
        }
    });
}

//检测其他两个线程是否完成
function checkThreadExit(casper) {
    NUM++;
    casper.echo("Thread:" + NUM);
    casper.emit('thread.completed');
}


//bindThreadListener(focusPage);
//bindThreadListener(userPage);



//三个线程开始运行
function startScraping(UID) {
    msgPage.start(URL, function () {
        weibo.login(USER, PASS, msgPage);
    }).then(function () {
        weibo.getMsg(UID, msgPage, function (info) {
            socket.sendWs(info, "messages", self_PID);
        });
    }).run(checkThreadExit, msgPage);

    focusPage.start(URL, function () {
        weibo.login(USER, PASS, focusPage);
    }).then(function () {
        weibo.getFocusUsers(UID, focusPage, function (info) {
            socket.sendWs(info, "focus", self_PID);
        });
    }).run(checkThreadExit, focusPage);

    userPage.start(URL, function () {
        weibo.login(USER, PASS, userPage);
    }).then(function () {
        weibo.getUser(UID, userPage, function (info) {
            socket.sendWs(info, "user", self_PID);
        });
    }).run(checkThreadExit, userPage);
}


socket.createWs(self_PID,function(UID) {
    bindThreadListener(msgPage,self_PID); //页面监听器绑定
    bindThreadListener(focusPage,self_PID);
    bindThreadListener(userPage,self_PID);
    startScraping(UID);
});

//socketConnect.socketMan(self_PID, function (UID) {
//    startScraping(UID);
//}); //socket监听器绑定
