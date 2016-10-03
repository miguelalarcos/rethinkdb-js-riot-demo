r = require('rethinkdb')
express = require('express')
expressWs = require('express-ws')
let app = express()
expressWs(app)

index = '<body><app></app><script src="bundle.js"></script></body>'

let clients = []

class Controller{
  constructor(ws, conn){
    this.ws = ws
    this.conn = conn
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
  close(){console.log('close')}
}

class MySerever extends Controller{
  rpc_add(a,b, callback){callback(a+b)}
  watch_a(){return r.table('a')}
}

app.use(express.static('.'))

app.get('/', function(req, res, next){
  res.send(index)
  res.end()
});

r.connect().then((conn)=>{
  app.ws('/', function(ws, req) {
    clients.push(ws)
    server = new MySerever(ws, conn)
    ws.on('message', function(msg) {
      server.notify(msg)
    })
    ws.on('close', ()=>server.close())
  })
})

app.listen(8000)
