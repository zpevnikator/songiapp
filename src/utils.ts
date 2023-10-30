import _ from "lodash";

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export function removeDiacritics(s: string) {
  return String(s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function compileSearchCriteria(criteria: string): string[] {
  const tokens = _.compact(
    removeDiacritics(criteria ?? "")
      .toUpperCase()
      .split(/\s/)
      .map((x) => x.trim())
  );
  return tokens;
}

export function matchSearchCriteria(text: string, tokens: string[]) {
  const normalizedText = removeDiacritics(text).toUpperCase();
  for (const token of tokens) {
    if (!normalizedText.includes(token)) {
      return false;
    }
  }
  return true;
}

export function matchMandatorySearchCriteria(
  textMandatory: string,
  textOptional: string,
  tokens: string[]
) {
  const normalizedTextMandatory = removeDiacritics(textMandatory).toUpperCase();
  const normalizedTextOptional = removeDiacritics(textOptional).toUpperCase();

  let mandatoryIncluded = false;
  for (const token of tokens) {
    if (normalizedTextMandatory.includes(token)) {
      mandatoryIncluded = true;
      continue;
    } else if (normalizedTextOptional.includes(token)) {
      continue;
    }
    return false;
  }
  return mandatoryIncluded;
}

export function localeSortByKey(array: any[], field: string) {
  return array.sort((a, b) =>
    String(_.get(a, field)).localeCompare(String(_.get(b, field)))
  );
}

export function getFirstLetter(s: string) {
  const letter = removeDiacritics(s).trim()[0].toUpperCase();
  return letter || "-";
}
