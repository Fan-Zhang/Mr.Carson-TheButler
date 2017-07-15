const express = require('express')
const app = express()

app.use(express.static('web'))

app.get('/hello', function (req, res) {
  res.send('Hello ' + req.query.name + '!')
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
