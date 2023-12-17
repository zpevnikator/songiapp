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

// export function compileSearchCriteria(criteria: string): string[] {
//   const tokens = _.compact(
//     removeDiacritics(criteria ?? "")
//       .toLowerCase()
//       .split(/\s/)
//       .map((x) => x.trim())
//   );
//   return tokens;
// }

export function matchSearchCriteria(text: string, criteria: string) {
  if (!criteria) {
    return true;
  }
  const tokens = _.compact(
    removeDiacritics(criteria ?? "")
      .toLowerCase()
      .split(/\s/)
      .map((x) => x.trim())
  );
  const tested = removeDiacritics(text ?? "").toLowerCase();
  for (const token of tokens) {
    if (!tested.includes(token)) {
      return false;
    }
  }
  return true;
}

export function localeSortByKey(array: any[], field: string) {
  return array.sort((a, b) =>
    String(_.get(a, field)).localeCompare(String(_.get(b, field)))
  );
}

export function getFirstLetter(s: string) {
  if (!s) {
    return "*";
  }
  const letter = removeDiacritics(s).trim()[0].toUpperCase();
  if (!letter.match(/[A-Z]/)) {
    return "*";
  }

  return letter;
}

export function removeHtmlTags(text: string) {
  return text.replace(/<[^>]+>/g, "");
}
