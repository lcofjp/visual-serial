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

function toUTF8(buf, serial, next) {
  next(buf);
}

toUTF8.type = 'middleware';

module.exports = toUTF8;
