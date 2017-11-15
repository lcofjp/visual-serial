import fs from 'fs';
import path from 'path';
import R from 'ramda';
import _ from 'lodash';

const middlewareFactoryMap = new Map();

// 扫描midlleware文件夹，返回其中的js文件和文件夹
function scanMiddlewareDir(dirname) {
  if (fs.existsSync(dirname)) {
    const files = fs.readdirSync(dirname);
    return _(files).filter(v => {
      const stats = fs.statSync(path.join(dirname, v));
      if (stats.isDirectory()) {
        if (fs.existsSync(path.join(dirname, v, 'index.html'))){
          return true;
        }
      } else {
        if (path.extname(v).toLowerCase() === '.js') {
          return true;
        }
      }
      return false;
    }).map(v => {
      const stats = fs.statSync(path.join(dirname, v));
      if (stats.isFile()) {
        return {type: 'js', name: v};
      } else if (stats.isDirectory()) {
        return {type: 'dir', name: v};
      }
    }).value();
  } else {
    return [];
  }
}
// import middleware => [mwConstructor1, Constructor2...]
export function importMiddleware() {
  const middlewareDir = path.join(__dirname, 'middleware');
  console.log(__dirname, middlewareDir);
  // middlewareFactoryMap
  const mws = scanMiddlewareDir('./middleware');
  const cons = R.map(v => {
    if (v.type === 'js') {
      const factory = global.module.require('./'+path.join('middleware', v.name));
      return {
        factory,
        name: path.basename(v.name, path.extname(v.name)),
        type: factory.type,
      }
    }
    else if (v.type === 'dir') {
      return {
        path: path.join(middlewareDir, v.name, 'index.html'),
        name: v.name,
        type: 'widget',
      }
    }
  }, mws);
  R.map(o => {
    middlewareFactoryMap.set(o.name, o);
  }, cons);
  return middlewareFactoryMap;
}
