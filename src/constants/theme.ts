export const C = {
  bg: '#FCFCFA',
  canvas: '#FFFFFF',
  hover: '#F7F4EB',
  inset: '#F1EDE3',
  sep: '#EDE8DA',

  ink: '#0A0F1E',
  ink2: '#2A2F3E',
  muted: '#6B6E78',
  faded: '#A8AAB6',

  blue: '#3B8EDE',
  blueSoft: '#EFF6FE',
  blueDeep: '#1F5FAB',

  green: '#2D7A5F',
  greenSoft: '#EAF3EF',

  amber: '#B5651D',
  amberSoft: '#FBEFD8',

  red: '#A8312C',

  iMsg: '#E9E9EB',
  iMsgBlue: '#0A84FF',
} as const;

export const COLORS = {
  navy: C.ink,
  userBubble: C.blue,
  aiBubble: C.iMsg,
  white: C.canvas,
  black: C.ink,
  gray: C.muted,
  lightGray: C.inset,
  inputBorder: C.sep,
  placeholder: C.faded,
} as const;

export const API_BASE_URL =
  'https://xsbgmr68m7.execute-api.us-east-1.amazonaws.com/Prod/api';
