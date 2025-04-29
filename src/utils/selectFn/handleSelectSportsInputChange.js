import { handleInputChangeWithLimit } from './handleInputChangeWithLimit';

export const createHandleSelectSportsInputChange = (setSelectedInputValue) => {
  return (value) => {
    const newValue = handleInputChangeWithLimit(value, 10);
    setSelectedInputValue(newValue);
  };
};
