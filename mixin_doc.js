import riot from 'riot'
import {RVar, reactive} from './reactive_var.js'

export const getDocMixin = function(self){
  return DocMixin = {
    init: () => {
      self.on('unmount',(e)=>self._stop_watch())
    },
    watch: ()=> {
      self._rvs = reactive(()=>{
        if(self._stop_ticket){controller.stop_watch(self._stop_ticket)}
        self._stop_ticket = controller.watch((change)=>{
          // remove previous values of self
          for(let key of Object.keys(change.new_val)){
            if(key != 'id'){
              self[key] = change.new_val[key]
            }
          }
          self.update()
        }, self.collection, self.id.value)
      }, self.id)
    },
    _stop_watch: () =>{RVar.remove(self._rvs); controller.stop_watch(self._stop_ticket)},
    save: (doc) => {
      if((self.id instanceof RVar?self.id.value:self.id)==null){
      // if(self.id == null || self.id.value == null){
        controller.rpc('insert', self.collection, doc).then((id)=>self.id instanceof RVar?self.id.value = id: self.id = id)
      }
      else{
        controller.update(self.collection, self.id instanceof RVar? self.id.value: self.id, doc)
      }
    }
  }
}
//riot.mixin('DocMixin', DocMixin)
