const app = require('./app.js');

const port = process.env.PORT || 5000;

app.listen(port, (err) => {
    if (err) {
        return console.log("something bad happened", err)
    }
});