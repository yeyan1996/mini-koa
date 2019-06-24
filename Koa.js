const http = require("http")
const EventsEmitter =require("events")
const compose = require("./compose")
const handleCreateContext = require("./context")


class Koa extends EventsEmitter{
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
        return (req,res) =>{
            this.on('error',this.handleError)
            // 创建 ctx 对象
            let ctx = this.createContext(req,res)
            // 组合中间件
            let composedFunction = compose(this.middleware)
            composedFunction(ctx).then(this.handleResponse(ctx)).catch(this.handleError)
        }
    }
    // 根据 ctx.body 处理最终返回给前端的数据
    handleResponse(ctx) {
        // Todo 添加对文件流的处理
        if (ctx.body) {
            ctx.res.end(JSON.stringify(ctx.body))
        }else{
            ctx.res.end()
        }
    }
    createContext(req,res) {
         return handleCreateContext(req,res)
    }
    // Todo 错误处理
    handleError(err) {
        console.error(err)
    }
}

module.exports = Koa
