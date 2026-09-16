function FilterPills({ options, value, onChange }) {
  return (
    <div className="filter-pills">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={`filter-pill ${value === option ? 'active' : ''}`}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export default FilterPills;