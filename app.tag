import {getDocMixin} from './mixin_doc.js'
import {controller} from './client.js'
import {RVar} from './reactive_var.js'

<app>
  <h1>1 + 2 = { variable }</h1>
  <h2>{ x }</h2>
  <button onclick={update_x}>+1</button>
  <script>
    // this.mixin('DocMixin')
    this.mixin(getDocMixin(this))
    this.collection = 'a'
    this.id = new RVar('0') // opts.rvar_id
    this.watch()

    update_x(e){this.save({x: this.x + 1})}

    controller.rpc('add',1,2).then((x)=>{
      this.variable = x
      this.update()
    }).done()

  </script>
</app>
