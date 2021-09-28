const request = require('supertest')
require('dotenv').config()
const {mongoConnect,mongoDisconnect} = require('../../services/mongoDB')
const app = require('../../app')

describe('Launches API' , () =>{
    const v1 = '/v1'
    beforeAll(async () => {
    
        await mongoConnect()
       
    })
    afterAll(async () => {
        await mongoDisconnect()
    })
    describe('Testing GET launches endpoint',() => {

        test('it should respond with 200 success', async()=> {
            const response = await request(app).get(`${v1}/launches`)
            .expect(200)
            .expect('Content-type' , /json/)
        })
    })
    describe('Testing POST endpoint at launches', ()=>{
        const completeLaunchData = {
            mission: "Kepler Exploration X",
            rocketType: "Explorer IS1",
            launchDate: "january 14, 2032",
            target: "Kepler-442 b"
        }
        const completeLauncWithoutDate = {
            mission: "Kepler Exploration X",
            rocketType: "Explorer IS1",
            target: "Kepler-442 b"
        }
        const launchDataWithInvalidDate = {
            mission: "Kepler Exploration X",
            rocketType: "Explorer IS1",
            launchDate: "hello22",
            target: "Kepler-442 b"
        }
        test('it should repond with 200 success', async () => {
            const response = await request(app)
            .post(`${v1}/launches`)
            .send(completeLaunchData)
            .expect(201)
            .expect('Content-type' , /json/)
    
            const requestDate = new Date(completeLaunchData.launchDate).valueOf()
            const responseDate = new Date(response.body.launchDate).valueOf()
            expect(responseDate).toBe(requestDate)
            
            expect(response.body).toMatchObject(completeLauncWithoutDate)
        })
        test('it should catch missing required properties',async () => {
            const response = await request(app)
            .post(`${v1}/launches`)
            .send(completeLauncWithoutDate)
            .expect('Content-type' , /json/)
            .expect(400)
    
            expect(response.body).toStrictEqual({
                error : 'All fields are required'
            })
        })
        test('it should catch invalid date propery',async () => {
            const response = await request(app)
            .post(`${v1}/launches`)
            .send(launchDataWithInvalidDate)
            .expect('Content-type' , /json/)
            .expect(400)
    
            expect(response.body).toStrictEqual({
                error : "You must enter a valid Date."
            })
        })
    })

})
