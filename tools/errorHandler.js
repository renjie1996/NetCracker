var SRCOLL_NUM = 0;
var PreOfLoaded = 0;

exports.configure = function (casper) {
    casper.on('scroll.timeout', function (NumOfLoaded) {
        if (SRCOLL_NUM <= 4) {
            if (PreOfLoaded == NumOfLoaded)
                SRCOLL_NUM++;
            this.echo("Scroll Timeout,reScroll");
            PreOfLoaded = NumOfLoaded;
            tryAndScroll(casper);
        } else {
            this.echo("Scroll Timeout,reScroll times maxinum");
            SRCOLL_NUM = 0;
            PreOfLoaded = 0;
        }
    });

    casper.on('waitselector.timeout', function (self_PID) {

        this.echo("Wait for selector timeout");
        this.wait(1000);
        this.capture('./data/waitSelectorTimeout+' + Date.now() + '.png');
        socket.sendWs(0, "WTIMEOUT", self_PID);

    });

    casper.on('url.jumpout', function (self_PID) {
        this.echo("URL check incorrect,waiting");
        this.wait(1000);
        this.capture('./data/URLjumpout+' + Date.now() + '.png');
        socket.sendWs(0, "JUMPOUT", self_PID);
    });

    casper.on('message.none', function (self_PID) {
        socket.sendWs(0, "MSGNONE", self_PID);
        this.echo("Receive Msg length zero");
    });

    casper.on("remote.message", function (msg) {
        this.echo("Console: " + msg);
    });

    // http://docs.casperjs.org/en/latest/events-filters.html#page-error
    casper.on("page.error", function (msg, trace) {
        this.echo("Error: " + msg);
        // maybe make it a little fancier with the code from the PhantomJS equivalent
    });

    // http://docs.casperjs.org/en/latest/events-filters.html#resource-error
    casper.on("resource.error", function (resourceError) {
        this.echo("ResourceError: " + JSON.stringify(resourceError, undefined, 4));
    });

    // http://docs.casperjs.org/en/latest/events-filters.html#page-initialized
    casper.on("page.initialized", function (page) {
        // CasperJS doesn't provide `onResourceTimeout`, so it must be set through
        // the PhantomJS means. This is only possible when the page is initialized
        page.onResourceTimeout = function (request) {
            console.log('Response Timeout (#' + request.id + '): ' + JSON.stringify(request));
        };
    });
}
