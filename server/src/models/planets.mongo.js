const mongoose = require('mongoose')

const planetsSchema = new mongoose.Schema({
    keplerName:{
        type: String,
        required: true,
    }
});

//mongoose will change Planet to planets
module.exports = mongoose.model('Planet',planetsSchema)