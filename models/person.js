const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('testi yhdistys', url)
mongoose.connect(url)
  .then(() => {
    console.log('yhdistäminen ok')
  })
  .catch((error) => {
    console.log('yhdistäminen ei ok', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true,
  },
  number: {
    type: String,
    validate: {
      validator: function(v){
        return /^\d{2,3}-\d{6,}$/.test(v)
      },
      message: props => `${props.value} is not a valid phone number`
    },
    required: [true, 'Phone number required']
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)