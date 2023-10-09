import { NodeInitializer, Node, NodeDef } from 'node-red';
import { Schema, Validator } from 'jsonschema'

function jsonSchemaValidate(validator: Validator, instance: any, schema: Schema) {
    try {
        const validation = validator.validate(instance, schema)

        if (!validation.errors.length)
            return true
        return validation.errors.map(validationError => ({ message: validationError.stack }))
    } catch (error) {
        console.log("Erro na validação");
    }
}

const initializer: NodeInitializer = function (RED) {
    function NodeConstructor(this: Node, config: NodeDef) {
        RED.nodes.createNode(this, config);

        const jsonSchemaValidator = new Validator()

        // To avoid confusion with the "this" object, you can attribute
        // its value to a local variable. In place of "this" you'd use
        // said variable.
        // const node = this;

        // Do something with the node when a new message is received
        this.on('input', (msg, send, done) => {
            const instance = msg.payload
            const schema = {
                "id": "/SimplePerson",
                "type": "object",
                properties: { "a": { type: "string" }, "b": { type: "string" } }
            }
            jsonSchemaValidate(jsonSchemaValidator, instance, schema)
            send(msg);
            done();
        });

        // Do something with the node when it's updated (e.g. when a new config is received)
        // or when it's deleted. Call done() when finished (particularly useful when doing
        // async work).
        this.on('close', (isDeleted: boolean, done: () => void) => {
            done();
        });
    }

    // Register the node constructor for the node type
    RED.nodes.registerType("name-of-your-node", NodeConstructor);
}

export = initializer;