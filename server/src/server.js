const http = require('http');
require('dotenv').config();

const app = require('./app');
const { startMongo } = require('./services/mongo');

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

const { loadAllPlanets } = require('./models/planets.model')
const { loadlaunchesData } = require('./models/launches.model')

async function startServer(){
    await startMongo();
    await loadAllPlanets();
    await loadlaunchesData();
    
    server.listen(PORT, () => {
        console.log(`Listening on ${PORT}`)
    });
}

startServer();
