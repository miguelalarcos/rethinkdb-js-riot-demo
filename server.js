r = require('rethinkdb')
express = require('express')
expressWs = require('express-ws')
let app = express()
expressWs(app)

index = '<body><app></app><script src="bundle.js"></script></body>'

class Controller{
  constructor(send, conn){
    this.send = send
    this.conn = conn
  }
  notify(msg){
    console.log(msg)
    msg = JSON.parse(msg)
    if(msg.command.startsWith('rpc_')){
      handle_rpc(msg.ticket, msg.command, msg.args)
    }
    else if (msg.command.startsWith('watch_')) {
      handle_watch(msg.ticket, msg.predicate, msg.args)
    }
  }
  handle_rpc(ticket, command, args){
    ret = {ticket: ticket, response: 'rpc'}
    this[command](...args, (val)=>{ret.value=val; this.send(JSON.stringify(ret))})
  }
  handle_watch(ticket, predicate, args){
    ret = {ticket: ticket, response: 'watch'}
    pred = this[predicate](...args)
    pred.changes().run(this.conn, (err, cursor)=>{
        cursor.on('data', (change) => ret.change=change; this.send(JSON.stringify(ret)))
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
  watch_a(){r.table('a')}
}

app.get('/', function(req, res, next){
  res.send(index)
  res.end()
});

app.ws('/', function(ws, req) {
  server = new MySerever(ws.send, conn)
  ws.on('message', function(msg) {
    server.notify(msg)
  })
  ws.on('close', ()=>server.close())
})

app.listen(8000)
