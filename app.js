const express = require('express');
const path = require('path');
const logger = require('morgan');

const app = express();
const port = process.env.PORT || 3000


app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));


app.listen(port, () => console.log(`server listening on ${port}`))