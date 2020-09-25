$(function () {
    $(".chat_on").click(function (e) {
        $(".Layout").css("display", "block"); //Open chat window
        $(".chat_on").hide(300);

        e.preventDefault();
        
        initalizeConnection();

    });
});

function initalizeConnection()  {
    
    //Provide "Spin up" animations for chat window
    $("#nav").css("width", "1063");
    $('#chatWrapper').hide();
    $("#section-chat").show("slide");
    $("#section-chat").draggable({
        handle: ".header-wrapper"
    });
    $("#divSpinner").fadeIn();

    //ToDo Eliminate the need for these by editing the Lambda function. Lex should collect all the needed info. 
    var customerName = "MyName";
    var username = "Username";

    console.log("this is the first name:" + customerName);
    console.log("this is the username: " + username);
    connect.ChatInterface.initiateChat({
        name: customerName,
        username: username,
        region: "us-east-1",
        apiGatewayEndpoint: "https://co2lb6vpgi.execute-api.us-east-1.amazonaws.com/Prod",
        contactAttributes: JSON.stringify({
            "customerName": customerName
        }),
        contactFlowId: "bd8bf79c-68f4-4d05-869e-056f958eb39f",
        instanceId: "dd3cb455-ab3e-4827-a079-1b86968ca2fb"
    }, successHandler, failureHandler)
}

function resetForm() {
    //$("#section-chat").removeAttr('style');
    $("#nav").css("width", "690");
    $("#section-chat").hide("slide");
    $(".Layout").css("display", "none"); //Close chat window
    $(".chat_on").show(300); //Reopen chat bubble
}

$(document).ready((a) => {
    connect.ChatInterface.init({
        containerId: 'root',
        headerConfig: {
            isHTML: true,
            render: () => {
                return  (`
                    <div class="header-wrapper">
                        <h2 class="welcome-text">Sales Chat</h2>
                        <p id="chatDescription">You can modify this header or use the default.</p>
                    </div>
                `)
            }
        }
    });
});

//Chat Management


function successHandler(chatSession) {
    window.chatSession = chatSession;

    // chat connected

    $("#divSpinner").fadeOut(200);
    $('#chatWrapper').fadeIn(400);

    //Change the incoming data set
    chatSession.incomingItemDecorator = function (item) {
        if (["SYSTEM_MESSAGE"].indexOf(item.displayName) !== -1) {
            item.displayName = "System Message";
        }

        if (chatSession.transcript.length > 0) {
            var transcriptItem = chatSession.transcript[chatSession.transcript.length - 1];
            if (transcriptItem.transportDetails.direction === "Incoming") {
                var chatDescription = "Please enquire about purchasing a health sharing plan.";
                var name = transcriptItem.displayName;
                if (["prod", "$LATEST", "AI Assistant", "SYSTEM_MESSAGE", "System Message"].indexOf(name) === -1) {
                    chatDescription = "You are now chatting with " + name;
                }
                document.getElementById("chatDescription").innerHTML = chatDescription;
            }
        }

        return item;
    }

    chatSession.onIncoming(function (data) {
        console.log("incoming message:|| " + JSON.stringify(data));
    });

    chatSession.onOutgoing(function (data) {
        //  console.log("outgoing message: " + JSON.stringify(data));
    });

    chatSession.onChatDisconnected(function (data) {
        resetForm();
    });

    connect.ChatInterface.init({
        containerId: 'root',
        headerConfig: {
            isHTML: true,
            render: () => {
                return  (`
                    <div class="header-wrapper">
                        <h2 class="welcome-text">DevOps Sales Bot</h2>
                        <p id="chatDescription">Buy our Healthcare plans today!</p>
                    </div>
                `)
            }
        }
    });
}

function failureHandler(error) {
    // chat failed
    console.log("failed", error);
    $(".Layout").css("display", "none"); //Close chat window
    $(".chat_on").show(300); //Open chat popup button
}

! function (l) {
    function e(e) {
        for (var r, t, n = e[0], o = e[1], u = e[2], f = 0, i = []; f < n.length; f++) t = n[f], p[
                t] &&
            i.push(
                p[t][0]), p[t] = 0;
        for (r in o) Object.prototype.hasOwnProperty.call(o, r) && (l[r] = o[r]);
        for (s && s(e); i.length;) i.shift()();
        return c.push.apply(c, u || []), a()
    }

    function a() {
        for (var e, r = 0; r < c.length; r++) {
            for (var t = c[r], n = !0, o = 1; o < t.length; o++) {
                var u = t[o];
                0 !== p[u] && (n = !1)
            }
            n && (c.splice(r--, 1), e = f(f.s = t[0]))
        }
        return e
    }
    var t = {},
        p = {
            1: 0
        },
        c = [];

    function f(e) {
        if (t[e]) return t[e].exports;
        var r = t[e] = {
            i: e,
            l: !1,
            exports: {}
        };
        return l[e].call(r.exports, r, r.exports, f), r.l = !0, r.exports
    }
    f.m = l, f.c = t, f.d = function (e, r, t) {
        f.o(e, r) || Object.defineProperty(e, r, {
            enumerable: !0,
            get: t
        })
    }, f.r = function (e) {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol
            .toStringTag, {
                value: "Module"
            }), Object.defineProperty(e, "__esModule", {
            value: !0
        })
    }, f.t = function (r, e) {
        if (1 & e && (r = f(r)), 8 & e) return r;
        if (4 & e && "object" == typeof r && r && r.__esModule) return r;
        var t = Object.create(null);
        if (f.r(t), Object.defineProperty(t, "default", {
                enumerable: !0,
                value: r
            }), 2 & e && "string" != typeof r)
            for (var n in r) f.d(t, n, function (e) {
                return r[e]
            }.bind(null, n));
        return t
    }, f.n = function (e) {
        var r = e && e.__esModule ? function () {
            return e.default
        } : function () {
            return e
        };
        return f.d(r, "a", r), r
    }, f.o = function (e, r) {
        return Object.prototype.hasOwnProperty.call(e, r)
    }, f.p = "./";
    var r = window.webpackJsonp = window.webpackJsonp || [],
        n = r.push.bind(r);
    r.push = e, r = r.slice();
    for (var o = 0; o < r.length; o++) e(r[o]);
    var s = n;
    a()
}([])