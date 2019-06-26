const request = require("./request")
const response = require("./response")

const WHILE_LIST = ['res', 'req', 'request', 'response']
const reqGet = [
    'header',
    'headers',
    'method',
    'url',
    'originalUrl',
    'origin',
    'href',
    'path',
    'query',
    'querystring',
    'host',
    'hostname',
    'fresh',
    'stale',
    'socket',
    'protocol',
    'secure',
    'ip',
    'ips',
    'subdomains',
    'is',
    'accepts',
    'acceptsEncodings',
    'acceptsCharsets',
    'acceptsLanguages',
    'get'
]
const reqSet = [
    'method',
    'url',
    'path',
    'query',
    'querystring',
]

const resGet = [
    'body',
    'status',
    'message',
    'length',
    'type',
    'headerSent',
    'redirect',
    'attachment',
    'set',
    'append',
    'remove',
]
const resSet = [
    'body',
    'status',
    'message',
    'length',
    'type',
    'lastModified',
    'etag',
]


function proxyGet(context,key) {
    // 设置白名单直接指向 request / response 对象
    if (WHILE_LIST.includes(key)) return context[key]

    // 否则指向 request / response 中的具体属性
    if (reqGet.includes(key)) return context.request[key]
    if (resGet.includes(key)) return context.response[key]
    return Reflect.get(context,key)
}

function proxySet(context,key, value) {
    // 防止修改 ctx.request / ctx.response
    if (WHILE_LIST.includes(key)) return false

    if (reqSet.includes(key)) {
        context.request[key] = value
        return true
    }
    if (resSet.includes(key)) {
        context.response[key] = value
        return true
    }
    return Reflect.set(context,key,value)
}

// 这里没有使用 koa 默认的 delegate 库做代理
// 而是通过 ES6 的 Proxy 代理 ctx 对象
// Todo 考虑使用 class 实例化 ctx 对象
function handleCreateContext(req, res) {

    let context = {
        request: Object.create(request),
        response: Object.create(response),
    }

    context.req = request.req = response.req = req;
    context.res = request.res = response.res = res;

    const ctx = new Proxy(context, {
        get(target, key) {
            return proxyGet(target,key)
        },
        set(target, key, value) {
            return proxySet(target,key, value)
        }
    })

    request.ctx = response.ctx = ctx

    // Todo 错误处理
    ctx.onerror = function (err) {
        console.error(err)
    }

    return ctx
}


module.exports = handleCreateContext
