export const solarTerm = {
  minorCold: {
    text: '小寒',
    value: 0,
  },
  vernalEquinox: {
    text: '春分',
    value: 107014,
  },
  summerSolstice: {
    text: '夏至',
    value: 240693,
  },
  autumnalEquinox: {
    text: '秋分',
    value: 375494,
  },
  startOfWinter: {
    text: '立冬',
    value: 440795,
  },
  winterSolstice: {
    text: '冬至',
    value: 504758,
  },
}

export const solarTerms = () => {
  return Array.from(Object.entries(solarTerm), ([key, { text, value }]) => ({
    text,
    value,
  }))
}
