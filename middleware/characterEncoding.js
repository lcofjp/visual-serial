// Node.js Native encodings: utf8, ucs2 / utf16le, ascii, binary, base64, hex
// Unicode: UTF-16BE, UTF-16 (with BOM)
// Single-byte:
// Windows codepages: 874, 1250-1258 (aliases: cpXXX, winXXX, windowsXXX)
// ISO codepages: ISO-8859-1 - ISO-8859-16
// IBM codepages: 437, 737, 775, 808, 850, 852, 855-858, 860-866, 869, 922, 1046, 1124, 1125, 1129, 1133, 1161-1163 (aliases cpXXX, ibmXXX)
// Mac codepages: maccroatian, maccyrillic, macgreek, maciceland, macroman, macromania, macthai, macturkish, macukraine, maccenteuro, macintosh
// KOI8 codepages: koi8-r, koi8-u, koi8-ru, koi8-t
// Miscellaneous: armscii8, rk1048, tcvn, georgianacademy, georgianps, pt154, viscii, iso646cn, iso646jp, hproman8, tis620
// Multi-byte:
// Japanese: Shift_JIS, Windows-31j, Windows932, EUC-JP
// Chinese: GB2312, GBK, GB18030, Windows936, EUC-CN
// Korean: KS_C_5601, Windows949, EUC-KR
// Taiwan/Hong Kong: Big5, Big5-HKSCS, Windows950

const iconv = require('iconv-lite');

const supportedEncodings = [
  'UTF8', 'UTF-16', 'UTF-16BE', 'ascii', 'hex', 'base64', 'binary',
  'GB2312', 'GBK', 'GB18030', 'Windows936', 'EUC-CN',
  'ISO-8859-1', 'ISO-8859-2',
  'Big5', 'Big5-HKSCS', 'EUC-KR',
  'KS_C_5601', 'Windows949', 'EUC-KR',
  'Shift_JIS', 'Windows-31j', 'Windows932', 'EUC-JP',
];
function characterEncodeingConversion() {
  let from = 'UTF8', to = 'UTF8';

  function entry (buf, serial, next) {
    if (from === to) {
      next(buf, serial);
    }
    else {
      const str = iconv.decode(buf, from);
      const bufd = iconv.encode(str, to);
      next(bufd, serial);
    }
  }

  function getOptions() {
    return [
      { name: 'from', label: '源编码', type: 'select', values: supportedEncodings },
      { name: 'to', label: '目标编码', type: 'select', values: supportedEncodings },
      {
        type: 'text', content: `<span style="color: red;">注意：</span>只有对一串完整的数据进行编码转换才有意义，对离散的字节单位是无法正确编解码的，
        因此在使用此中间件前，要使用protocol或者timeout中间件对数据进行处理。`,
      },
    ];
  }
  function config(options) {
    const f = options.from, t = options.to;
    if (typeof f !== 'undefined' && f !== null && supportedEncodings.includes(f)) {
      from = f;
    }
    if (typeof t !== 'undefined' && t !== null && supportedEncodings.includes(t)) {
      to = t;
    }
  }
  function getConfig() {
    return {
      from,
      to,
    }
  }
  return {
    entry,
    getOptions,
    config,
    getConfig,
  }
}

characterEncodeingConversion.type = 'middleware';

module.exports = characterEncodeingConversion;
