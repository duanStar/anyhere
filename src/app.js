const http = require('http');
const chalk = require('chalk');
const path = require('path');
const conf = require('./config/defaultConfig');
const routes = require('./helper/routes');
const openUrl = require("./helper/openUrl");

class Server {
    constructor(config){
        this.conf = Object.assign({}, conf, config);
    }

    start(){
        const app = http.createServer((req, res) => {
            const filePath = path.resolve(this.conf.root, '.'+req.url);
            routes(req, res, filePath, this.conf);
        });
        
        app.listen(this.conf.port, conf.host, () => {
            const addr = `http://${this.conf.host}:${this.conf.port}`;
            console.log(`Server started at ${chalk.green(addr)}`);
            openUrl(addr);
        });
    }
}

module.exports = Server;
