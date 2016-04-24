/**
 * Created by fish on 2015/3/13.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
///<reference path='typings/node/node.d.ts' />
///<reference path='typings/bluebird/bluebird.d.ts' />
///<reference path='typings/lodash/lodash.d.ts' />
var net = require("net");
var events = require("events");
var cmdCfg = require("./commandsConfig");
var iconv = require("iconv-lite");
iconv.extendNodeEncodings();
var CMPPSocket = (function (_super) {
    __extends(CMPPSocket, _super);
    function CMPPSocket(config) {
        _super.call(this);
        this.config = config;
        this.sequenceHolder = 1;
        this.headerLength = 12;
        this.sequencePromiseMap = {};
        this.isReady = false;
        this.heartbeatAttempts = 0;
    }
    CMPPSocket.prototype.handleHeartbeat = function () {
        var _this = this;
        if (this.isReady) {
            this.heartbeatAttempts++;
            if (this.heartbeatAttempts > this.config.heartbeatMaxAttempts) {
                this.disconnect();
                this.emit("terminated");
            }
            this.send(cmdCfg.Commands.CMPP_ACTIVE_TEST).then(function () {
                _this.heartbeatAttempts = 0;
            }).catch(function () { });
        }
        this.heartbeatHandle = setTimeout(function () {
            _this.handleHeartbeat();
        }, this.config.heartbeatInterval);
    };
    CMPPSocket.prototype.connect = function (port, host) {
        var _this = this;
        return this.connectSocket(port, host).then(function () {
            _this.handleHeartbeat();
            _this.isReady = true;
            _this.sequenceHolder = 1;
        }).catch(function (err) {
            console.error(err);
            _this.destroySocket();
        });
    };
    CMPPSocket.prototype.connectSocket = function (port, host) {
        var _this = this;
        if (this.isReady)
            return Promise.resolve();
        if (this.socket)
            return Promise.resolve();
        var deferred = Promise.defer();
        this.socket = new net.Socket();
        this.socket.on("data", function (buffer) {
            _this.handleData(buffer);
        });
        this.socket.on("error", function (err) {
            _this.emit("error", err);
            deferred.reject(err);
            _this.destroySocket();
        });
        this.socket.on("connect", function () {
            deferred.resolve();
        });
        this.socket.connect(port, host);
        return deferred.promise;
    };
    CMPPSocket.prototype.disconnect = function () {
        var _this = this;
        this.isReady = false;
        clearTimeout(this.heartbeatHandle);
        return this.send(cmdCfg.Commands.CMPP_TERMINATE).catch(function () { }).finally(function () {
            _this.destroySocket();
        });
    };
    CMPPSocket.prototype.destroySocket = function () {
        this.isReady = false;
        if (this.socket) {
            this.socket.end();
            this.socket.destroy();
            this.socket = undefined;
        }
    };
    CMPPSocket.prototype.handleData = function (buffer) {
        if (!this.bufferCache) {
            this.bufferCache = buffer;
        }
        else {
            this.bufferCache = Buffer.concat([this.bufferCache, buffer]);
        }
        var obj = { header: undefined, buffer: undefined };
        while (this.fetchData(obj)) {
            this.handleBuffer(obj.buffer, obj.header);
        }
    };
    CMPPSocket.prototype.fetchData = function (obj) {
        if (!obj)
            return false;
        if (this.bufferCache.length < 12)
            return false;
        obj.header = this.readHeader(this.bufferCache);
        if (this.bufferCache.length < obj.header.Total_Length)
            return false;
        obj.buffer = this.bufferCache.slice(0, obj.header.Total_Length);
        this.bufferCache = this.bufferCache.slice(obj.header.Total_Length);
        return true;
    };
    CMPPSocket.prototype.handleBuffer = function (buffer, header) {
        var _this = this;
        var body = this.readBody(header.Command_Id, buffer.slice(this.headerLength));
        if (header.Command_Id === cmdCfg.Commands.CMPP_TERMINATE) {
            this.emit("terminated");
            clearTimeout(this.heartbeatHandle);
            this.isReady = false;
            this.sendResponse(cmdCfg.Commands.CMPP_TERMINATE_RESP, header.Sequence_Id);
            Promise.delay(100).then(function () { _this.destroySocket(); });
            return;
        }
        if (header.Command_Id === cmdCfg.Commands.CMPP_DELIVER) {
            this.sendResponse(cmdCfg.Commands.CMPP_DELIVER_RESP, header.Sequence_Id, { Msg_Id: body.Msg_Id, Result: 0 });
            this.emit("deliver", { header: header, body: body });
            return;
        }
        if (header.Command_Id === cmdCfg.Commands.CMPP_ACTIVE_TEST) {
            this.sendResponse(cmdCfg.Commands.CMPP_ACTIVE_TEST_RESP, header.Sequence_Id);
            return;
        }
        if (this.isResponse(header.Command_Id)) {
            var promise = this.popPromise(header.Sequence_Id);
            if (!promise) {
                this.emit("error", new Error(cmdCfg.Commands[header.Command_Id] + ": resp has no promise handle it"));
                return;
            }
            clearTimeout(promise._timeoutHandle);
            if (this.hasError(body)) {
                var result = "result:" + (cmdCfg.Errors[body.Result] || body.Result);
                if (header.Command_Id === cmdCfg.Commands.CMPP_CONNECT_RESP)
                    result = "status:" + (cmdCfg.Status[body.Status] || body.Status);
                var msg = "command:" + cmdCfg.Commands[header.Command_Id] + " failed. result:" + result;
                promise.reject(new Error(msg));
            }
            else {
                promise.resolve({ header: header, body: body });
            }
            return;
        }
        this.emit("error", new Error(cmdCfg.Commands[header.Command_Id] + ": no handler found"));
        return;
    };
    CMPPSocket.prototype.sendResponse = function (command, sequence, body) {
        var buf = this.getBuf({ Sequence_Id: sequence, Command_Id: command }, body);
        this.socket.write(buf);
    };
    CMPPSocket.prototype.pushPromise = function (sequence, deferred) {
        if (!this.sequencePromiseMap[sequence])
            this.sequencePromiseMap[sequence] = deferred;
        else if (_.isArray(this.sequencePromiseMap[sequence]))
            this.sequencePromiseMap[sequence].push(deferred);
        else
            this.sequencePromiseMap[sequence] = [this.sequencePromiseMap[sequence], deferred];
    };
    CMPPSocket.prototype.popPromise = function (sequence) {
        if (!this.sequencePromiseMap[sequence])
            return;
        if (_.isArray(this.sequencePromiseMap[sequence])) {
            var promise = this.sequencePromiseMap[sequence].shift();
            if (_.isEmpty(this.sequencePromiseMap[sequence]))
                delete this.sequencePromiseMap[sequence];
            return promise;
        }
        var promise = this.sequencePromiseMap[sequence];
        delete this.sequencePromiseMap[sequence];
        return promise;
    };
    CMPPSocket.prototype.send = function (command, body) {
        var _this = this;
        if (body && body["Pk_number"] === 1) {
            this.sequenceHolder++;
        }
        var sequence = this.sequenceHolder;
        var buf = this.getBuf({ Sequence_Id: sequence, Command_Id: command }, body);
        this.socket.write(buf);
        var deferred = Promise.defer();
        this.pushPromise(sequence, deferred);
        var timeout = this.config.timeout;
        if (command === cmdCfg.Commands.CMPP_ACTIVE_TEST)
            timeout = this.config.heartbeatTimeout;
        deferred["_timeoutHandle"] = setTimeout(function () {
            if (command !== cmdCfg.Commands.CMPP_ACTIVE_TEST) {
                _this.emit("timeout");
            }
            var msg = "command:" + cmdCfg.Commands[command] + " timeout.";
            deferred.reject(new Error(msg));
        }, timeout);
        return deferred.promise;
    };
    CMPPSocket.prototype.getBuf = function (header, body) {
        header.Total_Length = this.headerLength;
        var headBuf, bodyBuf;
        if (body) {
            bodyBuf = this.getBodyBuffer(header.Command_Id, body);
            header.Total_Length += bodyBuf.length;
        }
        headBuf = this.getHeaderBuffer(header);
        if (bodyBuf)
            return Buffer.concat([headBuf, bodyBuf]);
        else
            return headBuf;
    };
    CMPPSocket.prototype.hasError = function (body) {
        return body.Status !== void 0 && body.Status > 0 || body.Result !== void 0 && body.Result > 0;
    };
    CMPPSocket.prototype.isResponse = function (Command_Id) {
        return Command_Id > 0x80000000;
    };
    CMPPSocket.prototype.readHeader = function (buffer) {
        var obj = {};
        obj.Total_Length = buffer.readUInt32BE(0);
        obj.Command_Id = buffer.readUInt32BE(4);
        obj.Sequence_Id = buffer.readUInt32BE(8);
        return obj;
    };
    CMPPSocket.prototype.getHeaderBuffer = function (header) {
        var buffer = new Buffer(this.headerLength);
        buffer.writeUInt32BE(header.Total_Length, 0);
        buffer.writeUInt32BE(header.Command_Id, 4);
        buffer.writeUInt32BE(header.Sequence_Id, 8);
        return buffer;
    };
    CMPPSocket.prototype.readBody = function (command, buffer) {
        var _this = this;
        var obj = {};
        var commandStr;
        if (_.isNumber(command))
            commandStr = cmdCfg.Commands[command];
        else
            commandStr = command;
        var commandDesp = cmdCfg.CommandsDescription[commandStr];
        if (!commandDesp)
            return obj;
        commandDesp.forEach(function (field) {
            obj[field.name] = _this.getValue(buffer, field, obj);
        });
        if (command === cmdCfg.Commands.CMPP_DELIVER) {
            if (obj.Registered_Delivery === 1) {
                obj.Msg_Content = this.readBody("CMPP_DELIVER_REPORT_CONTENT", obj.Msg_Content);
            }
            else {
                obj.Msg_Content = obj.Msg_Content.toString("gbk");
            }
        }
        return obj;
    };
    CMPPSocket.prototype.getBodyBuffer = function (command, body) {
        var _this = this;
        var buffer = new Buffer(1024 * 1024);
        buffer.fill(0);
        var commandStr = cmdCfg.Commands[command];
        var commandDesp = cmdCfg.CommandsDescription[commandStr];
        if (!commandDesp)
            return buffer.slice(0, 0);
        body._length = 0;
        commandDesp.forEach(function (field) {
            _this.writeBuf(buffer, field, body);
        });
        return buffer.slice(0, body._length);
    };
    CMPPSocket.prototype.getValue = function (buffer, field, obj) {
        var length = obj._length || 0;
        if (length >= buffer.length)
            return;
        var fieldLength = this.getLength(field, obj);
        obj._length = length + fieldLength;
        if (field.type === "number") {
            var bitLength = fieldLength * 8;
            var method = "readUInt" + bitLength + "BE";
            if (bitLength === 8)
                method = "readUInt" + bitLength;
            return buffer[method](length);
        }
        else if (field.type === "string") {
            var value = buffer.toString(field.encoding || "ascii", length, length + fieldLength);
            return value.replace(/\0+$/, '');
        }
        else if (field.type === "buffer") {
            return buffer.slice(length, length + fieldLength);
        }
    };
    CMPPSocket.prototype.writeBuf = function (buffer, field, body) {
        var length = body._length || 0;
        var fieldLength = this.getLength(field, body);
        var value = body[field.name];
        body._length = length + fieldLength;
        if (value instanceof Buffer) {
            value.copy(buffer, length, 0, fieldLength);
        }
        else {
            if (field.type === "number" && _.isNumber(value)) {
                var bitLength = fieldLength * 8;
                var method = "writeUInt" + bitLength + "BE";
                if (bitLength === 8)
                    method = "writeUInt" + bitLength;
                buffer[method](value, length);
            }
            else if (field.type === "string") {
                if (!value)
                    value = "";
                buffer.write(value, length, fieldLength, field.encoding || "ascii");
            }
        }
    };
    CMPPSocket.prototype.getLength = function (field, obj) {
        if (_.isFunction(field.length)) {
            return field.length(obj);
        }
        return field.length;
    };
    CMPPSocket.Commands = cmdCfg.Commands;
    return CMPPSocket;
}(events.EventEmitter));
module.exports = CMPPSocket;
