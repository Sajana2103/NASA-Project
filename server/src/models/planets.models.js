const parse = require('csv-parse')
const fs = require('fs')

const planets = require('./planets.mongo')

const isHabitable = (planet) => {
    return planet['koi_disposition'] === 'CONFIRMED' && planet['koi_insol'] > 0.36 && 
    planet['koi_insol'] < 1.11 && planet['koi_prad'] < 1.6
}


function loadPlanetsData(){
    return new Promise((resolve,reject) => {
        fs.createReadStream('src/models/kepler_data.csv')
    .pipe(parse({
        comment : '#',
        columns : true
    }))
    .on('data',async (data) => {
        if(isHabitable(data)) {
        await savePlanet(data)
    }
})
    .on('error', (error) => {
        console.log(error)
        reject(error)
    })
    .on('end', async() => {
        
        const countPlanets = (await getAllPlanets())
        console.log('example planet : ', countPlanets[0])
        console.log(`we found ${countPlanets.length} that are habitable.`)
        console.log('-------END OF THE STREAM--------')
        resolve()
    })
})
}
async function getAllPlanets(){
    return await planets.find({},{
        '_id' : 0, '__v' :0
    })
}

async function savePlanet(planet){
    try{
        await planets.updateOne({
            keplerName : planet.kepler_name
        },{
            keplerName : planet.kepler_name
        },{
            upsert : true
        })
    } catch(error){
        console.error(`Could not save the planet ${error}`)
    }
}


module.exports = {
    loadPlanetsData,
    getAllPlanets
}