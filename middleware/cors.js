const DEFAULT = {
    allowMethod: 'GET,POST,PUT,DELETE'
}

module.exports = function cors(options = {}) {
    return async function (ctx, next) {
        options = {
            ...DEFAULT,
            ...options
        }

        let origin = options.origin || ctx.req.headers.origin
        if (!origin) return await next()
        ctx.res.setHeader('Access-Control-Allow-Origin', origin)
        ctx.res.setHeader('Access-Control-Allow-Method', options.allowMethod)
        ctx.res.setHeader('Access-Control-Allow-Headers', options.allowHeaders)
        ctx.res.setHeader('Access-Control-Allow-Expose-Headers', options.exposeHeaders)
        ctx.res.setHeader('Access-Control-Allow-Credentials', !!options.withCredentials)
        options.maxAge && ctx.res.setHeader('Access-Control-Max-Age', String(options.maxAge))

        if (ctx.req.method === 'OPTIONS') {
            ctx.res.statusCode = 204
            return
        }
        await next()
    }
}
