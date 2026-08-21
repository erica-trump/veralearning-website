const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
// A fixed zlib stream for one non-interlaced 1x1 RGBA scanline:
// filter byte 0 followed by four zero-valued color/alpha bytes.
export const MINIMAL_RGBA_IDAT = Buffer.from("789c6360606060000000050001", "hex");

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function pngChunk(type, data = Buffer.alloc(0)) {
  const typeBytes = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])));
  return Buffer.concat([length, typeBytes, data, crc]);
}

export function credentialITxt({
  credential,
  payloadBytes,
  compressionFlag = 0,
  compressionMethod = 0,
} = {}) {
  const payload = payloadBytes ?? Buffer.from(JSON.stringify(credential), "utf8");
  return Buffer.concat([
    Buffer.from("openbadgecredential\0", "ascii"),
    Buffer.from([compressionFlag, compressionMethod]),
    Buffer.from([0, 0]),
    payload,
  ]);
}

export function pngHeader({ bitDepth = 8, colorType = 6 } = {}) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(1, 0);
  header.writeUInt32BE(1, 4);
  header[8] = bitDepth;
  header[9] = colorType;
  return header;
}

export function createCredentialPng(credential, {
  duplicate = false,
  compressionFlag = 0,
  compressionMethod = 0,
  payloadBytes,
  extraChunks = [],
  chunksAfterIdat = [],
  includeIdat = true,
  idatBytes = MINIMAL_RGBA_IDAT,
  headerBytes,
  iendData = Buffer.alloc(0),
  trailingBytes = Buffer.alloc(0),
} = {}) {
  const header = pngHeader();
  const selectedHeader = headerBytes ?? header;
  const metadata = credentialITxt({
    credential,
    payloadBytes,
    compressionFlag,
    compressionMethod,
  });
  const chunks = [pngChunk("IHDR", selectedHeader), ...extraChunks];
  if (includeIdat) chunks.push(pngChunk("IDAT", idatBytes));
  chunks.push(...chunksAfterIdat, pngChunk("iTXt", metadata));
  if (duplicate) chunks.push(pngChunk("iTXt", metadata));
  chunks.push(pngChunk("IEND", iendData));
  return Buffer.concat([PNG_SIGNATURE, ...chunks, trailingBytes]);
}

export function corruptLastChunkCrc(png) {
  const copy = Buffer.from(png);
  copy[copy.length - 1] ^= 1;
  return copy;
}
