// import {Controller, start} from './server.js'
const ser = require('./server.js')
Controller = ser.Controller
start = ser.start

class MySerever extends Controller{
  rpc_add(a,b, callback){callback(a+b)}
  watch_a(id){return r.table('a').get(id)}
}

start(MySerever)
