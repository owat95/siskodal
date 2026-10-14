/* ============================================================
 * ASTERIX-CORE.JS â€” v1.0
 * Binary Decoder/Encoder for ASTERIX CAT-048
 * Spec: EUROCONTROL SUR.ET1.ST05.2000-STD-01-01
 * ============================================================ */

const ASTERIXCore = (() => {
  'use strict';

  // ============================================
  // CONSTANTS
  // ============================================
  const CAT_048 = 0x30;       // CAT-048 Monoradar Target Reports
  const CAT_062 = 0x3E;       // CAT-062 System Track Data

  // ============================================
  // BIT MANIPULATION HELPERS
  // ============================================
  function byteToBits(byte) {
    return byte.toString(2).padStart(8, '0');
  }

  function bitsToByte(bits) {
    return parseInt(bits, 2);
  }

  function readUInt(bytes, offset, length) {
    let val = 0;
    for (let i = 0; i < length; i++) {
      val = (val << 8) | bytes[offset + i];
    }
    return val >>> 0;
  }

  function writeUInt(value, length) {
    const bytes = [];
    for (let i = length - 1; i >= 0; i--) {
      bytes.push((value >> (i * 8)) & 0xFF);
    }
    return bytes;
  }

  // ============================================
  // FSPEC â€” Field Specification Bitmap
  // ============================================
  // ASTERIX FSPEC: variable length (1+ bytes)
  // Each byte: 7 bits data + 1 bit FX (extension)
  // Last byte: FX = 0
  // ============================================

  function encodeFSPEC(itemPresence) {
    // itemPresence: array of booleans for items 1..N
    // Split into chunks of 7 items per FSPEC byte
    const chunks = [];
    for (let i = 0; i < itemPresence.length; i += 7) {
      chunks.push(itemPresence.slice(i, i + 7));
    }

    const fspecBytes = [];
    chunks.forEach((chunk, idx) => {
      let byte = 0;
      chunk.forEach((present, bitIdx) => {
        if (present) {
          // Bit 8 = item 1, bit 7 = item 2, ..., bit 2 = item 7
          byte |= (1 << (7 - bitIdx));
        }
      });
      // Set FX bit (bit 1) if this is not the last byte
      if (idx < chunks.length - 1) {
        byte |= 0x01;
      }
      fspecBytes.push(byte);
    });

    return fspecBytes;
  }

  function decodeFSPEC(bytes, startOffset) {
    const items = [];
    let offset = startOffset;
    let fspecByte;
    do {
      fspecByte = bytes[offset++];
      for (let bit = 7; bit >= 1; bit--) {
        items.push((fspecByte >> bit) & 1);
      }
    } while (fspecByte & 0x01);
    return { items, fspecLength: offset - startOffset };
  }

  // ============================================
  // ENCODE CAT-048
  // ============================================
  function encodeCat048(record) {
    // --- DATA ITEMS ---
    // I048/010: Data Source Identifier (2 bytes: SAC, SIC)
    // I048/140: Time of Day (3 bytes: 1/128 sec since midnight)
    // I048/020: Target Report Descriptor (1 byte, variable ext)
    // I048/040: Measured Position in Polar (4 bytes: RHO, THETA)
    // I048/070: Mode-3/A Code (2 bytes)
    // I048/090: Flight Level (2 bytes: FL/4)
    // I048/161: Track Number (2 bytes)
    // I048/220: Aircraft Address (3 bytes: Mode-S)
    // I048/240: Aircraft Identification (6 bytes: callsign)

    // Data items present in order
    const itemsPresent = [
      true,   // 1: I048/010 SAC/SIC
      true,   // 2: I048/140 Time of Day
      true,   // 3: I048/020 Target Report Descriptor
      true,   // 4: I048/040 Position (Polar)
      true,   // 5: I048/070 Mode-3/A
      true,   // 6: I048/090 Flight Level
      true,   // 7: I048/161 Track Number
      true,   // 8: I048/220 Aircraft Address
      true    // 9: I048/240 Aircraft ID
    ];

    const fspec = encodeFSPEC(itemsPresent);
    const dataBytes = [];

    // I048/010: Data Source (SAC=0x19, SIC=radar ID)
    dataBytes.push(record.sac || 0x19);
    dataBytes.push(record.sic || 0x01);

    // I048/140: Time of Day (1/128 sec since midnight UTC)
    const now = new Date();
    const secSinceMidnight = now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds() + now.getUTCMilliseconds() / 1000;
    const tod = Math.floor(secSinceMidnight * 128);
    dataBytes.push(...writeUInt(tod, 3));

    // I048/020: Target Report Descriptor (1 byte)
    // Bits 8-6: TYP (0=no detection, 1=single PSR, 2=single SSR, 3=PSR+SSR, 4=Mode S)
    // Bit 5: SIM, Bit 4: RAB, Bit 3: TST, Bit 2: ERT, Bit 1: FX
    const typ = record.typ !== undefined ? record.typ : 4; // default: Mode S
    const i020 = (typ << 5) & 0xE0;
    dataBytes.push(i020);

    // I048/040: Measured Position in Polar (RHO in 1/256 NM, THETA in 360/65536 deg)
    // RHO: 2 bytes, THETA: 2 bytes
    const rho = Math.round((record.rho || 50) * 256);      // 50 NM default
    const theta = Math.round((record.theta || 0) * 65536 / 360);
    dataBytes.push(...writeUInt(rho, 2));
    dataBytes.push(...writeUInt(theta, 2));

    // I048/070: Mode-3/A Code (squawk, 4 digits octal in 12 bits)
    const squawk = record.squawk || 7000;
    dataBytes.push(...writeUInt(squawk, 2));

    // I048/090: Flight Level (in 1/4 FL)
    const fl = record.fl || 250;
    const flEncoded = Math.round(fl * 4);
    dataBytes.push(...writeUInt(flEncoded, 2));

    // I048/161: Track Number (2 bytes)
    dataBytes.push(...writeUInt(record.trackNumber || 1000, 2));

    // I048/220: Aircraft Address (Mode-S, 3 bytes)
    const modeS = record.modeS || 0x525000;
    dataBytes.push(...writeUInt(modeS, 3));

    // I048/240: Aircraft Identification (6 bytes = 8 chars AIS 6-bit)
    const callsign = (record.callsign || 'UNKNOWN ').toUpperCase().padEnd(8, ' ');
    const callsignBytes = encodeCallsign(callsign);
    dataBytes.push(...callsignBytes);

    // --- ASSEMBLE MESSAGE ---
    const bodyLength = 3 + fspec.length + dataBytes.length;
    const message = [
      CAT_048,
      (bodyLength >> 8) & 0xFF,
      bodyLength & 0xFF,
      ...fspec,
      ...dataBytes
    ];

    return new Uint8Array(message);
  }

  // ============================================
  // CALLSIGN ENCODING (ICAO 6-bit)
  // ============================================
  function encodeCallsign(callsign) {
    // 8 chars Ã— 6 bits = 48 bits = 6 bytes
    let bits = '';
    for (let i = 0; i < 8; i++) {
      const ch = callsign.charCodeAt(i);
      let val;
      if (ch >= 65 && ch <= 90) val = ch - 64;        // A-Z â†’ 1-26
      else if (ch >= 48 && ch <= 57) val = ch - 48 + 48; // 0-9 â†’ 48-57
      else val = 32;                                   // space â†’ 32
      bits += val.toString(2).padStart(6, '0');
    }
    // Convert 48 bits to 6 bytes
    const bytes = [];
    for (let i = 0; i < 48; i += 8) {
      bytes.push(parseInt(bits.substring(i, i + 8), 2));
    }
    return bytes;
  }

  function decodeCallsign(bytes) {
    let bits = '';
    for (const b of bytes) bits += b.toString(2).padStart(8, '0');
    let callsign = '';
    for (let i = 0; i < 48; i += 6) {
      const val = parseInt(bits.substring(i, i + 6), 2);
      if (val >= 1 && val <= 26) callsign += String.fromCharCode(val + 64);
      else if (val >= 48 && val <= 57) callsign += String.fromCharCode(val);
      else callsign += ' ';
    }
    return callsign.trim();
  }

  // ============================================
  // DECODE CAT-048
  // ============================================
  function decodeCat048(bytes) {
    if (bytes[0] !== CAT_048) {
      throw new Error(`Not CAT-048 (got 0x${bytes[0].toString(16)})`);
    }

    const length = (bytes[1] << 8) | bytes[2];
    let offset = 3;

    // Decode FSPEC
    const { items, fspecLength } = decodeFSPEC(bytes, offset);
    offset += fspecLength;

    const record = {
      cat: CAT_048,
      length,
      raw: Array.from(bytes)
    };

    // I048/010
    if (items[0]) {
      record.sac = bytes[offset++];
      record.sic = bytes[offset++];
    }

    // I048/140
    if (items[1]) {
      const tod = readUInt(bytes, offset, 3);
      offset += 3;
      record.tod = tod / 128; // seconds
    }

    // I048/020 (variable, but assume 1 byte)
    if (items[2]) {
      const b = bytes[offset++];
      record.typ = (b >> 5) & 0x07;
      record.sim = (b >> 4) & 0x01;
      record.rab = (b >> 3) & 0x01;
      record.tst = (b >> 2) & 0x01;
      // FX bit handling omitted for simplicity
    }

    // I048/040 (Polar)
    if (items[3]) {
      const rho = readUInt(bytes, offset, 2);
      const theta = readUInt(bytes, offset + 2, 2);
      offset += 4;
      record.rho = rho / 256;                        // NM
      record.theta = theta * 360 / 65536;            // degrees
    }

    // I048/070 (Mode-3/A)
    if (items[4]) {
      record.squawk = readUInt(bytes, offset, 2);
      offset += 2;
    }

    // I048/090 (Flight Level)
    if (items[5]) {
      const fl = readUInt(bytes, offset, 2);
      offset += 2;
      record.fl = fl / 4;
    }

    // I048/161 (Track Number)
    if (items[6]) {
      record.trackNumber = readUInt(bytes, offset, 2);
      offset += 2;
    }

    // I048/220 (Mode-S)
    if (items[7]) {
      record.modeS = readUInt(bytes, offset, 3);
      offset += 3;
    }

    // I048/240 (Callsign)
    if (items[8]) {
      record.callsign = decodeCallsign(bytes.slice(offset, offset + 6));
      offset += 6;
    }

    return record;
  }

  // ============================================
  // UTILITY
  // ============================================
  function toHex(bytes) {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
  }

  // ============================================
  // SELF-TEST
  // ============================================
  function selfTest() {
    console.group('%c[ASTERIX] Self-Test', 'color:#00e5ff;font-weight:bold');

    // Test 1: Encode
    const testRecord = {
      sac: 0x19,
      sic: 0x01,
      typ: 4,
      rho: 45.5,
      theta: 270.0,
      squawk: 7000,
      fl: 250,
      trackNumber: 1001,
      modeS: 0x525001,
      callsign: 'FALCON01'
    };

    const encoded = encodeCat048(testRecord);
    console.log('1. Encode CAT-048: âœ“');
    console.log('   Hex:', toHex(encoded));
    console.log('   Length:', encoded.length, 'bytes');

    // Test 2: Decode
    const decoded = decodeCat048(encoded);
    console.log('2. Decode CAT-048: âœ“');
    console.log('   SAC/SIC:', decoded.sac, '/', decoded.sic);
    console.log('   RHO/THETA:', decoded.rho, '/', decoded.theta.toFixed(2));
    console.log('   Squawk:', decoded.squawk.toString(8));
    console.log('   FL:', decoded.fl);
    console.log('   Callsign:', decoded.callsign);

    // Test 3: Round-trip check
    const match = decoded.callsign === testRecord.callsign &&
                  Math.abs(decoded.rho - testRecord.rho) < 0.01 &&
                  decoded.fl === testRecord.fl;
    console.log('3. Round-trip:', match ? 'âœ“ PASS' : 'âœ— FAIL');

    console.groupEnd();
    return { encoded, decoded };
  }

  // ============================================
  // EXPORT
  // ============================================
  return {
    CAT_048, CAT_062,
    encodeCat048,
    decodeCat048,
    encodeCallsign,
    decodeCallsign,
    toHex,
    selfTest
  };
})();

if (typeof window !== 'undefined') window.ASTERIXCore = ASTERIXCore;
if (typeof module !== 'undefined') module.exports = ASTERIXCore;