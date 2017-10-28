const middleware = require('./middleware')

middleware.on('http:request', async function (ctx) {
  const promise = new Promise((resolve) => setTimeout(resolve, 1000))
  await promise

  ctx.header.task = 'async'
})

middleware.on('http:request', function () {
  this.flag = true
})

middleware.on('http:request', function * (ctx) {
  const promise = new Promise((resolve) => setTimeout(resolve, 1000))
  yield promise

  ctx.response = 'i am thinking'
})

middleware.on('http:request', function (ctx) {
  ctx.header.message = 'i am thinking'
})

async function request () {
  let ctx = {
    body: 'not found',
    status: 404,
    header: {}
  }

  let scope = {}

  await middleware.call('http:request', ctx, scope)

  console.log(ctx, scope)
}

request()
