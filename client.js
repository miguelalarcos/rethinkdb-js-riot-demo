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
    this.ws = new WebSocket('ws://' + document.location.hostname + ':3000')
    this.ws.onopen = () => riot.mount('app')
    this.ws.onmessage = (e) => this.notify(e.data)
  }

  notify(msg){
    msg = JSON.parse(msg)
    response = msg['response']
    ticket = msg['ticket']
    value = msg['value']
    change = msg.change
    if(response == 'rpc'){
      this.promises[ticket].resolve(value)
      delete this.promises[ticket]
    }
    else if (response == 'watch') {
      this.watches[ticket](change)
    }
  }

  rpc(method, ...args){
    t = this.ticket++
    msg = {ticket: t, method: 'rpc_' + method, args: args}
    this.ws.send(JSON.stringify(msg))
    deferred = Q.defer()
    this.promises[t] = deferred
    return deferred.promise
  }

  watch(callback, predicate, ...args){
    t = this.ticket++
    msg = {ticket: t, method: 'watch_' + predicate, args: args}
    this.ws.send(JSON.stringify(msg))
    this.watches[t] = callback
  }
}

export const controller = new Controller()
