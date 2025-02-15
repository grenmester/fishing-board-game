// takes in a camel case string and converts it to title case
export const camelToTitleCase = (str: string) => {
  let titleCaseStr = str.replace(/([A-Z])/g, " $1").trim();
  titleCaseStr = titleCaseStr.charAt(0).toUpperCase() + titleCaseStr.slice(1);
  return titleCaseStr;
};
