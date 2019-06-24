const Koa = require("./Koa")
const app = new Koa()

app.use(async (ctx,next)=>{
    console.log(ctx.method)
    console.log(ctx.query)
    await next()
})

app.use(async ctx=>{
    ctx.body = {a:1}
})

app.listen(3000,()=>{
    console.log('mini-koa 正在启动')
})
