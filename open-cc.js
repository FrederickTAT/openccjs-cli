import * as OpenCC from 'opencc-js';

const converters = new Map();

export function convertText(text, options = {}) {
  const from = options.from || 'cn';
  const to = options.to || 'tw';

  if (typeof text !== 'string') return text;

  const key = `${from}|${to}`;
  let converter = converters.get(key);

  if (!converter) {
    converter = OpenCC.Converter({ from, to });
    converters.set(key, converter);
  }
  return converter(text);
}
