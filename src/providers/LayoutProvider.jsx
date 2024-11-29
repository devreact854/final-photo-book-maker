import { createContext, useContext, useReducer } from "react";

const LayoutContext = createContext();

const layoutReducer = (state, action) => {
  switch (action.type) {
    case "SET": {
      return { ...state, [action.key]: action.value };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
};
export const LayoutProvider = (props) => {
  const [layout, setLayout] = useReducer(layoutReducer, { layout: "cover" });
  return (
    <LayoutContext.Provider
      value={{ layout, setLayout }}
      {...props}
    ></LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider.");
  }
  return context;
};
