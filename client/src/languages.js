import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { sql } from "@codemirror/lang-sql";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { rust } from "@codemirror/lang-rust";
import { php } from "@codemirror/lang-php";
import { xml } from "@codemirror/lang-xml";
import { StreamLanguage } from "@codemirror/language";
import { go } from "@codemirror/legacy-modes/mode/go";
import { yaml } from "@codemirror/legacy-modes/mode/yaml";
import { shell } from "@codemirror/legacy-modes/mode/shell";
import { ruby } from "@codemirror/legacy-modes/mode/ruby";

// id is what's persisted on the snippet; label is shown in the picker.
export const LANGUAGES = [
  { id: "plaintext", label: "Plain Text" },
  { id: "javascript", label: "JavaScript", extension: () => javascript({ jsx: true }) },
  { id: "typescript", label: "TypeScript", extension: () => javascript({ jsx: true, typescript: true }) },
  { id: "python", label: "Python", extension: () => python() },
  { id: "html", label: "HTML", extension: () => html() },
  { id: "css", label: "CSS", extension: () => css() },
  { id: "json", label: "JSON", extension: () => json() },
  { id: "markdown", label: "Markdown", extension: () => markdown() },
  { id: "sql", label: "SQL", extension: () => sql() },
  { id: "cpp", label: "C / C++", extension: () => cpp() },
  { id: "java", label: "Java", extension: () => java() },
  { id: "rust", label: "Rust", extension: () => rust() },
  { id: "php", label: "PHP", extension: () => php() },
  { id: "xml", label: "XML", extension: () => xml() },
  { id: "go", label: "Go", extension: () => StreamLanguage.define(go) },
  { id: "yaml", label: "YAML", extension: () => StreamLanguage.define(yaml) },
  { id: "shell", label: "Shell", extension: () => StreamLanguage.define(shell) },
  { id: "ruby", label: "Ruby", extension: () => StreamLanguage.define(ruby) },
];

const languageById = new Map(LANGUAGES.map((lang) => [lang.id, lang]));

export const getLanguageExtensions = (id) => {
  const lang = languageById.get(id);
  return lang?.extension ? [lang.extension()] : [];
};

export const getLanguageLabel = (id) => languageById.get(id)?.label || "Plain Text";
