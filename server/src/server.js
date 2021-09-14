const http = require('http')
require('dotenv').config()
const {mongoConnect} = require('./services/mongoDB')
const {loadLaunchData} = require('./models/launches.models')

const app = require('./app.js')


const {loadPlanetsData} = require('./models/planets.models')

const PORT = process.env.PORT || 8000

const server = http.createServer(app)

async function startServer(){
    await mongoConnect()
    await loadPlanetsData()
    await loadLaunchData()

    server.listen(PORT, ()=> {
        console.log(`Server is listening on ${PORT}`)
})
}

startServer()