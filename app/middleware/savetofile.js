function save2file() {
  function entry(buf, serial, next) {
    next(buf);
  }
  function getOptions() {

  }
  function config() {

  }
  return {
    entry,
    getOptions,
    config,
  };
}
save2file.type = 'middleware';

module.exports = save2file;
