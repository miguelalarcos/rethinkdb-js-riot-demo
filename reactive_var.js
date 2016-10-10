export class RVar{
  // static ticket = 0

  constructor(value=null){
    this.value = value
    this.callbacks = {}
  }
  add(callback){
    t = RVar.ticket++
    this.callbacks[t] = callback
    return t
  }
  set(value){
    if(this.value != value){
      this.value = value
      for(key of this.callbacks.keys()){
        this.callbacks[key]()
      }
    }
  }
  static set(rvars){
    let callbacks = new Set()
    for(rvar of Object.keys(rvars)){
      rvar.value = rvars[rvar]
      for(c of rvar.callbacks){
        callbacks.add(c)
      }
    }
    for(c of callbacks){
      c()
    }
  }
  remove(ticket){
    delete this.callbacks[ticket]
  }
  static remove(rvs){
    for(key of Object.keys(rvs))
      rvs[key].remove(key)
  }
}

RVar.ticket = 0

export const reactive = (callback, ...args) => {
  let ret = {}
  for(let arg of args){
    // if(arg instanceof RVar)
    ret[arg.add(callback)] = arg
    }
  callback()
  return ret
}
