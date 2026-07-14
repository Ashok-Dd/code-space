import { LANGUAGES } from "../languages";

function LanguageSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Language"
      className="w-16 sm:w-auto sm:max-w-[140px] truncate shrink-0 bg-[#161b22] hover:bg-[#1c2128] border border-gray-800 hover:border-purple-500/50 rounded-lg px-2 sm:px-2.5 py-1.5 sm:py-2 text-xs font-semibold text-gray-300 outline-none focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer"
    >
      {LANGUAGES.map((lang) => (
        <option key={lang.id} value={lang.id}>
          {lang.label}
        </option>
      ))}
    </select>
  );
}

export default LanguageSelect;
