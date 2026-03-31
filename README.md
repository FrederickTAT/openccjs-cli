# openccjs-cli

A CLI powered by `opencc-js` for batch converting files between Simplified/Traditional Chinese (and locale variants) matched by glob patterns. Edits files in place.

## Install

```bash
npm i -g openccjs-cli
# or
pnpm add -g openccjs-cli
```

Or install in a project:

```bash
pnpm add -D openccjs-cli
```

## Usage

```bash
openccjs --from cn --to tw "./**/*.{js,ts,md}"
```

Note: this overwrites files in place. Use version control (git) or make backups.

### Options

- `--from <locale>`: source locale (default: `cn`)
- `--to <locale>`: target locale (default: `tw`)
- `--ex-dict <dict>`: extra dictionary (inline string or a JSON file path)
- `--verbose`: print processed/skipped file paths

### Supported locales

`cn` / `hk` / `tw` / `twp` / `jp`  
Special value `t`: skip that stage (e.g. `--from t` only applies the output-variant stage).

## Extra Dictionary (--ex-dict)

`--ex-dict` is applied after the built-in `from -> to` conversion. It is loaded into the same Trie and follows longest-match rules, so it can override/fix final output terms.

### 1) Inline string

Format: `left␠right|left␠right|...` (entries separated by `|`, key/value separated by a single space):

```bash
openccjs --from cn --to tw --ex-dict "程序 程式|电话 電話" "./**/*.md"
```

### 2) JSON file path

Supported JSON formats:

- Dictionary string (same format as above): `"程序 程式|电话 電話"`
- Pair array: `[["程序","程式"],["电话","電話"]]`
- Object map: `{"程序":"程式","电话":"電話"}`

Example:

```bash
openccjs --from tw --to jp --ex-dict ./dict.json "./**/*.txt"
```

## Examples

Simplified to Taiwan Traditional:

```bash
openccjs --from cn --to tw "./**/*.{md,txt}"
```

Hong Kong variants to Taiwan variants:

```bash
openccjs --from hk --to tw "./docs/**/*.md"
```

Traditional to Simplified only (skip `from` stage):

```bash
openccjs --from t --to cn "./**/*.md"
```

## Notes

- Only processes files matched by `fast-glob` (`onlyFiles: true`), and does not follow symlinks (`followSymbolicLinks: false`).
- Reads/writes files as `utf8`. If output equals input, it does not write back.
- Files that fail to read/write/convert are counted as skipped; use `--verbose` to see details.
