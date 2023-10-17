import { NodeInitializer, Node, NodeDef } from 'node-red';

const initializer: NodeInitializer = function (RED) {
   function NodeConstructor(this: Node & { schema: any }, config: NodeDef & { schema: any }) {
      RED.nodes.createNode(this, config);

      this.schema = config.schema

      this.on('input', (msg, send, done) => {
         send(msg);
         done();
      });

      this.on('close', (isDeleted: boolean, done: () => void) => {
         done();
      });
   }

   // Register the node constructor for the node type
   RED.nodes.registerType("json-schema", NodeConstructor);
}

export = initializer;