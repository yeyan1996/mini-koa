const http = require("http")
const compose = require("./compose")
const handleCreateContext = require("./context")


class Koa{
    constructor() {
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
            let ctx = this.createContext(req,res)
            let fn = compose(this.middleware)
            fn(ctx).then(this.handleResponse(ctx)).catch(err=> console.log(err))
        }
    }
    handleResponse(ctx) {
        if (ctx.body) {
            ctx.res.end(JSON.stringify(ctx.body))
        }else{
            ctx.res.end()
        }
    }
    createContext(req,res) {
         return handleCreateContext(req,res)
    }
}

module.exports = Koa
