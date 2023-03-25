const launches = require('./launches.mongo');
const planets = require('./planets.mongo');
const axios = require('axios');

let DEFAULT_FLIGHT_NUMBER = 100;

/*const launch = {
    flightNumber: 100,                          //flight_number
    mission: 'Kepler Exploration X',            //name
    rocket: 'Explorer IS1',                     //rocket.name
    launchDate: new Date('28 December, 2025'),  //date_local
    target: 'Kepler-442 b',                     //not applicable
    customers: ['ZTM','NASA'],                  //payload.customers
    upcoming: true,                             //upcoming
    success: true,                              //success
};
saveLaunch(launch);*/

const SPACEX_URL = 'https://api.spacexdata.com/v4/launches/query'

async function populateLaunch(){
    console.log('Getting SpaceX missions');
    const response = await axios.post(SPACEX_URL,{
        query: {},
        options: {
        pagination: false,
        populate:[{
            path: 'rocket',
            select:{
                name:1
            }
        },
        {
            path: 'payloads',
            select:{
                customers:1
            }
        }
        ]
    }
    });

    if(response.status !== 200){
        throw new Error('Launch error')
    }

    const launchDocs = response.data.docs
    for(const launchDoc of launchDocs){
        const payloads = launchDoc['payloads']
        const customers = payloads.flatMap((payload) => {
            return payload['customers'];
        })

        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            customers,             
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
        }
    //console.log(`${launch.flightNumber} ${launch.mission}`)
    
    await saveLaunch(launch);                   //populate our database
    }
}

async function loadlaunchesData(){
    const firstLaunch = await findlaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat',
    })
    if(firstLaunch){
        console.log('Data already loaded');
    } else{
        populateLaunch();
    }
}

//updateOne({finding existing data},{data to be updated/inserted},{upsert = insert+update})
async function saveLaunch(launch){
    await launches.updateOne({
        flightNumber: launch.flightNumber
    },launch,
    {upsert: true});
}

async function getAllLaunches(skip, limit){
    return await launches.find({},{
        _id:0, __v:0,
    })
    .sort({ flightNumber: 1})
    .skip(skip)
    .limit(limit);
}

async function getLatestFlight(){
    const latestFlight = await launches.findOne()
    .sort('-flightNumber')        //sorting flight no. in descending order

    if(!latestFlight){
        return DEFAULT_FLIGHT_NUMBER;
    }
    return latestFlight.flightNumber;
}

async function setNewLaunch(launch){
    const planet = await planets.findOne({
        keplerName: launch.target,
    });

    if(!planet){
        throw new Error('No such planet exists')
    }

    const newFlightNumber = await getLatestFlight() + 1 
    Object.assign(launch,{
        flightNumber: newFlightNumber,
        success: true,
        upcoming: true,
        customers: ['ZTM','NASA'],
    });
    saveLaunch(launch);
}

async function findlaunch(filter){
    return await launches.findOne(filter);
}

async function existsLaunchbyId(id){
    return await findlaunch({
        flightNumber: id
    });
}

async function abortLaunchById(id){
    const aborted =  await launches.updateOne({
        flightNumber: id
    },Object.assign({
        upcoming: false,
        success: false,
    }));

    return aborted.modifiedCount === 1;
}

module.exports = {
    loadlaunchesData,
    getAllLaunches,
    setNewLaunch,
    existsLaunchbyId,
    abortLaunchById,
};