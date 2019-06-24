# mini-koa
一个简易的 koa 框架

koa 的核心在于
1. koa 中间件
2. ctx 对象
3. 封装原生的 req,res 对象


koa 框架使用 delegate 库作代理

例如调用 ctx.path 会直接指向 ctx.request.path，而 ctx.request.path 经过 koa 的一层封装最终会指向原生的 req.pathname

而我采用 ES6 的 Proxy 实现 ctx 的代理，可以实现相同的功能
