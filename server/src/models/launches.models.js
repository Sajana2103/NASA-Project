const launchesDB = require('./launches.mongo')
const planets = require('./planets.mongo')
const axios = require('axios')


const DEFAULT_FLIGHT_NUMBER = 100


const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query'

async function populateLaunches(){
    console.log('Downloading launch data')
    const response = await axios.post(SPACEX_API_URL,{
        query : {},
        options : {
            pagination : false,
            populate : [
                {
                    path : 'rocket',
                    select : {
                        name : 1
                    }
                },
                {
                    path : 'payloads',
                    select : {
                        customers : 1
                    }
                }
            ]
        }
    })
    if(response.status !== 200){
        console.log('Problem with downloading data')
        throw new Error('Launch data downloading error')
    }
    const launchDocs = response.data.docs
    for (const launchDoc of launchDocs){
        const payloads = launchDoc['payloads']
        const customers = payloads.flatMap((payload) => {
            return payload['customers']
        })
        const launch = {
            flightNumber  : launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocketType: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'], //date_local
            customers: customers, //payload.customers for each payload
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
        }
        console.log(`${launch.flightNumber} - ${launch.mission} - ${launch.customers} ,`)

        saveLaunch(launch)
    }

}

async function loadLaunchData(){
    const firstLaunch = await findLaunch({
        flightNumber : 1,
        rocket : 'Falcon 1',
        mission : 'FalconSat'
    })
    if(firstLaunch){
        console.log('launch data already exsits')
        return
    } else {
        await populateLaunches()
    }
    
}
async function findLaunch(filter){
    return launchesDB.findOne(filter)
}

async function launchIdExist(LaunchId) {
    return await findLaunch({flightNumber : LaunchId})
}

async function getLatestFlightNumber() {
    const latestLaunch = await launchesDB
        .findOne()
        .sort('-flightNumber')

    if (!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER
    }
    return latestLaunch.flightNumber

}

async function getAllLaunches(skip,limit) {
    return await launchesDB.find({}, {
        '_id': 0,
        '__v': 0
    })
    .sort({ flightNumber : 1})
    .skip(skip)
    .limit(limit)
}

async function saveLaunch(launch) {

    await launchesDB.updateOne({
        flightNumber: launch.flightNumber,
    }, launch, {
        upsert: true
    })
    console.log('save launch :', launch)
}

async function scheduleNewLaunch(launch){
    const planet = await planets.findOne({
        keplerName: launch.target
    })
    if (!planet) {
        throw new Error('Planet not found..')
    }
    const newFlightNumber = await getLatestFlightNumber() +1
    const newLaunch = Object.assign(launch,{
        success : true,
        upcoming : true,
        customers : ['ZTM', "NASA"],
        flightNumber : newFlightNumber
    })
    console.log('new launch' ,newLaunch)
    await saveLaunch(newLaunch)
}

async function abortLaunchWithId(launchId) {
    const aborted = await launchesDB.updateOne({
        flightNumber : launchId
    },{
        upcoming : false,
        success : false
    })
    return aborted.ok === 1 && aborted.nModified ===1
}

module.exports = {
    getAllLaunches,
    scheduleNewLaunch,
    launchIdExist,
    abortLaunchWithId,
    loadLaunchData,
}