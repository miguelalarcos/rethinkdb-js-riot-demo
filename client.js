import Q from 'q'
import riot from 'riot'
import './app.tag'

class Controller{

  constructor(){
    this.ticket = 0
    this.promises = {}
    this.watches = {}
  }

  start(){
    this.ws = new WebSocket('ws://' + document.location.hostname + ':8000')
    this.ws.onopen = () => riot.mount('app')
    this.ws.onmessage = (e) => {console.log(e.data); this.notify(e.data)}
    this.ws.onclose = (e) => console.log(e)
    this.ws.onerror = (e) => console.log('error', e)
  }

  notify(msg){
    msg = JSON.parse(msg)
    let response = msg.response
    let ticket = msg.ticket
    let data = msg.data
    if(response == 'rpc'){
      this.promises[ticket].resolve(data)
      delete this.promises[ticket]
    }
    else if (response == 'watch') {
      const method = this.watches[ticket] //(data)
      if(method){method(data)}
    }
  }

  rpc(method, ...args){
    let t = this.ticket++
    let msg = {ticket: t, method: 'rpc_' + method, args: args}
    this.ws.send(JSON.stringify(msg))
    let deferred = Q.defer()
    this.promises[t] = deferred
    return deferred.promise
  }

  watch(callback, predicate, ...args){
    let t = this.ticket++
    let msg = {ticket: t, method: 'watch_' + predicate, args: args}
    this.ws.send(JSON.stringify(msg))
    this.watches[t] = callback
    return t
  }

  update(collection, id, doc){
      this.rpc('update', collection, id, doc)
  }
}

export const controller = new Controller()

export const start = ()=> controller.start()
