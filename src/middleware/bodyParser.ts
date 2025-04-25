import { json, urlencoded, OptionsJson, OptionsUrlencoded } from 'express';

// Configuration typée pour body-parser
const jsonOptions: OptionsJson = {
  limit: '10mb' // Augmente la limite pour les payloads JSON
};

const urlencodedOptions: OptionsUrlencoded = {
  extended: true,
  parameterLimit: 10000 // Augmente le nombre de paramètres acceptés
};

export const jsonParser = json(jsonOptions);
export const urlencodedParser = urlencoded(urlencodedOptions);