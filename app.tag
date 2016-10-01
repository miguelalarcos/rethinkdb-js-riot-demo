import {controller} from './client.js'

<app>
  <h1>1 + 2 = { variable }</h1>
  <h2>{ this.x }</h2>
  <button onclick={update_x}>+1</button>
  <script>
    this.x = 0

    controller.rpc('add',1,2).then((x)=>{
      this.variable = x
      this.update()
    }).done()

    controller.watch((change)=>{this.x=change.new_val.x; this.update()}, 'a')

    update_x(e){
      controller.rpc('update', 'a', '0', {x: this.x + 1})
    }

  </script>
</app>
