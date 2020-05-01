import { config } from "@vue/test-utils"
import translations from "./src/translations.js"

const locale = "en"

config.mocks.$t = (msg) => {
  const subobjects = msg.split('.');
  let translationMockMessage = translations[locale][msg];
  subobjects.forEach((element) => {
    translationMockMessage = translationMockMessage[element];
  });
  return translationMockMessage;
};
