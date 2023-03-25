const request = require('supertest')
const app = require('../../app')
const { startMongo } = require('../../services/mongo');

describe('NASA API',() =>{
    beforeAll( async () => {
        await startMongo();
    });
    describe('Test GET /launches',() =>{
        test('should respond by 200',async () => {
            await request(app).get('/v1/launches')
            .expect('Content-Type', /json/)
            .expect(200)
        });
    });
    
    describe('Test POST /launches',() =>{
        const completeData = {
            mission: 'New Launch',
            rocket: 'Explorer IS1',
            launchDate: new Date('30 December, 2025'),
            target: 'Kepler-442 b',
        };
        const dataWithoutDate = {
            mission: 'New Launch',
            rocket: 'Explorer IS1',
            target: 'Kepler-442 b',
        };
        const dataWithInvalidDate = {
            mission: 'New Launch',
            rocket: 'Explorer IS1',
            launchDate: 'hello',
            target: 'Kepler-442 b',
        };
    
        test('should respond by 201',async () => {
            const response = await request(app).post('/v1/launches')
            .send(completeData)
            .expect('Content-Type', /json/)
            .expect(201)
    
            const responsedate = new Date(response.body.launchDate).valueOf();
            const requestdate = new Date(completeData.launchDate).valueOf();
            expect(responsedate).toBe(requestdate)
            expect(response.body).toMatchObject(dataWithoutDate)
        });
    
        test('should respond by 400',async () => {
            const response = await request(app).post('/v1/launches')
            .send(dataWithoutDate)
            .expect('Content-Type', /json/)
            .expect(400)
    
            expect(response.body).toStrictEqual({
                error: "Missing required property"
            })
        });
    
        test('should respond by 400',async () => {
            const response = await request(app).post('/v1/launches')
            .send(dataWithInvalidDate)
            .expect('Content-Type', /json/)
            .expect(400)
    
            expect(response.body).toStrictEqual({
                error: "Invalid Date"
            })
        });
    
    });
});
