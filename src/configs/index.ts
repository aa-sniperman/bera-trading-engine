import * as dotenv from 'dotenv';
import * as Joi from 'joi';
dotenv.config();

export const isLocal = process.env.NODE_ENV === 'local';

const envVarsSchema = Joi.object()
  .keys({
    API_ENDPOINT: Joi.string().required(),
    API_SECRET: Joi.string().required(),
    PRIVATE_KEY: Joi.string().required(),
    SIGNER_KEY: Joi.string().required(),
    NETWORK: Joi.string().valid('mainnet', 'testnet'),
    MAINNET_RPC: Joi.string().default('https://rpc.berachain.com/'),
    TESTNET_RPC: Joi.string().default('https://bartio.rpc.berachain.com')
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env);

if (error != null) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const env = {
  api: {
    endPoint: envVars.API_ENDPOINT,
    apiSecret: envVars.API_SECRET
  },
  network: envVars.NETWORK,
  keys: {
    pk: envVars.PRIVATE_KEY,
    signerKey: envVars.SIGNER_KEY,
  },
  bera: {
    mainnetRpc: envVars.MAINNET_RPC,
    testnetRpc: envVars.TESTNET_RPC
  },
};
