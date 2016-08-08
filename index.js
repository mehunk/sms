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
    client.connect("150038", "150038");
});
client.connect("150038", "150038").then(function () {
    client.sendGroup(["1064845140001"], "终于TMD测试好，55555").catch(function (err) {
        console.log(err);
    });
}).catch(function (err) {
    console.log(err);
});
