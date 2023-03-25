const { httpGetAllLaunches,
    httpSetNewLaunch,
    httpAbortLaunch } = require('./launches.controller');

const express = require('express');

const launchesRouter = express.Router();

launchesRouter.get('/',httpGetAllLaunches);
launchesRouter.post('/',httpSetNewLaunch);
launchesRouter.delete('/:id',httpAbortLaunch);

module.exports = launchesRouter;