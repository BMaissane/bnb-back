import { json, urlencoded } from 'express';
import type { OptionsJson, OptionsUrlencoded } from 'body-parser'; // Import depuis body-parser

// Configuration typée pour body-parser
const jsonOptions: OptionsJson = {
  limit: '10mb'
};

const urlencodedOptions: OptionsUrlencoded = {
  extended: true,
  parameterLimit: 10000
};

export const jsonParser = json(jsonOptions);
export const urlencodedParser = urlencoded(urlencodedOptions);