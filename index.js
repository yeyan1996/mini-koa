const Koa = require("./Koa")
const path = require("path")
const fs = require("fs")
const cors = require("./middleware/cors")
const app = new Koa()


app.use(cors({
    withCredentials: true,
    exposeHeaders: 'content-type',
    allowHeaders: "content-type",
    maxAge: 1000 * 60 * 60
}))


app.use(async (ctx, next) => {
    // console.log(ctx.method)
    // console.log(ctx.query)
    await next()
})

app.use(async ctx => {
    ctx.res.setHeader('content-type','image/png')
    ctx.body = fs.readFileSync(path.join(__dirname, './assets/123.png'))
})

app.listen(3000, () => {
    console.log('mini-koa 正在启动，端口 3000')
})
