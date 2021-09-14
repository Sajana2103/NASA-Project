const {getAllLaunches,
    scheduleNewLaunch,
    launchIdExist,
    abortLaunchWithId
} = require('../../models/launches.models')
const launchesRouter = require('./launches.router')
const getPagination = require('../../services/query')


async function httpGetAllLaunches(req,res){
   const {skip , limit} = await getPagination(req.query)
   const launches = await getAllLaunches(skip,limit)
   return res.status(200).json(launches)
}

async function httpAddNewLaunch(req,res){
    const launch = req.body

    if(!launch.mission || !launch.launchDate || !launch.rocketType || !launch.target){
        return res.status(400).json({
            error : 'All fields are required'
        })
    }

    launch.launchDate = new Date(launch.launchDate)
    if(isNaN(launch.launchDate)){
        return res.status(400).json({
            error : "You must enter a valid Date."
        })
    }
    await scheduleNewLaunch(launch)
    return res.status(201).json(launch)
}
async function httpAbortLaunch(req,res){
    const launchId = Number(req.params.id)
    console.log(launchId)
    const existsLaunch = await launchIdExist(launchId)
    if(!existsLaunch){
        return res.status(404).json({
            error : 'Launch id does not exists'
        })
    }

    const aborted = await abortLaunchWithId(launchId)
    if(!aborted){
        return res.status(400).json({
            error : 'Launch not aborted.'
        })
    }
    return res.status(200).json({
        ok : true
    })

}

module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch,
}