const express = require('express')
const Amplitude = require('./dal/amplitude')
const app = express()
app.use(express.json());
const moment= require('moment')

const port = 3000


const getData = async (userId) => {
    const lastestDeviceIdUser = await Amplitude.findOne(
        {
            userId: userId,
            
        },
        {},
        {sort: { eventTime: -1 } }
    )

    const accounts =await  Amplitude.aggregate(
        [
          {
            $match: {
              deviceId: lastestDeviceIdUser.deviceId
            }
          },
          {
            $count: "count"
          }
        ]
      )
    return accounts[0].count
}

const findByUserIdAndRideIdAndEventType = async (userId, rideId, eventType) => {
    return Amplitude.findOne(
        {
            userId: userId,
            rideId: rideId,
            eventType: eventType
        },
        {},
        { sort: { eventTime: -1 } }
    ).select('_id loc eventTime userId').lean()
}
const findByUserIdAndTimeAndLocationExists = async (userId, fromDate, toDate) => {
    return Amplitude.find({
            userId: userId,
            eventTime: { $gte: fromDate, $lte: toDate },
            loc: { $exists: true, $ne: [] }
        },
        {},
        { sort: { eventTime: -1 } }
    ).select('_id loc eventTime').lean()
}

app.get('/', (req, res) => {
    res.send('Hello World!')
})
app.get('/amplitude', async (req, res) => {
    const amplitudes = await Amplitude.find({});
    res.send(amplitudes)
})

app.post('/amplitude', async (req, res) => {
    let body = req.body
    body.eventTime = body.eventTime

    const model = new Amplitude(body)
    model.save()
    console.log({ body })
    res.send('Done!')
})


app.post('/accounts', async (req, res) => {
    const fromDate = new Date(new Date().setDate(new Date().getDate() - parseInt(req.body.days)))
    console.log("fromDate: ", fromDate.toISOString())
    const count =  await getData(req.body.userId)

    res.send(count.toString())
})


app.post('/userCallCaptain', async (req, res) => {
    const body = req.body
    const data = await findByUserIdAndRideIdAndEventType(body.userId,body.rideId,body.eventType)
    res.send(data)
})

app.post('/userLocation', async (req, res) => {
    const body = req.body
    const fromDate = moment().add(-10, 'days');
    const toDate = moment('2022-02-08T00:47:05.130Z').add(10, 'days');

    console.log({fromDate},{toDate})

    const data = await findByUserIdAndTimeAndLocationExists(body.userId,fromDate,toDate)
    res.send(data)
})



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})