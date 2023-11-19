import { IntlProvider } from "react-intl";

import cs from "./i18n/cs.json";
import en from "./i18n/en.json";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const messagesDefinition = { cs, en };
const LocaleContext = createContext<any>(null);

function getInitialLocale() {
  let navigatorLanguage = navigator.language;
  if (navigatorLanguage.includes("-")) {
    navigatorLanguage = navigatorLanguage.split("-")[0];
  }

  let locale = localStorage.getItem("selectedLocale") || navigatorLanguage;
  if (!(locale in messagesDefinition)) {
    locale = "en";
  }

  return locale;
}

export function useLocaleState() {
  return useContext(LocaleContext);
}

export default function TranslationProvider({ children }) {
  const [locale, setLocale] = useState(getInitialLocale());

  const setLocaleWrapper = useCallback(
    (value) => {
      setLocale(value);
      localStorage.setItem("selectedLocale", value);
    },
    [setLocale]
  );

  return (
    <IntlProvider
      messages={messagesDefinition[locale]}
      locale={getInitialLocale()}
      defaultLocale="en"
    >
      <LocaleContext.Provider value={[locale, setLocaleWrapper]}>
        {children}
      </LocaleContext.Provider>
    </IntlProvider>
  );
}
