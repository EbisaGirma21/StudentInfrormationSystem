const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({

    username: {
        type: String,


    },
    firstname: {
        type: String,


    },
    lastname: {
        type: String,


    },
    email: {
        type: String,


    },

    password: {
        type: String,
        default: "."


    },
    role: {
        type: String,
        enum: ['Doctor', 'Patient', 'Pharmacist', 'LabTech', 'CP', 'Manager', 'Admin'],
        default: 'Admin'


    },

    password: {
        type: String


    },
    address: {
        type: String,


    },
    contact: {
        type: String,


    },
    gender: {
        type: String,
        enum:['Male','Female']


    },
    account: {
        type: String,
        default: "Not Created"
     


    },
    code: {
        type: Number,

    },
    history: {
        type: String,
        default: '.'

    },
    pid: {
        type: String,


    },


    department: {
        type: String,

    },
    age: {
        type: Number,

    },





    image: {
        type: Object,


    }

}, {
    timestamps: true
})
module.exports = mongoose.model('users', userSchema)