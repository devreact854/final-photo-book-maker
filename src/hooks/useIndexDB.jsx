import React, { createContext, useContext, useState, useEffect, useRef, useReducer} from "react";
import { openDB } from "idb";
import imageCompression from 'browser-image-compression';
import { useLibrary } from "../providers/LibraryProvider";
import { useTheme } from "../providers/ThemeProvider";
import { useBookFormat } from "../providers/BookFormatProvider";
import GlobalData from "../global.json";
const PHOTO_DB_NAME = "PhotoBookDB";
const PHOTO_STORE_NAME = "photos";
const WORKS_STORE_NAME = "worksphotos";
const THEME_STORE_NAME = "themeStatus";

const DBContext = createContext();

// Action Types
const DB_ACTIONS = {
  SET_DB_INITIALIZED: "SET_DB_INITIALIZED",
  SET_PHOTOS: "SET_PHOTOS",
  SET_WORKS_PHOTOS: "SET_WORKS_PHOTOS",
  SET_STATE_VARIABLES: "SET_STATE_VARIABLES",
};

// Initial State
const initialDBState = {
  isDBInitialized: false,
  photos: [],
  worksPhotos: [],
  stateVariables: null,
};

// Reducer for managing DB state
const dbReducer = (state, action) => {
  switch (action.type) {
    case DB_ACTIONS.SET_DB_INITIALIZED:
      return { ...state, isDBInitialized: action.payload };
    case DB_ACTIONS.SET_PHOTOS:
      return { ...state, photos: action.payload };
    case DB_ACTIONS.SET_WORKS_PHOTOS:
      return { ...state, worksPhotos: action.payload };
    case DB_ACTIONS.SET_STATE_VARIABLES:
      return { ...state, stateVariables: action.payload };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

// export function useIndexedDB() {
export const DBProvider = ({children}) => {
  const { library, setLibrary } = useLibrary();
  const {theme, setTheme} = useTheme();
  const { format, setFormat } = useBookFormat();
  const [photos, setPhotos] = useState([]);
  const dbRef = useRef(null); // To store the database instance
  const [isDBInitialized, setIsDBInitialized] = useState(false);
  const [state, dispatch] = useReducer(dbReducer, initialDBState);

   // Initialize IndexedDB
   const initDB = async () => {
    try {
      if (!dbRef.current) {
        dbRef.current = await openDB(PHOTO_DB_NAME, 6, {
          upgrade(db) {
            if (!db.objectStoreNames.contains(PHOTO_STORE_NAME)) {
              db.createObjectStore(PHOTO_STORE_NAME, { keyPath: "id", autoIncrement: true });
            }
            if (!db.objectStoreNames.contains(WORKS_STORE_NAME)) {
              db.createObjectStore(WORKS_STORE_NAME, { keyPath: "id", autoIncrement: true });
            }
            if (!db.objectStoreNames.contains(THEME_STORE_NAME)) {
              db.createObjectStore(THEME_STORE_NAME, { keyPath: "id", autoIncrement: true });
            }
          },
        });
      }

      if (!dbRef.current) return;

      // Check if stores were created
      if (
        dbRef.current.objectStoreNames.contains(PHOTO_STORE_NAME) &&
        dbRef.current.objectStoreNames.contains(WORKS_STORE_NAME) &&
        dbRef.current.objectStoreNames.contains(THEME_STORE_NAME)
      ) {
        await loadPhotos(); // Load photos
        await loadWorksPhotos(); // Load works photos
        await loadStateVariables(); // Load state variables

        // Set database as initialized
        dispatch({ type: DB_ACTIONS.SET_DB_INITIALIZED, payload: true });
      } else {
        console.error("One or more object stores are missing.");
      }
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  };

  useEffect(() => {
    initDB();
  }, []);

  useEffect(() => {
    saveWorksPhoto(library);
  }, [library]);

  const base64ToBlob = (base64, mimeType = "image/jpeg") => {
    const byteString = atob(base64.split(",")[1]); // Decode base64
    const arrayBuffer = new Uint8Array(byteString.length);
  
    for (let i = 0; i < byteString.length; i++) {
      arrayBuffer[i] = byteString.charCodeAt(i);
    }
  
    return new Blob([arrayBuffer], { type: mimeType });
  };

  const loadPhotos = async () => {
    try {
      const tx = dbRef.current.transaction(PHOTO_STORE_NAME, "readonly");
      const store = tx.objectStore(PHOTO_STORE_NAME);
      const allPhotos = await store.getAll();
  
      const photosWithURLs = allPhotos.map(photo => {
        const blob = base64ToBlob(photo.thumbnailImage); // Convert base64 to Blob
        const thumbnailImageURL = URL.createObjectURL(blob); // Generate URL
        return {
          ...photo,
          thumbnailImageURL, // Add thumbnail URL for rendering
        };
      });
  
      setPhotos(photosWithURLs); // Update state with full photos and thumbnails
    } catch (error) {
      console.error("Error loading photos:", error);
    }
  };

  const loadWorksPhotos = async () => {
    try {
      const tx = dbRef.current.transaction(WORKS_STORE_NAME, "readonly");
      const store = tx.objectStore(WORKS_STORE_NAME);
      const allWorksPhotos = await store.getAll();
      setLibrary({
        type: "SET",
        key: "library",
        value: allWorksPhotos[0]?.library
          ? allWorksPhotos[0]?.library
          : GlobalData.defaultLibrary,
      });
    } catch (error) {
      setLibrary({
        type: "SET",
        key: "library",
        value: GlobalData.defaultLibrary,
      });
    }
  };

  const loadStateVariables = async () => {
    const tx = dbRef.current.transaction(THEME_STORE_NAME, "readonly");
    const store = tx.objectStore(THEME_STORE_NAME);
    const allStateVariables = await store.getAll();
    setTheme({type:"SET",key:"theme",value:allStateVariables[0]?.colorState || 'light-color'});
    setFormat({type:"SET",key:"format",value:allStateVariables[0]?.bookformatState || 0});
  };

  const getCompressedImage = async (file) => {
    const options = {
      maxSizeMB: 0.5, // Adjust as needed
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    return await imageCompression(file, options);
  };

  const savePhoto = async (photoFile, order) => {
    try {
      const base64Data = await toBase64(photoFile);
      const compressedImageFile = await getCompressedImage(photoFile);
      const thumbnailImage = await toBase64(compressedImageFile);

      const photo = {
        id: new Date().getTime(),
        data: base64Data,
        thumbnailImage,
        order,
        uploadedAt: new Date().toISOString(),
      };

      const tx = dbRef.current.transaction(PHOTO_STORE_NAME, "readwrite");
      const store = tx.objectStore(PHOTO_STORE_NAME);
      await store.add(photo);
      await loadPhotos(); // Refresh state
    } catch (error) {
      console.error("Error saving photo:", error);
    }
  };

  const saveWorksPhoto = async (library) => {
    try {
      const tx = dbRef.current.transaction(WORKS_STORE_NAME, "readwrite");
      const store = tx.objectStore(WORKS_STORE_NAME);
      await store.clear();
      await store.add(library);
    } catch (error) {}
  };

  const saveStateVariables = async (color, bookformat) => {
    try {
      // await initDB();
      if(!dbRef.current) throw new Error('Database is not initialized');
      const tx = dbRef.current.transaction(THEME_STORE_NAME, "readwrite");
      const store = tx.objectStore(THEME_STORE_NAME);
      const allStateVariables = await store.getAll();
  
      // Handle missing color or bookformat using existing state or default
      const stateVariable = {
        id: new Date().getTime(),
        colorState: color || allStateVariables[0]?.colorState || 'light-color',
        bookformatState: bookformat || allStateVariables[0]?.bookformatState || 0,
        uploadedAt: new Date().toISOString(),
      };
  
      // Clear store to keep only the latest state
      await store.clear();
      await store.put(stateVariable);
      await loadStateVariables(); // Refresh state
    } catch (error) {
      console.error("Error saving state variables:", error);
    }

    return {
      getStateVariables,
      saveStateVariables
    }
  };
  
  const getStateVariables = async () => {
    try {
      // await initDB();
      if(!dbRef.current) throw new Error('');
      const tx = dbRef.current.transaction(THEME_STORE_NAME, "readonly");
      const store = tx.objectStore(THEME_STORE_NAME);
      const allStateVariables = await store.getAll();
      
      // Return the first state variable if it exists
      return allStateVariables[0] || null;
    } catch (error) {
      const stateVariable = {
        id: new Date().getTime(),
        colorState: 'light-color',
        bookformatState: 0,
        uploadedAt: new Date().toISOString(),
      };
      return stateVariable;
    }
  };

  const deleteAllPhotos = async () => {
    try {
      const tx = dbRef.current.transaction(PHOTO_STORE_NAME, "readwrite");
      const store = tx.objectStore(PHOTO_STORE_NAME);
      await store.clear();
      setPhotos([]);
    } catch (error) {
      console.error("Error deleting all photos:", error);
    }
  };

  const deleteAllWorksPhotos = async () => {
    try {
      const tx = dbRef.current.transaction(WORKS_STORE_NAME, "readwrite");
      const store = tx.objectStore(WORKS_STORE_NAME);
      await store.clear();
    } catch (error) {
      console.error("Error deleting all works photos:", error);
    }
  };

  const deleteAllStateVariables = async () => {
    try {
      const tx = dbRef.current.transaction(THEME_STORE_NAME, "readwrite");
      const store = tx.objectStore(THEME_STORE_NAME);
      await store.clear();
    } catch (error) {
      console.error("Error deleting all photos:", error);
    }
  };

  const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) {
        reject(new Error("Only image files are allowed"));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  return (
    <DBContext.Provider
      value={{
        isDBInitialized,
        photos,
        initDB,
        savePhoto,
        getStateVariables,
        saveStateVariables,
        deleteAllPhotos,
        deleteAllWorksPhotos,
        deleteAllStateVariables,
      }}
    >
      {children}
    </DBContext.Provider>
  )
}

// Hook to use DB context
export const useDB = () => {
  const context = useContext(DBContext);
  if (!context) {
    throw new Error("useDB must be used within a DBProvider.");
  }
  return context;
};