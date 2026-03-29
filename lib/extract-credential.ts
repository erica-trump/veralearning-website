import extractChunks from "png-chunks-extract";

const CREDENTIAL_CHUNK_KEYWORD = "openbadgecredential";

export type ExtractedOpenBadgeCredential = Record<string, unknown>;

function readNullTerminatedText(bytes: Uint8Array, offset: number) {
  const end = bytes.indexOf(0, offset);

  if (end === -1) {
    throw new Error("Malformed iTXt chunk");
  }

  return {
    value: new TextDecoder().decode(bytes.slice(offset, end)),
    nextOffset: end + 1,
  };
}

export function extractCredentialFromPng(
  pngBytes: Uint8Array,
): ExtractedOpenBadgeCredential {
  const chunk = extractChunks(pngBytes).find((candidate) => {
    if (candidate.name !== "iTXt") {
      return false;
    }

    try {
      const bytes = Uint8Array.from(candidate.data);
      const keywordSection = readNullTerminatedText(bytes, 0);

      return keywordSection.value === CREDENTIAL_CHUNK_KEYWORD;
    } catch {
      return false;
    }
  });

  if (!chunk) {
    throw new Error("PNG does not contain an iTXt credential chunk");
  }

  const bytes = Uint8Array.from(chunk.data);
  const keywordSection = readNullTerminatedText(bytes, 0);
  const keyword = keywordSection.value;

  if (keyword !== CREDENTIAL_CHUNK_KEYWORD) {
    throw new Error("PNG credential chunk uses an unexpected keyword");
  }

  let offset = keywordSection.nextOffset;
  const compressionFlag = bytes[offset++];
  const compressionMethod = bytes[offset++];

  if (compressionFlag !== 0 || compressionMethod !== 0) {
    throw new Error("Compressed credential metadata is not supported");
  }

  const languageSection = readNullTerminatedText(bytes, offset);
  offset = languageSection.nextOffset;

  const translatedKeywordSection = readNullTerminatedText(bytes, offset);
  offset = translatedKeywordSection.nextOffset;

  const payload = new TextDecoder().decode(bytes.slice(offset));
  const credential = JSON.parse(payload) as ExtractedOpenBadgeCredential;

  return credential;
}
