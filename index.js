///<reference path='typings/node/node.d.ts' />
"use strict";
var Client = require("./client");
var client = new Client({});
client.on("receive", function (mobile, content) {
    console.log("receive", mobile, content);
});
client.on("deliver", function (mobile, stat) {
    console.log("deliver", mobile, stat);
});
client.on("error", function (err) {
    console.log("error", err);
});
client.on("terminated", function () {
    client.connect("spid", "secret");
});
client.connect("spid", "secret").then(function () {
    client.sendGroup(["136xxxxxx", "137xxxxx"], "这是一条测试群发短信").catch(function (err) {
        console.log(err);
    });
}).catch(function (err) {
    console.log(err);
});
