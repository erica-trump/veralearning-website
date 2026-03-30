declare module "@digitalbazaar/data-integrity" {
  export class DataIntegrityProof {
    constructor(options: Record<string, unknown>);
  }
}

declare module "@digitalbazaar/eddsa-rdfc-2022-cryptosuite" {
  export const cryptosuite: Record<string, unknown>;
}

declare module "jsonld-signatures" {
  const jsigs: {
    verify: (
      document: unknown,
      options: Record<string, unknown>,
    ) => Promise<unknown>;
    purposes: {
      AssertionProofPurpose: new (...args: unknown[]) => unknown;
    };
  };

  export default jsigs;
}
