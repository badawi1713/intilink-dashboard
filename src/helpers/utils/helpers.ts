const getCurrentYear = new Date().getFullYear();

const currencyFormat = (value: number): string => {
  let rupiah = '';
  const number_string = value.toString();

  for (let i = 0; i < number_string.length; i++) {
    if (i > 0 && i % 3 === 0) {
      rupiah = '.' + rupiah;
    }
    rupiah = number_string[number_string.length - i - 1] + rupiah;
  }

  return `Rp ${rupiah}`;
};

export { currencyFormat, getCurrentYear };
