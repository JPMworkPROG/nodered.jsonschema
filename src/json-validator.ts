import { NodeInitializer, Node, NodeDef, util } from 'node-red';
import { Validator } from 'jsonschema'

function jsonSchemaValidate(validator: Validator, instance: any, schema: string): { isValid: boolean, errors: string[] } {
    try {
        const response = { isValid: true, errors: [] }
        const validation = validator.validate(instance, JSON.parse(schema))

        if (validation.errors.length) {
            response.isValid = false
            response.errors = validation.errors.map(validationError => (validationError.stack))
        }

        return response
    } catch (error) {
        console.log("Erro na validação");
    }
}

type NodeConfig = {
    name: string
    jsonSchemaConfigExternal: JsonSchemaConfigExternalNode
    jsonSchemaConfigNode: string,
    propertyMessageToValidateType: string,
    propertyMessageToValidate: string
} & NodeDef

type JsonSchemaConfigExternalNode = {
    name: string
    schema: string
}

const initializer: NodeInitializer = function (RED) {
    function NodeConstructor(this: Node, config: NodeConfig) {
        RED.nodes.createNode(this, config);
        const jsonSchemaConfigNode = (RED.nodes.getNode(config.jsonSchemaConfigNode) as unknown as JsonSchemaConfigExternalNode)

        config.jsonSchemaConfigExternal = {
            name: jsonSchemaConfigNode.name,
            schema: jsonSchemaConfigNode.schema
        }

        const jsonSchemaValidator = new Validator()

        // Do something with the node when a new message is received
        this.on('input', (msg, send, done) => {
            let instance = null
            if (config.propertyMessageToValidateType === "msg") {
                instance = util.getMessageProperty(msg, config.propertyMessageToValidate);
            } else if (config.propertyMessageToValidateType === "flow") {
                instance = this.context().flow.get(config.propertyMessageToValidate)
            } else {
                instance = this.context().global.get(config.propertyMessageToValidate)
            }

            if (instance) {
                const schema = config.jsonSchemaConfigExternal.schema
                const jsonValidated = jsonSchemaValidate(jsonSchemaValidator, instance, schema)

                if (jsonValidated.isValid)
                    send([null, msg])
                else {
                    msg["jsonValidationError"] = jsonValidated.errors
                    send([msg, null])
                }
                done();
            } else {
                this.error(`Property "${config.propertyMessageToValidate}" not found in ${config.propertyMessageToValidateType}.`)
            }
        });

        // Do something with the node when it's updated (e.g. when a new config is received)
        // or when it's deleted. Call done() when finished (particularly useful when doing
        // async work).
        this.on('close', (isDeleted: boolean, done: () => void) => {
            done();
        });
    }

    // Register the node constructor for the node type
    RED.nodes.registerType("json-validator", NodeConstructor);
}

export = initializer;