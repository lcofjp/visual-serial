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
  'UTF8', 'UTF-16', 'UTF-16BE', 'ascii', 'hex', 'base64', 'GB2312', 'GBK', 'GB18030', 'Windows936', 'EUC-CN',
  'ISO-8859-1', 'ISO-8859-2',
  'Big5', 'Big5-HKSCS', 'EUC-KR',
  'KS_C_5601', 'Windows949', 'EUC-KR',
  'Shift_JIS', 'Windows-31j', 'Windows932', 'EUC-JP',
];
function characterEncodeingConversion() {
  let from = 'UTF8', to = 'UTF8';

  function entry (buf, serial, next) {
    if (from === to) {
        next(buf);
    }
    else {
      const str = iconv.decode(buf, from);
      const buf = iconv.encode(str, to);
      next(buf, serial);
    }
  }

  function getOptions() {
    return [
      {name: 'from', label: '源编码', type: 'select', values: supportedEncodings, currentValue: from },
      {name: 'to', label: '目标编码', type: 'select', values: supportedEncodings, currentValue: to },
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
  return {
    entry,
    getOptions,
    config,
    type: 'middleware',
  }
}

characterEncodeingConversion.type = 'middleware';

module.exports = characterEncodeingConversion;
