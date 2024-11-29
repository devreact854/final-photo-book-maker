import { createContext, useContext, useReducer } from "react";

const BookFormatContext = createContext();

const bookFormatReducer = (state, action) => {
  switch (action.type) {
    case "SET": {
      return { ...state, [action.key]: action.value };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
};

export const BookFormatProvider = (props) => {
  const [format, setFormat] = useReducer(bookFormatReducer, { format: 0 });
  return (
    <BookFormatContext.Provider
      value={{ format, setFormat }}
      {...props}
    ></BookFormatContext.Provider>
  );
};

export const useBookFormat = () => {
  const context = useContext(BookFormatContext);
  if (!context) {
    throw new Error("useBookFormat must be used within a BookFormatProvider.");
  }
  return context;
};
