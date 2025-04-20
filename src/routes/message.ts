const express = require('express')
const app = express()

// respond with "hello world" when a GET request is made to the homepage
app.get('/', (req: any, res: { send: (arg0: string) => void }) => {
  res.send('hello world')
})