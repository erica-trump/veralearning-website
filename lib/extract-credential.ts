export const MAX_PNG_BYTES = 2_097_152;
export const MAX_EMBEDDED_CREDENTIAL_BYTES = 196_608;
export const MAX_PNG_CHUNKS = 512;
// Includes the keyword, compression fields, language tag, translated keyword,
// and their separators. The credential payload has its own independent bound.
export const MAX_CREDENTIAL_ITXT_OVERHEAD_BYTES = 4_096;

const PNG_SIGNATURE = Uint8Array.of(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
const CREDENTIAL_CHUNK_KEYWORD_BYTES = new TextEncoder().encode("openbadgecredential");
const MAX_ITXT_KEYWORD_BYTES = 79;
const RECOGNIZED_CRITICAL_CHUNKS = new Set(["IHDR", "PLTE", "IDAT", "IEND"]);
const fatalUtf8Decoder = new TextDecoder("utf-8", { fatal: true });

export type ExtractedOpenBadgeCredential = Record<string, unknown>;

const CRC_TABLE = Object.freeze(
  Array.from({ length: 256 }, (_, index) => {
    let value = index;

    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }

    return value >>> 0;
  }),
);

function readUint32(bytes: Uint8Array, offset: number) {
  if (offset < 0 || offset + 4 > bytes.length) {
    throw new Error("PNG ended while reading a 32-bit value");
  }

  return (
    bytes[offset] * 0x1000000 +
    (bytes[offset + 1] << 16) +
    (bytes[offset + 2] << 8) +
    bytes[offset + 3]
  ) >>> 0;
}

function crc32(bytes: Uint8Array, start: number, end: number) {
  let crc = 0xffffffff;

  for (let offset = start; offset < end; offset += 1) {
    crc = CRC_TABLE[(crc ^ bytes[offset]) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function decodeFatal(bytes: Uint8Array, label: string) {
  try {
    return fatalUtf8Decoder.decode(bytes);
  } catch {
    throw new Error(`${label} is not valid UTF-8`);
  }
}

function bytesEqual(left: Uint8Array, right: Uint8Array) {
  return left.byteLength === right.byteLength &&
    left.every((byte, index) => byte === right[index]);
}

function readNullTerminatedSection(
  bytes: Uint8Array,
  offset: number,
  maximumBytes: number,
  label: string,
) {
  const maximumEnd = Math.min(bytes.length, offset + maximumBytes + 1);
  let end = offset;

  while (end < maximumEnd && bytes[end] !== 0) {
    end += 1;
  }

  if (end >= bytes.length || bytes[end] !== 0) {
    throw new Error(`${label} is missing a bounded null terminator`);
  }

  return {
    bytes: bytes.subarray(offset, end),
    nextOffset: end + 1,
  };
}

function parseCredentialITxt(data: Uint8Array) {
  const keywordSection = readNullTerminatedSection(
    data,
    0,
    MAX_ITXT_KEYWORD_BYTES,
    "PNG iTXt keyword",
  );

  if (!bytesEqual(keywordSection.bytes, CREDENTIAL_CHUNK_KEYWORD_BYTES)) {
    return null;
  }

  if (keywordSection.nextOffset + 2 > data.length) {
    throw new Error("Credential iTXt compression fields are truncated");
  }

  const compressionFlag = data[keywordSection.nextOffset];
  const compressionMethod = data[keywordSection.nextOffset + 1];

  if (compressionFlag !== 0 || compressionMethod !== 0) {
    throw new Error("Compressed credential metadata is not supported");
  }

  let offset = keywordSection.nextOffset + 2;
  const languageSection = readNullTerminatedSection(
    data,
    offset,
    MAX_CREDENTIAL_ITXT_OVERHEAD_BYTES,
    "Credential iTXt language tag",
  );
  decodeFatal(languageSection.bytes, "Credential iTXt language tag");
  offset = languageSection.nextOffset;

  const overheadRemaining = MAX_CREDENTIAL_ITXT_OVERHEAD_BYTES - offset;
  if (overheadRemaining < 0) {
    throw new Error("Credential iTXt header exceeds its bounded allowance");
  }

  const translatedKeywordSection = readNullTerminatedSection(
    data,
    offset,
    overheadRemaining,
    "Credential iTXt translated keyword",
  );
  decodeFatal(
    translatedKeywordSection.bytes,
    "Credential iTXt translated keyword",
  );
  offset = translatedKeywordSection.nextOffset;

  if (offset > MAX_CREDENTIAL_ITXT_OVERHEAD_BYTES) {
    throw new Error("Credential iTXt header exceeds its bounded allowance");
  }

  const payloadBytes = data.subarray(offset);
  if (payloadBytes.byteLength > MAX_EMBEDDED_CREDENTIAL_BYTES) {
    throw new Error("Embedded credential exceeds 196608 bytes");
  }

  const payload = decodeFatal(payloadBytes, "Embedded credential");
  let credential: unknown;

  try {
    credential = JSON.parse(payload);
  } catch {
    throw new Error("Embedded credential is not valid JSON");
  }

  if (typeof credential !== "object" || credential === null || Array.isArray(credential)) {
    throw new Error("Embedded credential must be one JSON object");
  }

  return credential as ExtractedOpenBadgeCredential;
}

function chunkType(bytes: Uint8Array, offset: number) {
  const characters: string[] = [];

  for (let index = 0; index < 4; index += 1) {
    const value = bytes[offset + index];
    if (!((value >= 65 && value <= 90) || (value >= 97 && value <= 122))) {
      throw new Error("PNG chunk type contains a non-alphabetic byte");
    }
    characters.push(String.fromCharCode(value));
  }

  return characters.join("");
}

function validateHeader(bytes: Uint8Array, offset: number) {
  const width = readUint32(bytes, offset);
  const height = readUint32(bytes, offset + 4);
  const bitDepth = bytes[offset + 8];
  const colorType = bytes[offset + 9];
  const compressionMethod = bytes[offset + 10];
  const filterMethod = bytes[offset + 11];
  const interlaceMethod = bytes[offset + 12];
  const allowedBitDepths: Readonly<Record<number, readonly number[]>> = {
    0: [1, 2, 4, 8, 16],
    2: [8, 16],
    3: [1, 2, 4, 8],
    4: [8, 16],
    6: [8, 16],
  };

  if (
    width === 0 ||
    height === 0 ||
    !allowedBitDepths[colorType]?.includes(bitDepth) ||
    compressionMethod !== 0 ||
    filterMethod !== 0 ||
    (interlaceMethod !== 0 && interlaceMethod !== 1)
  ) {
    throw new Error("PNG IHDR fields are invalid");
  }

  return { bitDepth, colorType };
}

function validatePalette(
  length: number,
  colorType: number,
  bitDepth: number,
) {
  if (colorType === 0 || colorType === 4) {
    throw new Error("PNG PLTE is prohibited for grayscale color types");
  }
  if (length === 0 || length % 3 !== 0 || length > 256 * 3) {
    throw new Error("PNG PLTE chunk length is invalid");
  }
  if (colorType === 3 && length / 3 > 2 ** bitDepth) {
    throw new Error("PNG PLTE contains too many entries for its indexed bit depth");
  }
}

export function extractCredentialFromPng(
  pngBytes: Uint8Array,
): ExtractedOpenBadgeCredential {
  if (pngBytes.byteLength > MAX_PNG_BYTES) {
    throw new Error("PNG exceeds 2097152 bytes");
  }

  if (pngBytes.byteLength < PNG_SIGNATURE.byteLength) {
    throw new Error("PNG signature is truncated");
  }

  for (let index = 0; index < PNG_SIGNATURE.length; index += 1) {
    if (pngBytes[index] !== PNG_SIGNATURE[index]) {
      throw new Error("Invalid PNG signature");
    }
  }

  let offset = PNG_SIGNATURE.byteLength;
  let chunkCount = 0;
  let sawHeader = false;
  let sawPalette = false;
  let sawImageData = false;
  let imageDataSequenceEnded = false;
  let sawEnd = false;
  let headerBitDepth: number | null = null;
  let headerColorType: number | null = null;
  let credential: ExtractedOpenBadgeCredential | null = null;

  while (offset < pngBytes.length) {
    chunkCount += 1;
    if (chunkCount > MAX_PNG_CHUNKS) {
      throw new Error("PNG contains too many chunks");
    }

    if (offset + 12 > pngBytes.length) {
      throw new Error("PNG chunk header is truncated");
    }

    const length = readUint32(pngBytes, offset);
    const typeOffset = offset + 4;
    const type = chunkType(pngBytes, typeOffset);
    const dataOffset = typeOffset + 4;
    const dataEnd = dataOffset + length;
    const crcOffset = dataEnd;
    const nextOffset = crcOffset + 4;

    if (
      dataEnd < dataOffset ||
      nextOffset < crcOffset ||
      nextOffset > pngBytes.length
    ) {
      throw new Error(`PNG ${type} chunk length exceeds the remaining input`);
    }

    const expectedCrc = readUint32(pngBytes, crcOffset);
    const actualCrc = crc32(pngBytes, typeOffset, dataEnd);
    if (actualCrc !== expectedCrc) {
      throw new Error(`PNG ${type} chunk CRC is invalid`);
    }

    if (chunkCount === 1) {
      if (type !== "IHDR" || length !== 13) {
        throw new Error("PNG must begin with one 13-byte IHDR chunk");
      }
      const header = validateHeader(pngBytes, dataOffset);
      headerBitDepth = header.bitDepth;
      headerColorType = header.colorType;
      sawHeader = true;
    } else if (type === "IHDR") {
      throw new Error("PNG contains more than one IHDR chunk");
    }

    const critical = type.charCodeAt(0) >= 65 && type.charCodeAt(0) <= 90;
    if (critical && !RECOGNIZED_CRITICAL_CHUNKS.has(type)) {
      throw new Error(`PNG contains unknown critical chunk ${type}`);
    }

    if (type === "PLTE") {
      if (sawPalette) {
        throw new Error("PNG contains more than one PLTE chunk");
      }
      if (sawImageData) {
        throw new Error("PNG PLTE must occur before the first IDAT chunk");
      }
      if (headerColorType === null || headerBitDepth === null) {
        throw new Error("PNG PLTE occurred before a valid IHDR chunk");
      }
      validatePalette(length, headerColorType, headerBitDepth);
      sawPalette = true;
    } else if (type === "IDAT") {
      if (imageDataSequenceEnded) {
        throw new Error("PNG IDAT chunks must be consecutive");
      }
      if (headerColorType === 3 && !sawPalette) {
        throw new Error("Indexed-color PNG requires PLTE before IDAT");
      }
      sawImageData = true;
    } else if (sawImageData) {
      imageDataSequenceEnded = true;
    }

    if (type === "iTXt") {
      const parsed = parseCredentialITxt(pngBytes.subarray(dataOffset, dataEnd));
      if (parsed) {
        if (credential) {
          throw new Error("PNG contains duplicate openbadgecredential metadata");
        }
        credential = parsed;
      }
    }

    if (type === "IEND") {
      if (length !== 0) {
        throw new Error("PNG IEND chunk must be empty");
      }
      sawEnd = true;
      offset = nextOffset;
      break;
    }

    offset = nextOffset;
  }

  if (!sawHeader || !sawEnd) {
    throw new Error("PNG is missing its required IHDR or IEND chunk");
  }

  if (!sawImageData) {
    throw new Error("PNG is missing its required IDAT chunk");
  }

  if (offset !== pngBytes.length) {
    throw new Error("PNG contains trailing bytes after IEND");
  }

  if (!credential) {
    throw new Error("PNG does not contain an openbadgecredential iTXt chunk");
  }

  return credential;
}
