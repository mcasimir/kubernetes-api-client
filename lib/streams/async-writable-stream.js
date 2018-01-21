const {Writable} = require('stream');

class AsyncWritableStream extends Writable {
  constructor(write) {
    super({
      objectMode: true
    });
    this._writeFn = write;
  }

  _write(chunk, enc, next) {
    try {
      const res = this._writeFn(chunk);

      if (res && typeof res.then === 'function') {
        res
          .then(function() {
            next();
          })
          .catch(next);
        return;
      }

      next();
    } catch (e) {
      next(e);
    }
  }
}

module.exports = AsyncWritableStream;
