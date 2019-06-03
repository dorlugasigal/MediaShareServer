const express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    api = require('./api');

app.use(bodyParser.json({limit: '10mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));

const PORT = process.env.PORT || 1337;
app.listen(PORT, () => {
    console.log(`app started on port ${PORT}`);
});

app.use('/api', api);