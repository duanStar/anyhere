const fs = require('fs');
const path = require('path');
const promisify = require('util').promisify;
const handleBars = require('handlebars');
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const mime = require('../helper/mime');
const compress = require('./compress');
const range = require('./range');
const isFresh = require('./cache');

const source = fs.readFileSync(path.resolve(__dirname, '../template/dir.tpl'));
const template = handleBars.compile(source.toString());

module.exports = async (req, res, filePath, conf) => {
    try {
        let stats = await stat(filePath);
        if (stats.isFile()) {
            const mimeType = mime(filePath);
            range(1000, req, res);
            res.setHeader('content-type', mimeType + ";charset=utf-8");
            if (isFresh(stats, req, res)){
                res.statusCode = 304;
                res.end();
                return;
            }
            let rs;
            const {code, start, end} = range(stats.size, req, res);
            if(code === 200){
                res.statusCode = 200;
                rs = fs.createReadStream(filePath);
            }else{
                res.statusCode = code;
                rs = fs.createReadStream(filePath, {
                    start,
                    end
                });
            }
            if (filePath.match(conf.compress)){
                rs = compress(rs, req, res);
            }
            rs.pipe(res);
        } else if (stats.isDirectory()) {
            let files = await readdir(filePath);
            res.statusCode = 200;
            res.setHeader('content-type', 'text/html');
            const data = {
                title: path.basename(filePath),
                dir: path.relative(conf.root, filePath) ? `/${path.relative(conf.root, filePath)}` : '',
                files: files.map(file => {
                    return {
                        file,
                        icon: mime(file)
                    }
                })
            };
            res.end(template(data));
            return;
        }
    } catch (error) {
        console.log(error);
        res.statusCode = 404;
        res.setHeader('content-type', 'text/plain');
        res.end(`${filePath} is not directory or file`);
        return;
    }
}