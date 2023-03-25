const { parse } = require('csv-parse');
const path = require('path');
const fs = require('fs');
const planets = require('./planets.mongo');

function isHabitable(planet){
    return planet['koi_disposition'] === 'CONFIRMED' &&
    planet['koi_prad'] <1.6 &&
    planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11;
}


function loadAllPlanets(){
    return new Promise((resolve, reject) => {
        const savedPlanets = [];
    fs.createReadStream(path.join(__dirname,'..','..','data','kepler_data.csv'))
    .pipe(parse({
        comment: '#',
        columns: true,
    }))
    .on('data',(data) =>{
        if(isHabitable(data)){
            savedPlanets.push(savePlanets(data));
        }
    })
    .on('error',(err) =>{
        reject(err);
    })
    .on('end', async () => {
        Promise.allSettled(savedPlanets)
        .then(() => {
        const countPlanets = savedPlanets.length;
        console.log(`${countPlanets} no. of habitable planets`);
        resolve();
    });
    });
});
}

async function getAllPlanets(){
    return await planets.find({},{
        _id:0, __v:0,
    });
}
async function savePlanets(planet){
    try{
        await planets.updateOne({
            keplerName: planet.kepler_name,
        },{
            keplerName: planet.kepler_name,
        },{
            upsert: true,
        });
    }catch(err){
        console.error(err)
    }
}
module.exports = {
    loadAllPlanets,
    getAllPlanets,
};