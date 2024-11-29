import { createContext, useContext, useReducer } from "react";

const ThemeContext = createContext();

const themeReducer = (state, action) => {
  switch (action.type) {
    case "SET": {
      return { ...state, [action.key]: action.value };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
};
export const ThemeProvider = (props) => {
  const [theme, setTheme] = useReducer(themeReducer, { theme: "light-color" });
  return (
    <ThemeContext.Provider
      value={{ theme, setTheme }}
      {...props}
    ></ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider.");
  }
  return context;
};
