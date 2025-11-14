function formatNumberFigures(num: number): string {
  if (isNaN(num)) return "0";

  const absNum = Math.abs(num);

  if (absNum >= 1_000_000_000_000) {
    return (num / 1_000_000_000_000).toFixed(2).replace(/\.0+$/, '') + "T";
  } else if (absNum >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2).replace(/\.0+$/, '') + "B";
  } else if (absNum >= 1_000_000) {
    return (num / 1_000_000).toFixed(2).replace(/\.0+$/, '') + "M";
  } else if (absNum >= 1_000) {
    return (num / 1_000).toFixed(2).replace(/\.0+$/, '') + "K";
  } else {
    return num.toString();
  }
}


function formatWithCommas(num: number): string {
  if (isNaN(num)) return "0";
  return num.toLocaleString("en-US");
}

