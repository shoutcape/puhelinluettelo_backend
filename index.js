require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person =require('./models/person')


const errorHandler = (error, request, response, next) => {
  console.log(error.message)
  if (error.name === 'CastError') {
    return response.status(404).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    console.log(error)
    return response.status(400).send({ error: error.message })
  }
  next(error)
}


app.use(cors())
app.use(express.json())
morgan.token('body', function (request, response) { return JSON.stringify(request.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(express.static('dist'))


let persons = []


app.get('/info', (request, response) => {
  const currentTime = new Date()
  response.send(`
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${currentTime}</p>
        `)
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
})

const generateNewId = () => {
  const random = Math.floor(Math.random() * 10000 + 1)
  return random
}

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  let nameFound = false

  Person.find({ name: body.name })
    .then(result => {
      nameFound = result.length>0
    })

  if (!body.name || !body.number ) {
    return response.status(400).json({
      error: 'no name or number'
    })
  }

  else if (nameFound){
    return response.status(400).json({
      error: 'name must be unique'
    })
  }

  const person =  new Person({
    name: body.name,
    number: body.number,
    id: generateNewId()
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { $set: { name, number } },
    { new: true, runValidators: true }
  )
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
  persons = persons.filter(person => person.id !== id)
  response.status(204).end()
})

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})