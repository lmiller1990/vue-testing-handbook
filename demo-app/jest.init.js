import { config } from "@vue/test-utils"
import translations from "./src/translations.js"

const locale = "en"

config.mocks["$t"] = (msg) => translations[locale][msg]
