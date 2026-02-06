import React from "react";
import '../../../styles/Dashboard.css';

const AutocompleteInput = React.forwardRef(({
  value,
  onChange,
  onKeyDown,
  suggestions = [],
  highlightIndex = -1,
  onSelect,
  onHover,
  placeholder = '',
  inputProps = {}
}, ref) => {
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        {...inputProps}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        autoComplete="off"
      />
      {suggestions && suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((s, i) => (
            <li
              key={s.id ?? `${i}`}
              className={i === highlightIndex ? 'highlight' : ''}
              onMouseDown={(ev) => { ev.preventDefault(); onSelect && onSelect(s); }}
              onMouseEnter={() => onHover && onHover(i)}
            >
              {typeof s === 'string' ? s : (s.label ?? s.title ?? s.name ?? JSON.stringify(s))}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

export default AutocompleteInput;