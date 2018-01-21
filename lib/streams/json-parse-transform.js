const {Transform} = require('stream');

class JsonParseTransform extends Transform {
  constructor() {
    super({
      readableObjectMode: true,
      writableObjectMode: true
    });
  }

  _transform(data, enc, next) {
    let obj = null;

    try {
      obj = JSON.parse(data);
    } catch (e) {
      //
    }

    if (obj) {
      this.push(obj);
    }

    next();
  }
}

module.exports = JsonParseTransform;
