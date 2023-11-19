import { IntlProvider } from "react-intl";

import cs from "./i18n/cs.json";
import en from "./i18n/en.json";

export default function TranslationProvider({ children }) {
  return (
    <IntlProvider messages={en} locale="cs" defaultLocale="en">
      {children}
    </IntlProvider>
  );
}
