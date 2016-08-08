"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
require("./global");
var Socket = require("./cmppSocket");
var crypto = require('crypto');
var events = require("events");
var iconv = require('iconv-lite');
var md5 = crypto.createHash('md5');
var cmdCfg = require("./commandsConfig");
var Client = (function (_super) {
    __extends(Client, _super);
    function Client(config) {
        _super.call(this);
        this.config = config;
        this.contentLimit = 70;
        this.longSmsBufLimit = 140;
        this.sendingMobileCount = 0;
        this.deliverConst = ReportStat;
        _.defaults(config, require("./config"));
        this.socket = new Socket(config);
        this.bindEvent();
        this.clearMobileCount();
    }
    Client.prototype.connect = function (spId, secret) {
        var _this = this;
        if (this.socket.isReady)
            return Promise.resolve();
        this.spId = spId;
        return this.socket.connect(this.config.port, this.config.host).then(function () {
            return _this.socket.send(cmdCfg.Commands.CMPP_CONNECT, {
                Source_Addr: spId,
                AuthenticatorSource: _this.getAuthenticatorSource(spId, secret),
                Version: 0x30,
                Timestamp: parseInt(_this.getTimestamp())
            });
        });
    };
    Client.prototype.bindEvent = function () {
        var _this = this;
        this.socket.on("deliver", function (rst) {
            var body = rst.body;
            if (body.Registered_Delivery === 1) {
                _this.emit("deliver", body.Msg_Content["Dest_terminal_Id"], body.Msg_Content["Stat"]);
            }
            else {
                _this.emit("receive", body.Src_terminal_Id, body.Msg_Content);
            }
        });
        this.socket.on("terminated", function () {
            _this.emit("terminated");
        });
        this.socket.on("error", function (err) {
            _this.emit("error", err);
        });
    };
    //重置短信发送数量
    Client.prototype.clearMobileCount = function () {
        var _this = this;
        this.sendingMobileCount = 0;
        setTimeout(function () {
            _this.clearMobileCount();
        }, 1100);
    };
    Client.prototype.sendGroup = function (mobileList, content) {
        if (!this.socket.isReady)
            return Promise.reject(new Error("socket is not Ready"));
        if ((this.sendingMobileCount + mobileList.length) > this.config.mobilesPerSecond) {
            return Promise.reject(new Error("cmpp exceed max mobilesPerSecond[" + this.config.mobilesPerSecond + "], please retry later"));
        }
        this.sendingMobileCount += mobileList.length;
        var body = this.buildSubmitBody();
        var destBuffer = new Buffer(mobileList.length * 32);
        destBuffer.fill(0);
        mobileList.forEach(function (mobile, index) {
            destBuffer.write(mobile, index * 32, 32, "ascii");
        });
        body.DestUsr_tl = mobileList.length;
        body.Dest_terminal_Id = destBuffer;
        if (content.length > this.contentLimit) {
            return this.sendLongSms(body, content);
        }
        var buf = iconv.encode(content, 'utf16'); //new Buffer(content, "utf16");
        body.Msg_Length = buf.length;
        body.Msg_Content = buf;
        return this.socket.send(cmdCfg.Commands.CMPP_SUBMIT, body);
    };
    Client.prototype.sendLongSms = function (body, content) {
        var _this = this;
        var buf = new Buffer(content, "utf16");
        var bufSliceCount = this.longSmsBufLimit - 8;
        var splitCount = Math.ceil(buf.length / bufSliceCount);
        var tp_udhiHead_buf = new Buffer(7);
        tp_udhiHead_buf[0] = 6;
        tp_udhiHead_buf[1] = 8;
        tp_udhiHead_buf[2] = 4;
        tp_udhiHead_buf[3] = _.random(127);
        tp_udhiHead_buf[4] = _.random(127);
        tp_udhiHead_buf[5] = splitCount;
        var promiseList = [];
        _.times(splitCount, function (idx) {
            tp_udhiHead_buf[6] = idx + 1;
            body.TP_udhi = 1;
            body.Msg_Fmt = 8;
            body.Pk_total = splitCount;
            body.Pk_number = idx + 1;
            body.Msg_Content = Buffer.concat([tp_udhiHead_buf, buf.slice(bufSliceCount * idx, bufSliceCount * (idx + 1))]);
            body.Msg_Length = body.Msg_Content["length"];
            promiseList.push(_this.socket.send(cmdCfg.Commands.CMPP_SUBMIT, body));
        });
        return Promise.all(promiseList);
    };
    Client.prototype.send = function (mobile, content) {
        return this.sendGroup([mobile], content);
    };
    Client.prototype.buildSubmitBody = function () {
        return {
            Pk_total: 1,
            Pk_number: 1,
            Registered_Delivery: 1,
            Msg_level: 1,
            Service_Id: this.config.serviceId,
            Fee_UserType: 0, //原来是2
            Fee_terminal_Id: "",
            Fee_terminal_type: 0, //原来是1
            TP_pId: 0,
            TP_udhi: 0,
            Msg_Fmt: 8, //原来是15
            Msg_src: this.spId,
            FeeType: "01", //原来是03
            FeeCode: this.config.feeCode,
            ValId_Time: "",
            At_Time: "",
            Src_Id: this.config.srcId,
            DestUsr_tl: 1,
            Dest_terminal_Id: "",
            Dest_terminal_type: 0,
            Msg_Length: 0,
            Msg_Content: "",
            LinkID: ""
        };
    };
    Client.prototype.disconnect = function () {
        if (!this.socket.isReady)
            return Promise.resolve();
        return this.socket.disconnect();
    };
    Client.prototype.getAuthenticatorSource = function (spId, secret) {
        var buffer = new Buffer(31);
        buffer.fill(0);
        buffer.write(spId, 0, 6, "ascii");
        buffer.write(secret, 15, 21, "ascii");
        buffer.write(this.getTimestamp(), 21, 10, "ascii");
        md5.update(buffer);
        return md5.digest();
    };
    Client.prototype.getTimestamp = function () {
        return moment().format("MMDDHHmmss");
    };
    return Client;
}(events.EventEmitter));
var ReportStat = {
    DELIVERED: "DELIVRD",
    EXPIRED: "EXPIRED",
    DELETED: "DELETED",
    UNDELIVERABLE: "UNDELIV",
    ACCEPTED: "ACCEPTD",
    UNKONWN: "UNKNOWN",
    REJECTED: "REJECTD"
};
module.exports = Client;
