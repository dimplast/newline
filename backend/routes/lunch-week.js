var express = require('express')
var router = express.Router()
const knex = require('../database/client') 


const getLunchWeekList = () => {
  return knex.select().from('lunch_week').orderBy('week_of')
}

const getLunchWeekById = (id) => {
  return knex.select().from('lunch_week').where('lunch_week_id', id).first()
}

const createLunchWeek = (lunchWeek) => {
  return knex('lunch_week').insert(lunchWeek).returning('lunch_week_id')
}

const updateLunchWeek = (id, lunchWeek) => {
  console.log(lunchWeek)
  return knex('lunch_week').where('lunch_week_id', id).update(lunchWeek)
}

const deleteLunchWeek = (lunchWeekId) => {
  return knex('lunch_week').where('lunch_week_id', lunchWeekId).del()
}

const createLunchDay = (lunchDay) => {
  return knex('lunch_day').insert(lunchDay).returning('lunch_day_id')
}

const updateLunchDay = (lunchDayId, lunchDay) => {
  return knex('lunch_day').where('lunch_day_id', lunchDayId).update(lunchDay)
}

const getLunchDayList = (lunchWeekId) => {
  return knex.select().from('lunch_day').where('lunch_week_id', lunchWeekId)
}


router.get('/', async function (req, res) {
  try {
    const lunchWeekList = await getLunchWeekList()
    res.send(lunchWeekList)
  } catch (e) {
    const message = `Error getting Lunch Week List`
    res.status(500).send({ message: message, error: e.toString() })
  }
})

router.get('/:lunchWeekId', async function (req, res) {
  try {
    const id = parseInt(req.params.lunchWeekId)
    const lunchWeek = await getLunchWeekById(id)
    if (lunchWeek) {
      let lunchDays = await getLunchDayList(id) // fetch the lunch days list
      lunchWeek.lunchDays = lunchDays // set lunchDays as a property on the lunchWeek object
      res.send(lunchWeek)
    } else {
      const message = `Lunch Week Id ${req.params.lunchWeekId} not found`
      res.status(404).send({
        message: message,
      })
    }
  } catch (e) {
    const message = `Error getting Lunch Week Id ${req.params.lunchWeekId}`
    res.status(500).send({
      message: message,
      error: e.toString(),
    })
  }
})

router.post('/', async function (req, res) {
  const lunchWeek = req.body
  try {
    const insertResponse = await createLunchWeek(lunchWeek)
    const insertedLunchWeekId = insertResponse[0]
    const response = {
      lunchWeekId: insertedLunchWeekId,
    }
    res.send(response)
  } catch (e) {
    const message = `Error creating Lunch Week`
    res.status(500).send({ message: message, error: e.toString() })
  }
})

router.put('/:lunchWeekId', async function (req, res) {
  try {
    const id = parseInt(req.params.lunchWeekId)
    const lunchWeek = req.body

    if (id !== lunchWeek.lunchWeekId) {
      const message = `Bad request, IDs do not match`
      res.status(400).send({ message: message })
      // IMPORTANT, we need to explicitly return here, otherwise the rest
      // of the endpoint code will continue to run.
      // In other words, res.send does not return like you might think it would
      return
    }

    await updateLunchWeek(id, lunchWeek)
    res.send()
  } catch (e) {
    const message = `Error updating Lunch Week`
    res.status(500).send({ message: message, error: e.toString() })
  }
})

router.delete('/:lunchWeekId', async function (req, res) {
  try {
    const id = parseInt(req.params.lunchWeekId)
    await deleteLunchWeek(id)
    res.send()
  } catch (e) {
    const message = `Error deleting Lunch Week`
    res.status(500).send({ message: message, error: e.toString() })
  }
})

router.post('/:lunchWeekId/lunch-day', async function (req, res) {
  const lunchDay = req.body
  try {
    const insertResponse = await createLunchDay(lunchDay)
    const insertedLunchDayId = insertResponse[0]
    const response = {
      lunchDayId: insertedLunchDayId,
    }
    res.send(response)
  } catch (e) {
    const message = `Error creating Lunch Day`
    res.status(500).send({ message: message, error: e.toString() })
  }
})

router.put('/:lunchWeekId/lunch-day/:lunchDayId', async function (req, res) {
  try {
    const lunchDayId = parseInt(req.params.lunchDayId)
    const lunchDay = req.body

    if (lunchDayId !== lunchDay.lunchDayId) {
      const message = `Bad request, IDs do not match`
      res.status(400).send({ message: message })
      return
    }
    await updateLunchDay(lunchDayId, lunchDay)
    res.send()
  } catch (e) {
    const message = `Error updating Lunch Day`
    res.status(500).send({ message: message, error: e.toString() })
  }
})





/*const lunchWeekList = [
    {
      lunchWeekId: 1,
      weekOf: '2020-10-05',
      isPublished: true,
    },
    {
      lunchWeekId: 2,
      weekOf: '2020-10-12',
      isPublished: true,
    },
    {
      lunchWeekId: 3,
      weekOf: '2020-10-19',
      isPublished: false,
    },
  ]
*/


/*router.get('/', async function (req, res) {
    await new Promise((f) => setTimeout(f, 200)) // 0.2 second timeout
    res.send(lunchWeekList)
})*/



/*router.get('/:lunchWeekId', function (req, res) {
    // parameters are strings, so in some cases you may need to convert them to a different type
    const id = parseInt(req.params.lunchWeekId)
    // use the JS Array.prototype.find method to get the first matching entity from the list
    const lunchWeek = lunchWeekList.find((x) => x.lunchWeekId === id)
    if (lunchWeek) {
      res.send(lunchWeek)
    } else {
      res.status(404).send()
    }
  })
*/

module.exports = router