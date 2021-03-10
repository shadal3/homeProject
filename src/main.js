// main.js


//Required External Modules

const express = require('express');
const readline = require('readline')

//App Variables

const app = express();
const port = "8080";


/**
 *  App Configuration
 */

//Routes Definitions



function askQuestion(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    return new Promise((resolve, err) => {
        rl.question(question, (name) => {
            console.log(`hey there ${name}`);
            rl.close();
            resolve(name);
        })
    }).then((data) => console.log(data))
}
async function f1() {
    const ans = await askQuestion("HOW ARE YOU?");
}

f1();

app.get("/", (req, res) => {
    res.status(200).send("WHATABYTE: Food For Devs");
});

//Server Activation
app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});


/*
var app = express();
app.get('/', transducers);
app.get('/page', page);

console.log("Listening on port 4000...");
console.log("and this as well");
app.listen(4000);*/
