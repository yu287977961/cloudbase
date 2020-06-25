module.exports = {
    envId: "env-wosjodal",
    functionRoot: "./cloudfunctions",
    functions: [
        // 此函数配置仅供参考，你需要创建一个 app 函数
        {
            name: "login",
            // 超时时间
            timeout: 5,
            // 运行时
            runtime: "Nodejs10.15",
            // 内存
            memorySize: 128,
            // 文件
            handler: "index.main",
        },
    ],
};