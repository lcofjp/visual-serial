function FF() {
  /*
  * 自定义的FF协议，由FF开头和结尾，内容中的FF则转为FE 01，内容中的FE转为FE 00；
  * 接收： 状态1(SEEK_HEAD). 寻找开头的FF，遇到FF则转换为RX_CONTENT
  *       状态2(RX_CONTENT)，接收一个字节，则rxCnt+=1，遇到FE，置escapeFlag，
            遇到FF，则如果rxCnt不为0则结束，为0则rxCnt=0；
  */
  let rxBuf = Buffer.alloc(1024);
  const SEEK_HEAD = 0,
        RX_CONTENT = 1;
  let rxState = SEEK_HEAD;
  let escapeFlag = false;
  let rxCnt = 0;

  function decode(buf, serial, next) {
    // 判断缓冲区大小够不够
    if (buf.length + rxCnt > rxBuf.length) {
      let newBuf = Buffer.alloc(buf.length + rxCnt + 1024);
      rxBuf.copy(newBuf, 0, 0, rxCnt);
      rxBuf = newBuf;
    }
    for(let i=0; i<buf.length; i++) {
      let c = buf[i];
      if (rxState === SEEK_HEAD) {
        if (c === 0xFF) {
          rxState = RX_CONTENT;
          escapeFlag = false;
        }
      } else if (rxState == RX_CONTENT) {
        if (c === 0xFE) {
          escapeFlag = true;
        } else if (c === 0xFF) {
          if (rxCnt === 0) {
            escapeFlag = false;
          } else { // 接收到一帧完整的数据包
            // 校验
            let checkSum = 0;
            for (let j=0; j<rxCnt; j++) {
              checkSum ^= rxBuf[j];
            }
            if (checkSum === 0) {
              let nextBuf = Buffer.alloc(rxCnt-1);
              rxBuf.copy(nextBuf, 0, 0, rxCnt-1);
              next(nextBuf, serial);
            }
            rxCnt = 0;
            rxState = SEEK_HEAD;
            escapeFlag = false;
          }
        } else {
          if (escapeFlag) {
            if (c === 0x00 || c === 0x01) {
              rxBuf[rxCnt++] = 0xFE | c;
              escapeFlag = false;
            } else { // 非法的转义字符
              rxState = SEEK_HEAD;
              rxCnt = 0;
              escapeFlag = false;
              if (c === 0xFF) { rxState = RX_CONTENT; }
            }
          } else {
            rxBuf[rxCnt++] = c;
          }
        }
      }
    }
  }
  
  function encode(buf, serial, next) {
    let a = [0xFF];
    let xorSum = 0;
    for(let c of buf) {
      xorSum ^= c;
      if (c === 0xFF) {
        a.push(0xFE);
        a.push(0x01);
      } else if (c === 0xFE) {
        a.push(0xFE);
        a.push(0x00);
      }
      else {
        a.push(c);
      }
    }
    a.push(xorSum);
    a.push(0xFF);
    next(Buffer.from(a), serial);
  }
  return {
    decode,
    encode,
  }
}

FF.type = 'protocol';

module.exports = FF;
