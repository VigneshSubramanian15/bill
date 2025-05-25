export default function GetNumberToWords(num) {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const teens = [
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "Ten",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  if (num === 0) return "Zero";
  if (num > 999999 || num < 0) return "Number out of range";

  let words = "";

  const getHundreds = (n) => {
    let str = "";
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 11 && n <= 19) {
      str += teens[n - 11] + " ";
    } else {
      str += tens[Math.floor(n / 10)] + " ";
      str += ones[n % 10] + " ";
    }
    return str.trim();
  };

  let lakh = Math.floor(num / 100000);
  let thousand = Math.floor((num % 100000) / 1000);
  let hundred = num % 1000;

  if (lakh > 0) words += getHundreds(lakh) + " Lakh ";
  if (thousand > 0) words += getHundreds(thousand) + " Thousand ";
  if (hundred > 0) words += getHundreds(hundred);

  return words.trim();
}
