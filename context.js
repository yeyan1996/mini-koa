const request = require("./request")
const response = require("./response")
const createError = require('http-errors');

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
    'vary'
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


function proxyGet(context, key) {
    // 设置白名单直接指向 request / response 对象
    if (WHILE_LIST.includes(key)) return context[key]

    // 否则指向 request / response 中的具体属性
    if (reqGet.includes(key)) return context.request[key]
    if (resGet.includes(key)) return context.response[key]
    return Reflect.get(context, key)
}

function proxySet(context, key, value) {
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
    return Reflect.set(context, key, value)
}

// 这里没有使用 koa 默认的 delegate 库做代理
// 而是通过 ES6 的 Proxy 代理 ctx 对象
class Context {
    constructor(req, res) {
        this.request = Object.create(request)
        this.response = Object.create(response)
        this.req = request.req = response.req = req;
        this.res = request.res = response.res = res;
        request.ctx = response.ctx = this
        return new Proxy(this, {
            get(target, key) {
                return proxyGet(target, key)
            },
            set(target, key, value) {
                return proxySet(target, key, value)
            }
        })

    }

    onerror(err) {
        console.error(err)
        // 清空之前设置的所有 headers
        Object.keys(this.res.getHeaders()).forEach(key =>{
            this.res.removeHeader(key)
        })
        this.res.statusCode = err.statusCode || 500
        Object.keys(err.headers || {}).forEach(key=>{
            this.res.setHeader(key, err.headers[key])
        })

        // 将 content-type 变为 text 返回错误信息
        this.type = 'text'
        this.length = Buffer.byteLength(err.message);
        this.res.end(err.message)
    }

    throw(...args) {
        throw createError(...args);
    }
}

module.exports = Context
