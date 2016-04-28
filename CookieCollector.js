var casper = require("casper").create({
    pageSettings: {
        loadImages: false,
        loadPlugins: false,
        userAgent: 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_3_3 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5'
    },
    verbose: true,
    logLevel: "debug"
});
var x = require('casper').selectXPath;
var weibo = require('./tools/caspWeibo');
var cookies = require('./tools/Cookies');
var socket = require('./tools/ioHub');
var fs = require('fs');


var USER_INDEX = casper.cli.get(0);
//USER[0] = '18938866425';
//PASS[0] = '13464451579';
//USER[1] = '13267241477';
//PASS[1] = 'ql13530088648';
var USER = config.userFlow[USER_INDEX][0];
var PASS = config.userFlow[USER_INDEX][1];

var displayCookies = function () //显示当前cookies
    {
        console.log('---------------------------------------------------------------');
        var cookies = phantom.cookies;
        for (var i = 0, len = cookies.length; i < len; i++) {
            console.log(cookies[i].name + ': ' + cookies[i].value);
        }
        console.log('---------------------------------------------------------------');
    } //casper.displayCookies

var checkCookies = function () {

    if (fs.exists('./data/cookies.txt')) {
        try {
            var data = fs.read('./data/cookies.txt');
            phantom.cookies = JSON.parse(data);
        } catch (err) {
            console.log(err);
        }
    } else {
        return false;
    }
    return true;
}

var saveCookies = function () {
    var cookies = JSON.stringify(phantom.cookies);
    fs.write('./data/cookies.txt', cookies, 644);
    return true;
}

var updateCookies = function (USER, PASS) {
    casper.start('https://m.weibo.cn/', function () {
        displayCookies();
        this.then(function () {
            this.click('.action a:nth-child(2)');
        }).then(function () {
            this.fillSelectors('form', {
                'input[id="loginName"]': USER,
                'input[id="loginPassword"]': PASS
            }, false);
        }).then(function () {
            this.click(x('//*[@id="loginAction"]'));
        }).then(function () {
            saveCookies();
        })

    });
    casper.run(function () {
        this.echo("Update cookies sucessfully");
        this.exit(0);
    });
}

updateCookies(USER, PASS);
