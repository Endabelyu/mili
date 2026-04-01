interface FilterOption {
  label: string;
  value: string;
}

interface FilterPillsProps {
  options: FilterOption[];
  activeValue: string;
  onChange: (value: string) => void;
  className?: string;
  shadow?: boolean;
}

export function FilterPills({ options, activeValue, onChange, className = '', shadow = false }: FilterPillsProps) {
  return (
    <div className={`overflow-x-auto no-scrollbar py-1 ${className}`}>
      <div className="flex items-center gap-2 px-1 min-w-max">
        {options.map((option) => {
          const isActive = activeValue === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`
                flow-pill whitespace-nowrap outline-none
                ${isActive ? 'flow-pill-active' : 'flow-pill-inactive hover:bg-zinc-50'}
                ${shadow && isActive ? 'shadow-md shadow-[#a3e635]/20' : ''}
              `}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
