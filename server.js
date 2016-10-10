r = require('rethinkdb')
express = require('express')
expressWs = require('express-ws')
let app = express()
expressWs(app)

index = '<body><app></app><script src="bundle.js"></script></body>'

class Controller{
  constructor(ws, conn){
    this.ws = ws
    this.conn = conn
    this.cursors = []
  }
  notify(msg){
    console.log(msg)
    msg = JSON.parse(msg)
    if(msg.method.startsWith('rpc_')){
      this.handle_rpc(msg.ticket, msg.method, msg.args)
    }
    else if (msg.method.startsWith('watch_')) {
      this.handle_watch(msg.ticket, msg.method, msg.args)
    }
  }
  handle_rpc(ticket, command, args){
    let ret = {ticket: ticket, response: 'rpc'}
    this[command](...args, (val)=>{ret.data=val; this.ws.send(JSON.stringify(ret))})
  }
  handle_watch(ticket, predicate, args){
    let ret = {ticket: ticket, response: 'watch'}
    let pred = this[predicate](...args)
    pred.changes({includeInitial: true}).run(this.conn, (err, cursor)=>{
      this.cursors.push(cursor)
      cursor.each((err, data)=>{ret.data=data; this.ws.send(JSON.stringify(ret))})
      // cursor.on('data', (change) => {ret.data=change; this.ws.send(JSON.stringify(ret))})
    })
  }
  rpc_insert(collection, doc, callback){
    r.table(collection).insert(doc).run(this.conn).then((doc)=>callback(doc.generated_keys[0]))
  }
  rpc_update(collection, id, doc, callback){
    r.table(collection).get(id).update(doc).run(this.conn).then((doc)=>callback(doc.replaced))
  }
  close(){for(let c of this.cursors){c.close()};console.log('close')}
}

const start = (CustomServer) =>{
  app.use(express.static('.'))

  app.get('/', function(req, res, next){
    res.send(index)
    res.end()
  });

  r.connect().then((conn)=>{
    app.ws('/', function(ws, req) {
      let server = new CustomServer(ws, conn)
      ws.on('message', function(msg) {
        server.notify(msg)
      })
      ws.on('close', ()=>{server.close(); server=null})
    })
  })

  app.listen(8000)
}

module.exports = {Controller: Controller, start: start}
