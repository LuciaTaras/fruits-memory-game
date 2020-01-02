const mongoose = require('mongoose');

const UsersSchema = mongoose.Schema({
nome:{
    type: String,
    required: true
},
email:{
   type: String,
   required: true,
   unique: true
},
data:{
    type: Date,
    default: Date.now
},
best_time_millisecond:{
    type: Number,
    required: true
},
best_time_display:{
    type: String,
    required: true
    },
})

mongoose.model('users' , UsersSchema);