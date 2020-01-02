const mongoose = require('mongoose');

const ScoresSchema = mongoose.Schema({
email:{
    type: String,
    required: true
},
data:{
    type: Date,
    default: Date.now
},
time_millisecond:{
    type: Number,
    required: true
},
time_display:{
    type: String,
    required: true
    },
})

mongoose.model('scores' , ScoresSchema);