const { getAllLaunches,
    setNewLaunch,
    existsLaunchbyId,
    abortLaunchById } = require('../../models/launches.model');

const { getPagination } = require('../../services/query');

async function httpGetAllLaunches(req, res){
    const { skip, limit } = getPagination(req.query);
    const launches = await getAllLaunches(skip, limit);

    return res.status(200).json(launches);
}

async function httpSetNewLaunch(req, res){
    const launch = req.body;

    if(!launch.mission || !launch.launchDate || !launch.target ||
        !launch.rocket){
            return res.status(400).json({
                error: "Missing required property"
            });
        }

    launch.launchDate = new Date(launch.launchDate);
    if(isNaN(launch.launchDate)){
        return res.status(400).json({
            error: "Invalid Date"
        });
    }
    await setNewLaunch(launch);

    return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res){
    const launchId = Number(req.params.id);

    const searchAbort = await existsLaunchbyId(launchId);
    if(!searchAbort){
        return res.status(400).json({
            error: "Launch does not exist"
        });
    }
    const aborted = await abortLaunchById(launchId);
    
    if(!aborted){
        return res.status(400).json({
            error: 'Launch not aborted!'
        });
    }
    return res.status(200).json({
        ok: 'true',
    })
}

module.exports = {
    httpGetAllLaunches,
    httpSetNewLaunch,
    httpAbortLaunch,
}