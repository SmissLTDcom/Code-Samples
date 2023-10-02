const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const {typicalMethods} = require('../db/modelHelpers/');
const {Schema} = mongoose;


function ModelFactory({structure, modelName, staticMethods = {}, postHook = [], methods = {}}) {

    const schema = new Schema(structure);

    schema.plugin(autoIncrement.plugin, {
        model: modelName,
        startAt: 1,
    });

    schema.statics = {
        ...typicalMethods,
        ...schema.statics,
        ...staticMethods
    };

    schema.methods = {
        ...schema.methods,
        ...methods
    };

    if (postHook.length !== 0) {
        /*
            postHook = [ { hookName, callback }  ]
        */
        postHook.forEach((postItem) => {
            schema.post(postItem.hookName, postItem.callback);
        });
    }

    return {schema, model: mongoose.model(modelName, schema)};
}

module.exports = ModelFactory;
