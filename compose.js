module.exports =  function (middleware) {
    return  async function (ctx) {
       async function dispatch(index) {
           if (index === middleware.length) return
           let mid = middleware[index]
           await Promise.resolve(mid(ctx, () => dispatch(index+1)))
       }
       return dispatch(0)
   }
}
