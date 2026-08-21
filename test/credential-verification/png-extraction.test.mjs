import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  extractCredentialFromPng,
  MAX_EMBEDDED_CREDENTIAL_BYTES,
  MAX_PNG_BYTES,
  MAX_PNG_CHUNKS,
} from "../../lib/extract-credential.ts";
import {
  corruptLastChunkCrc,
  createCredentialPng,
  MINIMAL_RGBA_IDAT,
  pngHeader,
  pngChunk,
} from "../helpers/png-fixture.mjs";

const credential = { id: "urn:uuid:76cddec5-9415-42b4-a9f3-03ef58ad1e1e", name: "Test" };

function unrelatedITxt(keywordBytes) {
  return Buffer.concat([
    keywordBytes,
    // Keyword terminator, compression flag/method, empty language tag, and
    // empty translated keyword. The unrelated text itself is empty.
    Buffer.of(0, 0, 0, 0, 0),
  ]);
}

test("extracts exactly one bounded uncompressed credential object", () => {
  assert.deepEqual(extractCredentialFromPng(createCredentialPng(credential)), credential);
});

test("ignores a conformant unrelated iTXt keyword containing a Latin-1 byte", () => {
  const png = createCredentialPng(credential, {
    extraChunks: [pngChunk("iTXt", unrelatedITxt(Buffer.of(0xe9)))],
  });

  assert.deepEqual(extractCredentialFromPng(png), credential);
});

test("does not treat similar ASCII or Latin-1 keywords as credential metadata", () => {
  const similarKeywords = [
    Buffer.from("openbadgecredentiaL", "ascii"),
    Buffer.concat([Buffer.from("openbadgecredential", "ascii"), Buffer.of(0xe9)]),
  ];

  for (const keyword of similarKeywords) {
    const png = createCredentialPng(credential, {
      extraChunks: [pngChunk("iTXt", unrelatedITxt(keyword))],
    });
    assert.deepEqual(extractCredentialFromPng(png), credential);
  }
});

test("the nominal fixture has a fixed independently constructed IDAT stream", () => {
  const png = createCredentialPng(credential);
  assert.notEqual(png.indexOf(Buffer.from("IDAT", "ascii")), -1);
  assert.notEqual(png.indexOf(MINIMAL_RGBA_IDAT), -1);
  assert.deepEqual(extractCredentialFromPng(png), credential);
});

test("requires at least one IDAT chunk", () => {
  assert.throws(
    () => extractCredentialFromPng(createCredentialPng(credential, { includeIdat: false })),
    /IDAT/i,
  );
});

test("rejects unknown critical chunks", () => {
  assert.throws(
    () => extractCredentialFromPng(createCredentialPng(credential, {
      extraChunks: [pngChunk("ABCD")],
    })),
    /unknown critical chunk/i,
  );
});

test("requires PLTE before IDAT and applies IHDR color-type rules", async t => {
  await t.test("PLTE after IDAT", () => {
    assert.throws(
      () => extractCredentialFromPng(createCredentialPng(credential, {
        chunksAfterIdat: [pngChunk("PLTE", Buffer.from([0, 0, 0]))],
      })),
      /PLTE.*before.*IDAT/i,
    );
  });
  await t.test("indexed color requires PLTE", () => {
    assert.throws(
      () => extractCredentialFromPng(createCredentialPng(credential, {
        headerBytes: pngHeader({ bitDepth: 1, colorType: 3 }),
      })),
      /requires PLTE/i,
    );
  });
  await t.test("grayscale prohibits PLTE", () => {
    assert.throws(
      () => extractCredentialFromPng(createCredentialPng(credential, {
        headerBytes: pngHeader({ bitDepth: 8, colorType: 0 }),
        extraChunks: [pngChunk("PLTE", Buffer.from([0, 0, 0]))],
      })),
      /PLTE.*prohibited/i,
    );
  });
});

test("rejects non-consecutive IDAT chunks", () => {
  assert.throws(
    () => extractCredentialFromPng(createCredentialPng(credential, {
      chunksAfterIdat: [
        pngChunk("tEXt", Buffer.alloc(0)),
        pngChunk("IDAT", MINIMAL_RGBA_IDAT),
      ],
    })),
    /IDAT.*consecutive/i,
  );
});

test("rejects an invalid PNG signature", () => {
  const png = createCredentialPng(credential);
  png[0] = 0;
  assert.throws(() => extractCredentialFromPng(png), /signature/i);
});

test("requires a structurally valid IHDR", () => {
  const invalidHeader = Buffer.alloc(13);
  invalidHeader.writeUInt32BE(1, 4);
  invalidHeader[8] = 8;
  invalidHeader[9] = 6;
  assert.throws(
    () => extractCredentialFromPng(createCredentialPng(credential, { headerBytes: invalidHeader })),
    /IHDR/i,
  );
});

test("validates CRC for IEND and every preceding chunk", () => {
  assert.throws(
    () => extractCredentialFromPng(corruptLastChunkCrc(createCredentialPng(credential))),
    /CRC/i,
  );
});

test("rejects truncated PNG data and missing IEND", () => {
  const png = createCredentialPng(credential);
  assert.throws(() => extractCredentialFromPng(png.subarray(0, png.length - 7)), /truncated|length|IEND/i);
});

test("requires an empty IEND", () => {
  assert.throws(
    () => extractCredentialFromPng(createCredentialPng(credential, { iendData: Buffer.of(1) })),
    /IEND/i,
  );
});

test("rejects trailing bytes after IEND", () => {
  assert.throws(
    () => extractCredentialFromPng(createCredentialPng(credential, { trailingBytes: Buffer.of(0) })),
    /trailing/i,
  );
});

test("enforces the immutable chunk-count limit", () => {
  const extraChunks = Array.from(
    { length: MAX_PNG_CHUNKS - 2 },
    () => pngChunk("tEXt", Buffer.alloc(0)),
  );
  assert.throws(
    () => extractCredentialFromPng(createCredentialPng(credential, { extraChunks })),
    /too many chunks/i,
  );
});

test("rejects duplicate openbadgecredential metadata", () => {
  assert.throws(
    () => extractCredentialFromPng(createCredentialPng(credential, { duplicate: true })),
    /duplicate/i,
  );
});

test("rejects compressed credential metadata", () => {
  assert.throws(
    () => extractCredentialFromPng(createCredentialPng(credential, { compressionFlag: 1 })),
    /compressed/i,
  );
  assert.throws(
    () => extractCredentialFromPng(createCredentialPng(credential, { compressionMethod: 1 })),
    /compressed/i,
  );
});

test("uses fatal UTF-8 decoding", () => {
  assert.throws(
    () => extractCredentialFromPng(createCredentialPng(credential, { payloadBytes: Buffer.of(0xff) })),
    /UTF-8/i,
  );
});

test("rejects oversized PNG input before parsing", () => {
  const oversized = Buffer.alloc(MAX_PNG_BYTES + 1);
  assert.throws(() => extractCredentialFromPng(oversized), /exceeds/i);
});

test("rejects an oversized embedded credential payload", () => {
  const payloadBytes = Buffer.from(
    JSON.stringify({ value: "x".repeat(MAX_EMBEDDED_CREDENTIAL_BYTES) }),
  );
  assert.throws(
    () => extractCredentialFromPng(createCredentialPng(credential, { payloadBytes })),
    /Embedded credential exceeds/i,
  );
});

test("rejects malformed credential JSON", () => {
  assert.throws(
    () => extractCredentialFromPng(createCredentialPng(credential, { payloadBytes: Buffer.from("{") })),
    /valid JSON/i,
  );
});

test("requires a non-null non-array credential object", () => {
  for (const value of [null, [], "text", 4]) {
    assert.throws(
      () => extractCredentialFromPng(createCredentialPng(credential, {
        payloadBytes: Buffer.from(JSON.stringify(value)),
      })),
      /one JSON object/i,
    );
  }
});

test("the existing example PNG satisfies the tightened critical structure", () => {
  const example = readFileSync(new URL("../../public/example-badge.png", import.meta.url));
  assert.throws(
    () => extractCredentialFromPng(example),
    error => /openbadgecredential iTXt/i.test(error.message),
  );
});
