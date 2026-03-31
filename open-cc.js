import { Locale } from 'opencc-js';
import { Trie } from 'opencc-js/core'

export function convertText(text, options = {}) {
  const from = options.from || 'cn';
  const to = options.to || 'tw';
  const exDict = options.exDict;

  if (typeof text !== 'string') return text;

  const trie = new Trie();

  if (from !== 't') {
    trie.loadDictGroup(Locale.from[from]);
  }

  if (to !== 't') {
    trie.loadDictGroup(Locale.to[to]);
  }
  if (exDict) {
    let ex;
    if (Array.isArray(exDict) || typeof exDict === 'string') {
      ex = exDict;
    } else if (typeof exDict === 'object') {
      ex = Object.entries(exDict).filter(([l, r]) => l && r);
    }
    if (ex) {
      trie.loadDictGroup([ex]);
    }
  }

  return trie.convert(text);
}
