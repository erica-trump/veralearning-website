import jsigs from 'jsonld-signatures';
import {DataIntegrityProof} from '@digitalbazaar/data-integrity';
import {cryptosuite as eddsaRdfc2022Cryptosuite} from '@digitalbazaar/eddsa-rdfc-2022-cryptosuite';

const {AssertionProofPurpose} = jsigs.purposes;

const contexts = new Map([
  ['https://www.w3.org/ns/credentials/v2', {
    '@context': {
      id: '@id',
      type: '@type',
      VerifiableCredential: 'https://www.w3.org/2018/credentials#VerifiableCredential',
      issuer: {'@id': 'https://www.w3.org/2018/credentials#issuer', '@type': '@id'},
      credentialSubject: {
        '@id': 'https://www.w3.org/2018/credentials#credentialSubject',
        '@type': '@id'
      },
      validFrom: {
        '@id': 'https://www.w3.org/2018/credentials#validFrom',
        '@type': 'http://www.w3.org/2001/XMLSchema#dateTime'
      },
      name: 'http://schema.org/name'
    }
  }],
  ['https://w3id.org/security/data-integrity/v2', {
    '@context': {
      DataIntegrityProof: 'https://w3id.org/security#DataIntegrityProof',
      cryptosuite: 'https://w3id.org/security#cryptosuite',
      proofPurpose: {'@id': 'https://w3id.org/security#proofPurpose', '@type': '@vocab'},
      proofValue: 'https://w3id.org/security#proofValue',
      verificationMethod: {
        '@id': 'https://w3id.org/security#verificationMethod',
        '@type': '@id'
      },
      assertionMethod: 'https://w3id.org/security#assertionMethod'
    }
  }],
  ['https://w3id.org/security/multikey/v1', {
    '@context': {
      Multikey: 'https://w3id.org/security#Multikey',
      controller: {'@id': 'https://w3id.org/security#controller', '@type': '@id'},
      publicKeyMultibase: 'https://w3id.org/security#publicKeyMultibase'
    }
  }]
]);

const issuerUrl = 'https://credentials.veralearning.com/issuer.json';
const verificationMethodUrl = 'https://credentials.veralearning.com/keys/safe-mode-test.json';

const keyDoc = {
  '@context': ['https://w3id.org/security/multikey/v1'],
  id: verificationMethodUrl,
  type: 'Multikey',
  controller: issuerUrl,
  publicKeyMultibase: 'z6MkpNoGBX3he1fLjj4bQC5Dub1uWjGQajDfGhEeRFuSbsrg'
};

const issuerDoc = {
  id: issuerUrl,
  assertionMethod: [verificationMethodUrl]
};

async function documentLoader(url) {
  if (contexts.has(url)) {
    return {contextUrl: null, documentUrl: url, document: contexts.get(url)};
  }

  if (url === issuerUrl) {
    return {contextUrl: null, documentUrl: url, document: issuerDoc};
  }

  if (url === verificationMethodUrl) {
    return {contextUrl: null, documentUrl: url, document: keyDoc};
  }

  throw new Error(`No document available for ${url}`);
}

const credential = {
  '@context': [
    'https://www.w3.org/ns/credentials/v2',
    'https://w3id.org/security/data-integrity/v2'
  ],
  type: ['VerifiableCredential'],
  issuer: {
    id: issuerUrl,
    name: 'VeraLearning'
  },
  validFrom: '2026-03-01T00:00:00Z',
  credentialSubject: {
    id: 'did:example:recipient',
    name: 'Safe Mode Test'
  },
  undefinedTermForProbe: 'this should fail safe mode',
  proof: [{
    type: 'DataIntegrityProof',
    cryptosuite: 'eddsa-rdfc-2022',
    verificationMethod: verificationMethodUrl,
    proofPurpose: 'assertionMethod',
    proofValue: 'z2UPTpc8Qzsq73Tu9JeuYrdpz3NASUn63u1ZuvUscqCr7x1RY5YRxksXtFkemv5ZBHUgksp2sgpaMYhDtxHvTB4kF'
  }]
};

const suite = new DataIntegrityProof({
  cryptosuite: eddsaRdfc2022Cryptosuite
});
const purpose = new AssertionProofPurpose();
const result = await jsigs.verify(credential, {
  suite,
  purpose,
  documentLoader
});

const safeModeError = result.results?.[0]?.error;

if (
  result.verified !== false ||
  safeModeError?.name !== 'jsonld.ValidationError' ||
  safeModeError?.message !== 'Safe mode validation error.'
) {
  console.error('Expected strict JSON-LD safe mode rejection, but verification did not fail as expected.');
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}

console.log('Strict JSON-LD safe mode confirmed.');
console.log(`Rejected undefined term: ${safeModeError.details?.event?.details?.property ?? 'unknown'}`);
