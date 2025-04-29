import CreatableSelect from 'react-select/creatable';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Switch } from '@headlessui/react';
import { MdDateRange } from 'react-icons/md';
import { getYear, getMonth } from 'date-fns';
import { ko } from 'date-fns/locale';
export const RenderField = ({
  field,
  formData,
  handleInputChange,
  handleSelectChange,
  handleSelectSportsInputChange,
  handleDateChange,
  selectedInputValue,
  from
}) => {
  const { name, placeholder, type, options, min, maxLength } = field;
  const commonProps = {
    name,
    value: formData[name],
    onChange: handleInputChange,
    placeholder,
    className: 'w-full border px-3 py-2 rounded-md text-xs',
    autoComplete: 'off'
  };

  const range = (start, end, step = 1) => {
    const output = [];
    for (let i = start; i < end; i += step) {
      output.push(i);
    }
    return output;
  };
  const currentYear = getYear(new Date());
  const years = range(currentYear, currentYear + 20, 1);
  const months = [
    '1월 (Jan)',
    '2월 (Feb)',
    '3월 (Mar)',
    '4월 (Apr)',
    '5월 (May)',
    '6월 (Jun)',
    '7월 (Jul)',
    '8월 (Aug)',
    '9월 (Sep)',
    '10월 (Oct)',
    '11월 (Nov)',
    '12월 (Dec)'
  ];

  switch (type) {
    case 'select':
      return (
        <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
          <CreatableSelect
            options={options}
            placeholder={placeholder}
            {...(from === 'create'
              ? {}
              : {
                  value: formData.sportsName
                    ? options.find((option) => option.value === formData.sportsName) || {
                        label: formData.sportsName,
                        value: formData.sportsName
                      }
                    : null
                })}
            onChange={handleSelectChange}
            inputValue={selectedInputValue}
            onInputChange={handleSelectSportsInputChange}
            formatCreateLabel={(inputValue) => `"${inputValue}" 생성 (최대 10자)`}
            isClearable
            className="text-xs"
          />
        </div>
      );

    case 'textarea':
      return (
        <div className="relative">
          <textarea {...commonProps} rows={4} maxLength={maxLength} style={{ resize: 'none' }} />
          <span className="text-[8px] text-gray-300 absolute right-3 bottom-2">
            {formData[name]?.length || 0}/{maxLength}
          </span>
        </div>
      );

    case 'switch':
      return (
        <div className="flex items-center gap-3 px-1">
          <Switch
            checked={formData[name]}
            onChange={(val) =>
              handleInputChange({
                target: { name, type: 'checkbox', checked: val }
              })
            }
            className={`${
              formData[name] ? 'bg-blue-500' : 'bg-gray-300'
            } relative inline-flex h-5 w-10 items-center rounded-full`}
          >
            <span
              className={`${
                formData[name] ? 'translate-x-5' : 'translate-x-1'
              } inline-block h-3 w-3 transform bg-white rounded-full transition-transform`}
            />
          </Switch>
          <span className="text-xs font-semibold">{placeholder}</span>
        </div>
      );

    case 'date':
      return (
        <div className="relative">
          <DatePicker
            showIcon
            locale={ko}
            icon={<MdDateRange />}
            renderCustomHeader={({
              date,
              changeYear,
              changeMonth,
              decreaseMonth,
              increaseMonth,
              prevMonthButtonDisabled,
              nextMonthButtonDisabled
            }) => (
              <div className="flex justify-center items-center gap-2 p-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    decreaseMonth();
                  }}
                  disabled={prevMonthButtonDisabled}
                >
                  {'<'}
                </button>

                <select
                  value={getYear(date)}
                  onChange={({ target: { value } }) => changeYear(parseInt(value))}
                  className="text-xs border rounded p-1"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}년
                    </option>
                  ))}
                </select>

                <select
                  value={getMonth(date)}
                  onChange={({ target: { value } }) => changeMonth(parseInt(value))}
                  className="text-xs border rounded p-1"
                >
                  {months.map((month, index) => (
                    <option key={month} value={index}>
                      {month}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    increaseMonth();
                  }}
                  disabled={nextMonthButtonDisabled}
                >
                  {'>'}
                </button>
              </div>
            )}
            formatWeekDay={(nameOfDay) => {
              const map = {
                일요일: '일(Sun)',
                월요일: '월(Mon)',
                화요일: '화(Tue)',
                수요일: '수(Wed)',
                목요일: '목(Thu)',
                금요일: '금(Fri)',
                토요일: '토(Sat)'
              };

              return map[nameOfDay];
            }}
            toggleCalendarOnIconClick
            selected={formData[name] ? new Date(formData[name]) : null}
            onChange={(date) => handleDateChange(date)}
            dateFormat="yyyy.MM.dd"
            minDate={new Date()}
            placeholderText={placeholder}
            isClearable
            className="w-full border px-3 py-2 rounded-md text-xs mt-[1px] ml-1"
          />
          {formData[name] && <p className="text-[10px] text-gray-400 mt-1 ml-1">{`마감일: ${formData[name]}`}</p>}
        </div>
      );

    default:
      return <input type={type} {...commonProps} min={min} maxLength={maxLength} />;
  }
};
