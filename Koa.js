const http = require("http")
const EventsEmitter = require("events")
const compose = require("./compose")
const handleCreateContext = require("./context")
const Stream = require('stream');

class Koa extends EventsEmitter {
    constructor() {
        super()
        // 保存中间件的数组
        this.middleware = []
    }

    use(mid) {
        this.middleware.push(mid)
    }

    listen(...args) {
        let server = http.createServer(this.callback())
        server.listen(...args)
    }

    callback() {
        return async (req, res) => {
            this.on('error', this.handleError)
            // 创建 ctx 对象
            let ctx = handleCreateContext(req, res)
            // 组合中间件
            let composedFunction = compose(this.middleware)
            try {
                await composedFunction(ctx)
                this.handleResponse(ctx)
            } catch (e) {
                this.handleError(e)
            }
        }
    }

    // 根据 ctx.body 处理最终返回给前端的数据
    handleResponse(ctx) {
        if (!ctx.body) return ctx.res.end()
        if (ctx.body instanceof Stream) return ctx.body.pipe(ctx.res) // 文件流
        if(ctx.body instanceof Buffer) return ctx.res.end(ctx.body) // Buffer
        ctx.res.end(JSON.stringify(ctx.body))

    }


    // Todo 错误处理
    handleError(err) {
        console.error(err)
    }
}

module.exports = Koa
