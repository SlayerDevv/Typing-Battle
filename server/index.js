const express = require('express');
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const helmet = require('helmet');
const port = 3000
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());

app.get('/', (req, res) => {
    res.send('Hello World!')
    }
)

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})