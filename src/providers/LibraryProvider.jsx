import { createContext, useContext, useReducer, useEffect } from "react";
import GlobalData from "../global.json";
const LibraryContext = createContext();

const libraryReducer = (state, action) => {
  switch (action.type) {
    case "SET": {
      return { ...state, [action.key]: action.value };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
};
export const LibraryProvider = (props) => {
  const [library, setLibrary] = useReducer(libraryReducer, {});
  useEffect(() => {}, [library]);
  return (
    <LibraryContext.Provider
      value={{ library, setLibrary }}
      {...props}
    ></LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error("useLibrary must be used within a LibraryProvider.");
  }
  return context;
};
