import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from "react-redux";

import store from "./app/store";
import Home from "./pages/Home";
import { LibraryProvider } from "./providers/LibraryProvider";
import { BookFormatProvider } from "./providers/BookFormatProvider";
import { LayoutProvider } from "./providers/LayoutProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import { DBProvider } from "./hooks/useIndexDB";

function App() {
  return (
    <Provider store={store}> {/* Wrap Redux provider around the entire app */}
      <LibraryProvider>
        <BookFormatProvider>
          <ThemeProvider>
            <LayoutProvider>
              <DBProvider>
                <Router>
                  <Routes>
                    <Route path='/' element={<Home />} />
                  </Routes>
                </Router>
              </DBProvider>
            </LayoutProvider>
          </ThemeProvider>
        </BookFormatProvider>
      </LibraryProvider>
    </Provider>
  );
}

export default App;
