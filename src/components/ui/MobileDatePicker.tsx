import { useState, useCallback, useEffect, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface MobileDatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  label?: string;
  error?: string;
  helper?: string;
  min?: Date;
  max?: Date;
  placeholder?: string;
  className?: string;
}

export function MobileDatePicker({
  value,
  onChange,
  label,
  error,
  helper,
  min,
  max,
  placeholder = 'Select date',
  className = '',
}: MobileDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value || new Date());
  const [tempDate, setTempDate] = useState<Date | null>(value || null);

  // Sync view date when value changes
  useEffect(() => {
    if (value) {
      setViewDate(value);
      setTempDate(value);
    }
  }, [value]);

  // Format date for display
  const formattedDate = useMemo(() => {
    if (!value) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(value);
  }, [value]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: (Date | null)[] = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [viewDate]);

  // Navigation
  const goToPrevMonth = useCallback(() => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const goToToday = useCallback(() => {
    const today = new Date();
    setViewDate(today);
    setTempDate(today);
  }, []);

  // Check if date is selectable
  const isDateSelectable = useCallback((date: Date) => {
    if (min && date < new Date(min.setHours(0, 0, 0, 0))) return false;
    if (max && date > new Date(max.setHours(23, 59, 59, 999))) return false;
    return true;
  }, [min, max]);

  // Check if date is in current month
  const isCurrentMonth = useCallback((date: Date) => {
    return date.getMonth() === viewDate.getMonth();
  }, [viewDate]);

  // Check if date is selected
  const isSelected = useCallback((date: Date) => {
    if (!tempDate) return false;
    return date.toDateString() === tempDate.toDateString();
  }, [tempDate]);

  // Check if date is today
  const isToday = useCallback((date: Date) => {
    return date.toDateString() === new Date().toDateString();
  }, []);

  // Handle date selection
  const handleDateSelect = useCallback((date: Date) => {
    if (!isDateSelectable(date)) return;
    setTempDate(date);
  }, [isDateSelectable]);

  // Handle confirm
  const handleConfirm = useCallback(() => {
    if (tempDate) {
      onChange(tempDate);
      setIsOpen(false);
    }
  }, [tempDate, onChange]);

  // Handle clear
  const handleClear = useCallback(() => {
    setTempDate(null);
  }, []);

  // Month/Year display
  const monthYearDisplay = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(viewDate);
  }, [viewDate]);

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
          {label}
        </label>
      )}

      {/* Input trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`
          w-full px-4 py-4
          bg-white border rounded-xl
          text-left text-base
          transition-all duration-200
          focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
          active:scale-[0.99]
          touch-manipulation min-h-[56px]
          flex items-center gap-3
          ${error ? 'border-red-300' : 'border-gray-200'}
          ${!value ? 'text-gray-400' : 'text-gray-900'}
        `}
      >
        <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <span className="flex-1">{value ? formattedDate : placeholder}</span>
      </button>

      {error && <p className="mt-1.5 text-sm text-red-500 ml-1">{error}</p>}
      {helper && !error && <p className="mt-1.5 text-sm text-gray-500 ml-1">{helper}</p>}

      {/* Bottom Sheet Date Picker */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsOpen(false)}
          />

          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl bottom-sheet-enter max-h-[85vh] flex flex-col">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-100">
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 font-medium min-h-[44px] px-2 touch-manipulation"
              >
                Cancel
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
                {monthYearDisplay}
              </h2>
              <button
                onClick={handleConfirm}
                disabled={!tempDate}
                className="text-blue-600 font-medium min-h-[44px] px-2 touch-manipulation disabled:text-gray-400"
              >
                Done
              </button>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between px-4 py-3">
              <button
                onClick={goToPrevMonth}
                className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 touch-manipulation"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={goToToday}
                className="text-sm font-medium text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 touch-manipulation"
              >
                Today
              </button>
              <button
                onClick={goToNextMonth}
                className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 touch-manipulation"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 px-4 mb-2">
              {weekDays.map(day => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-gray-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 px-4 pb-4 gap-1">
              {calendarDays.map((date, index) => {
                if (!date) return <div key={index} />;

                const selectable = isDateSelectable(date);
                const currentMonth = isCurrentMonth(date);
                const selected = isSelected(date);
                const today = isToday(date);

                return (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(date)}
                    disabled={!selectable}
                    className={`
                      aspect-square rounded-xl flex items-center justify-center text-sm
                      transition-all duration-150
                      touch-manipulation min-h-[44px]
                      ${!currentMonth ? 'text-gray-300' : ''}
                      ${selected ? 'bg-blue-600 text-white font-semibold' : ''}
                      ${today && !selected ? 'bg-blue-50 text-blue-600 font-semibold' : ''}
                      ${!selected && !today && currentMonth && selectable ? 'text-gray-700 hover:bg-gray-100 active:bg-gray-200' : ''}
                      ${!selectable ? 'text-gray-200 cursor-not-allowed' : ''}
                    `}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Quick selections */}
            <div className="border-t border-gray-100 p-4 space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Quick Select</p>
              <div className="flex gap-2 overflow-x-auto pb-safe no-scrollbar">
                {['Today', 'Tomorrow', 'Next Week', 'Next Month'].map((label) => {
                  let date = new Date();
                  if (label === 'Tomorrow') date.setDate(date.getDate() + 1);
                  if (label === 'Next Week') date.setDate(date.getDate() + 7);
                  if (label === 'Next Month') date.setMonth(date.getMonth() + 1);

                  return (
                    <button
                      key={label}
                      onClick={() => {
                        setTempDate(date);
                        setViewDate(date);
                      }}
                      className={`
                        flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium
                        transition-colors touch-manipulation min-h-[44px]
                        ${tempDate?.toDateString() === date.toDateString()
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                        }
                      `}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Native date input fallback for simpler use cases
interface NativeDatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  label?: string;
  error?: string;
  helper?: string;
  min?: Date;
  max?: Date;
  className?: string;
}

export function NativeDatePicker({
  value,
  onChange,
  label,
  error,
  helper,
  min,
  max,
  className = '',
}: NativeDatePickerProps) {
  const formatDate = (date?: Date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      onChange(new Date(e.target.value));
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
          {label}
        </label>
      )}
      <input
        type="date"
        value={formatDate(value)}
        min={formatDate(min)}
        max={formatDate(max)}
        onChange={handleChange}
        className={`
          w-full px-4 py-4
          bg-white border rounded-xl
          text-base text-gray-900
          transition-all duration-200
          focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
          touch-manipulation min-h-[56px]
          ${error ? 'border-red-300' : 'border-gray-200'}
        `}
      />
      {error && <p className="mt-1.5 text-sm text-red-500 ml-1">{error}</p>}
      {helper && !error && <p className="mt-1.5 text-sm text-gray-500 ml-1">{helper}</p>}
    </div>
  );
}
