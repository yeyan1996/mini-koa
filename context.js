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
    if (WHILE_LIST.includes(key)) return context[key]
    if (reqGet.includes(key)) return context.request[key]
    if (resGet.includes(key)) return context.response[key]
    return Reflect.get(context,key)
}

function proxySet(context,key, value) {
    if (WHILE_LIST.includes(key)) return true

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


function handleCreateContext(req, res) {
    let context = {
        request: Object.create(request),
        response: Object.create(response),
    }

    context.req = request.req = response.req = req;
    context.res = request.res = response.res = res;

    return new Proxy(context, {
        get(target, key) {
            return proxyGet(target,key)
        },
        set(target, key, value) {
            return proxySet(target,key, value)
        }
    })
}


module.exports = handleCreateContext
