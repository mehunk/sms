/**
 * Created by fish on 2015/3/16.
 */
"use strict";
///<reference path='typings/node/node.d.ts' />
///<reference path='typings/bluebird/bluebird.d.ts' />
///<reference path='typings/mocha/mocha.d.ts' />
require("./global");
var assert = require("assert");
var Socket = require("./cmppSocket");
describe("cmppSocket Test", function () {
    var socket = new Socket({});
    describe("writeBuf test", function () {
        it("should write correct 8 bit int", function () {
            var buffer = new Buffer(10);
            var body = { test: 1 };
            socket.writeBuf(buffer, { name: "test", type: "number", length: 1 }, body);
            assert.equal(buffer[0], 1);
            assert.equal(body._length, 1);
            body.test = 255;
            socket.writeBuf(buffer, { name: "test", type: "number", length: 1 }, body);
            assert.equal(buffer[1], 255);
            assert.equal(body._length, 2);
        });
        it("should write correct 16 bit int", function () {
            var buffer = new Buffer(10);
            var body = { test: 256 };
            socket.writeBuf(buffer, { name: "test", type: "number", length: 2 }, body);
            assert.equal(buffer[0], 1);
            assert.equal(buffer[1], 0);
            assert.equal(body._length, 2);
        });
        it("should write correct string", function () {
            var buffer = new Buffer(10);
            buffer.fill(0);
            var body = { test: "tes" };
            socket.writeBuf(buffer, { name: "test", type: "string", length: 4 }, body);
            assert.equal(buffer[3], 0);
            assert.equal(body._length, 4);
            body.test = "test";
            socket.writeBuf(buffer, { name: "test", type: "string", length: 4 }, body);
            assert.equal(buffer[3], 0);
            assert.equal(body._length, 8);
        });
    });
    describe("getValue test", function () {
        it("should get correct 8 bit int", function () {
            var buffer = new Buffer(10);
            var body = { test: 1 };
            socket.writeBuf(buffer, { name: "test", type: "number", length: 1 }, body);
            body.test = 255;
            socket.writeBuf(buffer, { name: "test", type: "number", length: 1 }, body);
            body._length = 0;
            assert.equal(socket.getValue(buffer, { name: "test", type: "number", length: 1 }, body), 1);
            assert.equal(body._length, 1);
            assert.equal(socket.getValue(buffer, { name: "test", type: "number", length: 1 }, body), 255);
            assert.equal(body._length, 2);
        });
        it("should get correct 16 bit int", function () {
            var buffer = new Buffer(10);
            var body = { test: 1 };
            socket.writeBuf(buffer, { name: "test", type: "number", length: 2 }, body);
            body.test = 256;
            socket.writeBuf(buffer, { name: "test", type: "number", length: 2 }, body);
            body._length = 0;
            assert.equal(socket.getValue(buffer, { name: "test", type: "number", length: 2 }, body), 1);
            assert.equal(body._length, 2);
            assert.equal(socket.getValue(buffer, { name: "test", type: "number", length: 2 }, body), 256);
            assert.equal(body._length, 4);
        });
        it("should get correct string", function () {
            var buffer = new Buffer(10);
            buffer.fill(0);
            var body = { test: "tes" };
            socket.writeBuf(buffer, { name: "test", type: "string", length: 4 }, body);
            body.test = "test";
            socket.writeBuf(buffer, { name: "test", type: "string", length: 4 }, body);
            body._length = 0;
            assert.equal(socket.getValue(buffer, { name: "test", type: "string", length: 4 }, body), "tes");
            assert.equal(body._length, 4);
            assert.equal(socket.getValue(buffer, { name: "test", type: "string", length: 4 }, body), "test");
            assert.equal(body._length, 8);
        });
    });
});
