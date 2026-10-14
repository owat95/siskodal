/* ============================================================
 * AIS-CORE.JS â€” v1.0
 * AIS 6-bit ASCII Decoder/Encoder + NMEA Parser
 * No dependencies. Works in browser + Node.
 * Spec: ITU-R M.1371-5
 * ============================================================
 */

const AISCore = (() => {
  'use strict';

  // ============================================================
  // 1. AIS 6-BIT ASCII CONVERSION
  // ============================================================
  // AIS payload uses 6-bit encoding:
  //   Value 0-31  â†’ '@','A'-'_'   (ord - 64)
  //   Value 32-63 â†’ ' '-'?'       (ord as-is)
  // ============================================================

  /**
   * Convert one AIS char to 6-bit binary string
   */
  function charToBits(c) {
    const code = c.charCodeAt(0);
    // Encoding ranges:
    // '0'(48) to 'W'(87) â†’ 0 to 39
    // '`'(96) to 'w'(119) â†’ 40 to 63
    const val = code < 96 ? (code - 48) : (code - 56);
    if (val < 0 || val > 63) {
      throw new Error(`Invalid AIS char: '${c}' (code ${code})`);
    }
    return val.toString(2).padStart(6, '0');
  }

  /**
   * Convert 6-bit binary string to AIS char
   */
  function bitsToChar(bits) {
    const val = parseInt(bits, 2);
    const code = val < 40 ? (val + 48) : (val + 56);
    return String.fromCharCode(code);
  }

  /**
   * Convert entire AIS payload string â†’ bit string
   */
  function payloadToBits(payload) {
    let bits = '';
    for (let i = 0; i < payload.length; i++) {
      bits += charToBits(payload[i]);
    }
    return bits;
  }

  /**
   * Convert bit string â†’ AIS payload string
   */
  function bitsToPayload(bits) {
    // Pad to multiple of 6
    while (bits.length % 6 !== 0) bits += '0';
    let out = '';
    for (let i = 0; i < bits.length; i += 6) {
      out += bitsToChar(bits.substring(i, i + 6));
    }
    return out;
  }

  // ============================================================
  // 2. BIT FIELD READ HELPERS
  // ============================================================

  function getUInt(bits, start, len) {
    return parseInt(bits.substring(start, start + len), 2) || 0;
  }

  function getInt(bits, start, len) {
    const u = getUInt(bits, start, len);
    const sign = 1 << (len - 1);
    return (u & sign) ? u - (1 << len) : u;
  }

  /**
   * Read 6-bit ASCII string field (for callsign, name, destination)
   * AIS text: value 1-26=A-Z, 32=space, 48-57=0-9, 0=padding
   */
  function getString(bits, start, len) {
    let out = '';
    for (let i = 0; i < len; i += 6) {
      const v = getUInt(bits, start + i, 6);
      if (v === 0) break; // '@' = end of string
      let ch;
      if (v < 32)      ch = String.fromCharCode(v + 64); // A-Z, [, \, ], ^, _
      else             ch = String.fromCharCode(v);      // space, digits, punct
      out += ch;
    }
    return out.replace(/@+$/, '').trim();
  }

  // ============================================================
  // 3. BIT FIELD WRITE HELPERS
  // ============================================================

  function putUInt(value, len) {
    value = Math.max(0, Math.floor(value));
    return (value >>> 0).toString(2).padStart(len, '0').slice(-len);
  }

  function putInt(value, len) {
    if (value < 0) value = (1 << len) + value;
    return putUInt(value, len);
  }

  function putString(str, len) {
    str = (str || '').toUpperCase();
    let bits = '';
    for (let i = 0; i < len; i += 6) {
      let v = 0;
      if (i < str.length) {
        const c = str.charCodeAt(i);
        if (c >= 64 && c <= 95) v = c - 64;      // @,A-Z,[,\,],^,_
        else if (c >= 32 && c <= 63) v = c;      // space, digits, punct
        else v = 32;                             // fallback to space
      }
      bits += putUInt(v, 6);
    }
    return bits;
  }

  // ============================================================
  // 4. NMEA SENTENCE PARSER
  // ============================================================

  /**
   * Parse a single NMEA sentence like:
   *   !AIVDM,1,1,,A,15M67FC000G?ufbE`FepT3n0S2D1,0*4C
   *
   * Returns: { type, fragments, fragmentNum, seqId, channel,
   *            payload, fillBits, checksum, valid }
   */
  function parseNMEA(sentence) {
    sentence = sentence.trim();

    // Checksum validation
    let checksumValid = null;
    const starIdx = sentence.lastIndexOf('*');
    if (starIdx !== -1) {
      const payloadPart = sentence.substring(1, starIdx);
      const givenCks = sentence.substring(starIdx + 1).toUpperCase();
      let cks = 0;
      for (let i = 0; i < payloadPart.length; i++) {
        cks ^= payloadPart.charCodeAt(i);
      }
      checksumValid = (cks.toString(16).toUpperCase().padStart(2, '0') === givenCks);
      sentence = sentence.substring(0, starIdx);
    }

    const parts = sentence.split(',');
    if (parts.length < 7) {
      throw new Error('Malformed NMEA sentence (need â‰¥7 fields)');
    }

    const type = parts[0]; // !AIVDM or !AIVDO

    return {
      type:        type,
      fragments:   parseInt(parts[1], 10),
      fragmentNum: parseInt(parts[2], 10),
      seqId:       parts[3] || null,
      channel:     parts[4] || null,
      payload:     parts[5],
      fillBits:    parseInt(parts[6], 10) || 0,
      checksum:    checksumValid,
      raw:         sentence
    };
  }

  /**
   * Build NMEA sentence from payload
   */
  function buildNMEA(payload, channel = 'A', fillBits = 0, type = 'AIVDM') {
    const body = `${type},1,1,,${channel},${payload},${fillBits}`;
    let cks = 0;
    for (let i = 0; i < body.length; i++) cks ^= body.charCodeAt(i);
    const cksHex = cks.toString(16).toUpperCase().padStart(2, '0');
    return `!${body}*${cksHex}`;
  }

  // ============================================================
  // 5. MESSAGE TYPE DECODERS
  // ============================================================

  /**
   * Type 1/2/3 â€” Position Report Class A
   */
  function decodeType123(bits) {
    return {
      type:         getUInt(bits, 0, 6),
      repeat:       getUInt(bits, 6, 2),
      mmsi:         getUInt(bits, 8, 30),
      navStatus:    getUInt(bits, 38, 4),
      rot:          getInt(bits, 42, 8) / 4.733,
      sog:          getUInt(bits, 50, 10) / 10,
      accuracy:     getUInt(bits, 60, 1),
      lon:          getInt(bits, 61, 28) / 600000,
      lat:          getInt(bits, 89, 27) / 600000,
      cog:          getUInt(bits, 116, 12) / 10,
      heading:      getUInt(bits, 128, 9),
      timestamp:    getUInt(bits, 137, 6),
      maneuver:     getUInt(bits, 143, 2),
      raim:         getUInt(bits, 148, 1),
      radio:        getUInt(bits, 149, 19),
      _kind:        'position_class_a'
    };
  }

  /**
   * Type 5 â€” Static and Voyage Data (Class A)
   */
  function decodeType5(bits) {
    return {
      type:         getUInt(bits, 0, 6),
      repeat:       getUInt(bits, 6, 2),
      mmsi:         getUInt(bits, 8, 30),
      aisVersion:   getUInt(bits, 38, 2),
      imo:          getUInt(bits, 40, 30),
      callsign:     getString(bits, 70, 42),
      vesselName:   getString(bits, 112, 120),
      shipType:     getUInt(bits, 232, 8),
      dimBow:       getUInt(bits, 240, 9),
      dimStern:     getUInt(bits, 249, 9),
      dimPort:      getUInt(bits, 258, 6),
      dimStarboard: getUInt(bits, 264, 6),
      epfd:         getUInt(bits, 270, 4),
      etaMonth:     getUInt(bits, 274, 4),
      etaDay:       getUInt(bits, 278, 5),
      etaHour:      getUInt(bits, 283, 5),
      etaMinute:    getUInt(bits, 288, 6),
      draught:      getUInt(bits, 294, 8) / 10,
      destination:  getString(bits, 302, 120),
      dte:          getUInt(bits, 422, 1),
      _kind:        'static_voyage'
    };
  }

  /**
   * Type 18 â€” Standard Class B Position Report
   */
  function decodeType18(bits) {
    return {
      type:         getUInt(bits, 0, 6),
      repeat:       getUInt(bits, 6, 2),
      mmsi:         getUInt(bits, 8, 30),
      sog:          getUInt(bits, 46, 10) / 10,
      accuracy:     getUInt(bits, 56, 1),
      lon:          getInt(bits, 57, 28) / 600000,
      lat:          getInt(bits, 85, 27) / 600000,
      cog:          getUInt(bits, 112, 12) / 10,
      heading:      getUInt(bits, 124, 9),
      timestamp:    getUInt(bits, 133, 6),
      _kind:        'position_class_b'
    };
  }

  /**
   * Type 24 â€” Static Data Report (Class B)
   * Part A: name only
   * Part B: ship type + vendor + callsign + dims
   */
  function decodeType24(bits) {
    const part = getUInt(bits, 38, 2);
    const base = {
      type:   getUInt(bits, 0, 6),
      repeat: getUInt(bits, 6, 2),
      mmsi:   getUInt(bits, 8, 30),
      part:   part,
      _kind:  'static_class_b'
    };
    if (part === 0) {
      return { ...base, vesselName: getString(bits, 40, 120) };
    } else {
      return {
        ...base,
        shipType:     getUInt(bits, 40, 8),
        vendorId:     getString(bits, 48, 42),
        callsign:     getString(bits, 90, 42),
        dimBow:       getUInt(bits, 132, 9),
        dimStern:     getUInt(bits, 141, 9),
        dimPort:      getUInt(bits, 150, 6),
        dimStarboard: getUInt(bits, 156, 6)
      };
    }
  }

  /**
   * Master decoder â€” dispatches by message type
   */
  function decodePayload(payload, fillBits = 0) {
    let bits = payloadToBits(payload);
    if (fillBits > 0) bits = bits.substring(0, bits.length - fillBits);
    const msgType = getUInt(bits, 0, 6);

    switch (msgType) {
      case 1:
      case 2:
      case 3:  return decodeType123(bits);
      case 5:  return decodeType5(bits);
      case 18: return decodeType18(bits);
      case 24: return decodeType24(bits);
      default:
        return { type: msgType, _kind: 'unknown', _rawBits: bits };
    }
  }

  /**
   * Full pipeline: NMEA string â†’ decoded object
   */
  function decodeNMEA(sentence) {
    const nmea = parseNMEA(sentence);
    const data = decodePayload(nmea.payload, nmea.fillBits);
    return { nmea, data };
  }

  // ============================================================
  // 6. MESSAGE TYPE ENCODERS
  // ============================================================

  /**
   * Encode Type 1 (Position Report Class A)
   */
  function encodeType1(v) {
    let b = '';
    b += putUInt(1, 6);                       // type
    b += putUInt(0, 2);                       // repeat
    b += putUInt(v.mmsi, 30);                 // mmsi
    b += putUInt(v.navStatus ?? 0, 4);        // nav status
    b += putInt(Math.round((v.rot || 0) * 4.733), 8); // ROT
    b += putUInt(Math.round((v.sog || 0) * 10), 10);  // SOG
    b += putUInt(v.accuracy ?? 0, 1);         // accuracy
    b += putInt(Math.round((v.lon || 0) * 600000), 28);
    b += putInt(Math.round((v.lat || 0) * 600000), 27);
    b += putUInt(Math.round((v.cog || 0) * 10), 12);
    b += putUInt(v.heading ?? 511, 9);        // 511 = not available
    b += putUInt(v.timestamp ?? 60, 6);       // 60 = N/A
    b += putUInt(0, 2);                       // maneuver
    b += putUInt(0, 3);                       // spare
    b += putUInt(v.raim ?? 0, 1);
    b += putUInt(0, 19);                      // radio
    return bitsToPayload(b);
  }

  /**
   * Encode Type 5 (Static & Voyage)
   */
  function encodeType5(v) {
    let b = '';
    b += putUInt(5, 6);
    b += putUInt(0, 2);
    b += putUInt(v.mmsi, 30);
    b += putUInt(0, 2);                       // AIS version
    b += putUInt(v.imo || 0, 30);
    b += putString(v.callsign || '', 42);     // 7 chars
    b += putString(v.vesselName || '', 120);  // 20 chars
    b += putUInt(v.shipType || 0, 8);
    b += putUInt(v.dimBow || 0, 9);
    b += putUInt(v.dimStern || 0, 9);
    b += putUInt(v.dimPort || 0, 6);
    b += putUInt(v.dimStarboard || 0, 6);
    b += putUInt(v.epfd || 0, 4);
    b += putUInt(v.etaMonth || 0, 4);
    b += putUInt(v.etaDay || 0, 5);
    b += putUInt(v.etaHour || 24, 5);
    b += putUInt(v.etaMinute || 60, 6);
    b += putUInt(Math.round((v.draught || 0) * 10), 8);
    b += putString(v.destination || '', 120); // 20 chars
    b += putUInt(v.dte || 0, 1);
    b += putUInt(0, 1);                       // spare
    return bitsToPayload(b);
  }

  /**
   * Encode Type 18 (Class B Position)
   */
  function encodeType18(v) {
    let b = '';
    b += putUInt(18, 6);
    b += putUInt(0, 2);
    b += putUInt(v.mmsi, 30);
    b += putUInt(0, 8);                       // reserved
    b += putUInt(Math.round((v.sog || 0) * 10), 10);
    b += putUInt(v.accuracy ?? 0, 1);
    b += putInt(Math.round((v.lon || 0) * 600000), 28);
    b += putInt(Math.round((v.lat || 0) * 600000), 27);
    b += putUInt(Math.round((v.cog || 0) * 10), 12);
    b += putUInt(v.heading ?? 511, 9);
    b += putUInt(v.timestamp ?? 60, 6);
    b += putUInt(0, 2);                       // spare
    b += putUInt(0, 1);                       // CS unit
    b += putUInt(0, 1);                       // display flag
    b += putUInt(0, 1);                       // DSC flag
    b += putUInt(0, 1);                       // band flag
    b += putUInt(0, 1);                       // msg22 flag
    b += putUInt(0, 1);                       // assigned
    b += putUInt(v.raim ?? 0, 1);
    b += putUInt(0, 20);                      // radio
    return bitsToPayload(b);
  }

  // ============================================================
  // 7. SELF-TEST (untuk verifikasi di console)
  // ============================================================

  function selfTest() {
    console.group('%c[AIS-CORE] Self-Test', 'color:#00e5ff;font-weight:bold');

    // Test 1: bit conversion round-trip
    const payload = '15M67FC000G?ufbE`FepT3n0S2D1';
    const bits = payloadToBits(payload);
    const back = bitsToPayload(bits);
    console.log('1. Payload round-trip:',
      payload === back ? 'âœ“ PASS' : `âœ— FAIL (${payload} â‰  ${back})`);

    // Test 2: decode known payload (Type 1)
    const decoded = decodePayload(payload);
    console.log('2. Decode Type 1:',
      decoded._kind === 'position_class_a' ? 'âœ“ PASS' : 'âœ— FAIL');
    console.log('   MMSI:', decoded.mmsi);
    console.log('   Lat/Lon:', decoded.lat, decoded.lon);
    console.log('   SOG/COG:', decoded.sog, decoded.cog);

    // Test 3: encode â†’ decode round-trip
    const encoded = encodeType1({
      mmsi: 525015810,
      lon: 106.8456,
      lat: -6.2088,
      sog: 12.3,
      cog: 270.5,
      heading: 271
    });
    const reDecoded = decodePayload(encoded);
    const dLon = Math.abs(reDecoded.lon - 106.8456) < 0.0001;
    const dLat = Math.abs(reDecoded.lat - (-6.2088)) < 0.0001;
    console.log('3. Encodeâ†’Decode:',
      (dLon && dLat) ? 'âœ“ PASS' : 'âœ— FAIL');
    console.log('   Original: 106.8456, -6.2088');
    console.log('   Decoded: ', reDecoded.lon, reDecoded.lat);

    // Test 4: NMEA build â†’ parse
    const nmea = buildNMEA(encoded, 'A');
    const parsed = parseNMEA(nmea);
    console.log('4. NMEA buildâ†’parse:',
      parsed.checksum === true ? 'âœ“ PASS' : 'âœ— FAIL');
    console.log('   Generated:', nmea);

    console.groupEnd();
  }

  // ============================================================
  // 8. PUBLIC API
  // ============================================================

  return {
    // Low-level
    charToBits, bitsToChar, payloadToBits, bitsToPayload,
    // NMEA
    parseNMEA, buildNMEA,
    // Decode
    decodePayload, decodeNMEA,
    decodeType123, decodeType5, decodeType18, decodeType24,
    // Encode
    encodeType1, encodeType5, encodeType18,
    // Debug
    selfTest
  };
})();

// Browser export
if (typeof window !== 'undefined') window.AISCore = AISCore;
// Node export
if (typeof module !== 'undefined') module.exports = AISCore;