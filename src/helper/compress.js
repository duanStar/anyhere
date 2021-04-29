const {createGzip, createDeflate} = require('zlib');

module.exports = (rs, req, res) => {
    const acceptEncoding = req.headers['accept-encoding'];
    if (!acceptEncoding || !acceptEncoding.match(/\b(gzip|deflate)\b/)){
        return rs;
    }else if (acceptEncoding.match(/\b(gzip)\b/)){
        const gzip = createGzip();
        res.setHeader('content-encoding', 'gzip');
        return rs.pipe(gzip);
    }else if (acceptEncoding.match(/\b(deflate)\b/)){
        const deflate = createDeflate();
        res.setHeader('content-encoding', 'deflate');
        return rs.pipe(deflate);
    }
}