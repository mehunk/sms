"use strict";
(function (Commands) {
    Commands[Commands["CMPP_CONNECT"] = 1] = "CMPP_CONNECT";
    Commands[Commands["CMPP_CONNECT_RESP"] = 2147483649] = "CMPP_CONNECT_RESP";
    Commands[Commands["CMPP_SUBMIT"] = 4] = "CMPP_SUBMIT";
    Commands[Commands["CMPP_SUBMIT_RESP"] = 2147483652] = "CMPP_SUBMIT_RESP";
    Commands[Commands["CMPP_DELIVER"] = 5] = "CMPP_DELIVER";
    Commands[Commands["CMPP_DELIVER_RESP"] = 2147483653] = "CMPP_DELIVER_RESP";
    Commands[Commands["CMPP_ACTIVE_TEST"] = 8] = "CMPP_ACTIVE_TEST";
    Commands[Commands["CMPP_ACTIVE_TEST_RESP"] = 2147483656] = "CMPP_ACTIVE_TEST_RESP";
    Commands[Commands["CMPP_TERMINATE"] = 2] = "CMPP_TERMINATE";
    Commands[Commands["CMPP_TERMINATE_RESP"] = 2147483650] = "CMPP_TERMINATE_RESP";
})(exports.Commands || (exports.Commands = {}));
var Commands = exports.Commands;
(function (Errors) {
    Errors[Errors["消息结构错"] = 1] = "消息结构错";
    Errors[Errors["命令字错误"] = 2] = "命令字错误";
    Errors[Errors["消息序列号重复"] = 3] = "消息序列号重复";
    Errors[Errors["消息长度错"] = 4] = "消息长度错";
    Errors[Errors["资费代码错"] = 5] = "资费代码错";
    Errors[Errors["超过最大信息长"] = 6] = "超过最大信息长";
    Errors[Errors["业务代码错"] = 7] = "业务代码错";
    Errors[Errors["流量控制错"] = 8] = "流量控制错";
    Errors[Errors["本网关不负责此计费号码"] = 9] = "本网关不负责此计费号码";
    Errors[Errors["Src_ID错"] = 10] = "Src_ID错";
    Errors[Errors["Msg_src错"] = 11] = "Msg_src错";
    Errors[Errors["计费地址错"] = 12] = "计费地址错";
    Errors[Errors["目的地址错"] = 13] = "目的地址错";
    Errors[Errors["尚未建立连接"] = 51] = "尚未建立连接";
    Errors[Errors["尚未成功登录"] = 52] = "尚未成功登录";
    Errors[Errors["发送消息失败"] = 53] = "发送消息失败";
    Errors[Errors["超时未接收到响应消息"] = 54] = "超时未接收到响应消息";
    Errors[Errors["等待状态报告超时"] = 55] = "等待状态报告超时";
    Errors[Errors["有效时间已经过期"] = 61] = "有效时间已经过期";
    Errors[Errors["定时发送时间已经过期"] = 62] = "定时发送时间已经过期";
    Errors[Errors["不能识别的FeeType"] = 63] = "不能识别的FeeType";
    Errors[Errors["发送服务源地址鉴权失败"] = 64] = "发送服务源地址鉴权失败";
    Errors[Errors["发送服务目的地址鉴权失败"] = 65] = "发送服务目的地址鉴权失败";
    Errors[Errors["接收服务源地址鉴权失败"] = 66] = "接收服务源地址鉴权失败";
    Errors[Errors["接收服务目的地址鉴权失败"] = 67] = "接收服务目的地址鉴权失败";
    Errors[Errors["用户鉴权失败"] = 68] = "用户鉴权失败";
    Errors[Errors["此用户为黑名单用户"] = 69] = "此用户为黑名单用户";
    Errors[Errors["网络断连或目的设备关闭接口"] = 70] = "网络断连或目的设备关闭接口";
    Errors[Errors["超过最大节点数"] = 71] = "超过最大节点数";
    Errors[Errors["找不到路由"] = 72] = "找不到路由";
    Errors[Errors["等待应答超时"] = 73] = "等待应答超时";
    Errors[Errors["送SCP失败"] = 74] = "送SCP失败";
    Errors[Errors["送SCP鉴权等待应答超时"] = 75] = "送SCP鉴权等待应答超时";
    Errors[Errors["信息安全鉴权失败"] = 76] = "信息安全鉴权失败";
    Errors[Errors["超过最大Submit提交数"] = 77] = "超过最大Submit提交数";
    Errors[Errors["SPID为空"] = 78] = "SPID为空";
    Errors[Errors["业务类型为空"] = 79] = "业务类型为空";
    Errors[Errors["CPCode错误"] = 80] = "CPCode错误";
    Errors[Errors["发送接收接口重复"] = 81] = "发送接收接口重复";
    Errors[Errors["循环路由"] = 82] = "循环路由";
    Errors[Errors["超过接收侧短消息MTU"] = 83] = "超过接收侧短消息MTU";
    Errors[Errors["送DSMP重发失败"] = 84] = "送DSMP重发失败";
    Errors[Errors["DSMP系统忙重发"] = 85] = "DSMP系统忙重发";
    Errors[Errors["DSMP系统忙且缓存满重发"] = 86] = "DSMP系统忙且缓存满重发";
    Errors[Errors["DSMP流控重发"] = 87] = "DSMP流控重发";
    Errors[Errors["等DSMP应答超时重发"] = 88] = "等DSMP应答超时重发";
    Errors[Errors["非神州行预付费用户"] = 202] = "非神州行预付费用户";
    Errors[Errors["数据库操作失败"] = 203] = "数据库操作失败";
    Errors[Errors["移动用户帐户数据异常"] = 206] = "移动用户帐户数据异常";
    Errors[Errors["用户余额不足"] = 208] = "用户余额不足";
    Errors[Errors["超过最高欠费额"] = 210] = "超过最高欠费额";
    Errors[Errors["重复发送消息序列号msgid相同的计费请求消息"] = 215] = "重复发送消息序列号msgid相同的计费请求消息";
    Errors[Errors["SCP互联失败"] = 218] = "SCP互联失败";
    Errors[Errors["未登记的SP"] = 222] = "未登记的SP";
    Errors[Errors["月消费超额"] = 232] = "月消费超额";
    Errors[Errors["未定义"] = 241] = "未定义";
    Errors[Errors["消息队列满"] = 250] = "消息队列满";
})(exports.Errors || (exports.Errors = {}));
var Errors = exports.Errors;
(function (Status) {
    Status[Status["消息结构错"] = 1] = "消息结构错";
    Status[Status["非法源地址"] = 2] = "非法源地址";
    Status[Status["认证错"] = 3] = "认证错";
    Status[Status["版本太高"] = 4] = "版本太高";
    Status[Status["超过系统接口数"] = 55] = "超过系统接口数";
    Status[Status["超过帐号设置接口数"] = 56] = "超过帐号设置接口数";
    Status[Status["SP登陆IP错误"] = 57] = "SP登陆IP错误";
    Status[Status["创建soap处理线程失败"] = 58] = "创建soap处理线程失败";
    Status[Status["登陆帐号并非属于登陆的PROXY"] = 60] = "登陆帐号并非属于登陆的PROXY";
})(exports.Status || (exports.Status = {}));
var Status = exports.Status;
exports.CommandsDescription = {
    CMPP_CONNECT: [
        { name: "Source_Addr", type: "string", length: 6 },
        { name: "AuthenticatorSource", type: "buffer", length: 16 },
        { name: "Version", type: "number", length: 1 },
        { name: "Timestamp", type: "number", length: 4 }
    ],
    CMPP_CONNECT_RESP: [
        { name: "Status", type: "number", length: 4 },
        { name: "AuthenticatorSSP", type: "buffer", length: 16 },
        { name: "Version", type: "number", length: 1 }
    ],
    CMPP_SUBMIT: [
        { name: "Msg_Id", type: "buffer", length: 8 },
        { name: "Pk_total", type: "number", length: 1 },
        { name: "Pk_number", type: "number", length: 1 },
        { name: "Registered_Delivery", type: "number", length: 1 },
        { name: "Msg_level", type: "number", length: 1 },
        { name: "Service_Id", type: "string", length: 10 },
        { name: "Fee_UserType", type: "number", length: 1 },
        { name: "Fee_terminal_Id", type: "string", length: 32 },
        { name: "Fee_terminal_type", type: "number", length: 1 },
        { name: "TP_pId", type: "number", length: 1 },
        { name: "TP_udhi", type: "number", length: 1 },
        { name: "Msg_Fmt", type: "number", length: 1 },
        { name: "Msg_src", type: "string", length: 6 },
        { name: "FeeType", type: "string", length: 2 },
        { name: "FeeCode", type: "string", length: 6 },
        { name: "ValId_Time", type: "string", length: 17 },
        { name: "At_Time", type: "string", length: 17 },
        { name: "Src_Id", type: "string", length: 21 },
        { name: "DestUsr_tl", type: "number", length: 1 } // < 100
        ,
        { name: "Dest_terminal_Id", type: "string", length: function (obj) { return obj.DestUsr_tl * 32; } },
        { name: "Dest_terminal_type", type: "number", length: 1 },
        { name: "Msg_Length", type: "number", length: 1 } //<= 140
        ,
        { name: "Msg_Content", type: "buffer", length: function (obj) { return obj.Msg_Length; } },
        { name: "LinkID", type: "string", length: 20 } //留空，点播业务使用的LinkID
    ],
    CMPP_SUBMIT_RESP: [
        { name: "Msg_Id", type: "buffer", length: 8 },
        { name: "Result", type: "number", length: 4 }
    ],
    CMPP_DELIVER: [
        { name: "Msg_Id", type: "buffer", length: 8 },
        { name: "Dest_Id", type: "string", length: 21 },
        { name: "Service_Id", type: "string", length: 10 },
        { name: "TP_pid", type: "number", length: 1 },
        { name: "TP_udhi", type: "number", length: 1 },
        { name: "Msg_Fmt", type: "number", length: 1 },
        { name: "Src_terminal_Id", type: "string", length: 32 },
        { name: "Src_terminal_type", type: "number", length: 1 },
        { name: "Registered_Delivery", type: "number", length: 1 } //0 非状态报告 1 状态报告
        ,
        { name: "Msg_Length", type: "number", length: 1 },
        { name: "Msg_Content", type: "buffer", length: function (obj) { return obj.Msg_Length; } },
        { name: "LinkID", type: "string", length: 20 }
    ],
    CMPP_DELIVER_REPORT_CONTENT: [
        { name: "Msg_Id", type: "buffer", length: 8 },
        { name: "Stat", type: "string", length: 7 },
        { name: "Submit_time", type: "string", length: 10 },
        { name: "Done_time", type: "string", length: 10 },
        { name: "Dest_terminal_Id", type: "string", length: 32 },
        { name: "SMSC_sequence", type: "number", length: 4 }
    ],
    CMPP_DELIVER_RESP: [
        { name: "Msg_Id", type: "buffer", length: 8 },
        { name: "Result", type: "number", length: 4 }
    ]
};
