function GB2U(buf, serial, next) {
  next(buf);
}

GB2U.type = 'middleware';

module.exports = GB2U;
