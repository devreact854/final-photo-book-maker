import React, { useEffect, useState, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Typography from "@mui/material/Typography";
import Radio from "@mui/material/Radio";
import { useSelector } from "react-redux";

import ToggleButton from "../components/ToggleButton";
import PhotoLibrary from "../components/PhotoLibrary";
import PhotoLayout from "../components/PhotoLayout";
import DesignPart from "../components/DesignPart";
import Organize from "./Organize";
import PDFGeneration from "../components/PDFGeneration";
import { useTheme } from "../providers/ThemeProvider";
import { useDB } from "../hooks/useIndexDB";

export default function PhotoEdit() {
    const tab = useSelector((state) => state.tab.value);
    const [activeButton, setActiveButton] = useState("edit");
    const [pdfGeneratePage, setPdfGeneratePage] = useState('pdfgenerate');
    const {getStateVariables, saveStateVariables} = useDB();
    const { theme, setTheme } = useTheme();
    const [currentBookFormatState, setCurrentBookFormatState] = useState(null);

    const handleToggle = (whichButton) => {
        setActiveButton(whichButton);
    };

    const handlePageToggle = () => {
        setPdfGeneratePage((prev) => !prev);
    }

    useEffect(() => {
        const loadTheme = async () => {
          const savedTheme = await getStateVariables();
          setCurrentBookFormatState(savedTheme?.bookformatState);
          if (savedTheme && savedTheme.colorState) {
            setTheme({
              type: 'SET',
              key: 'theme',
              value: savedTheme?.colorState || 'light-color',
            });
          }
        };
        loadTheme();
      }, []);

      const handleThemeChange = (value) => {
        setTheme({
          type: 'SET',
          key: 'theme',
          value: value,
        });
        saveStateVariables(value, currentBookFormatState); // Save selected theme to IndexedDB
      };

    return (
        <>
            <DndProvider backend={HTML5Backend}>
                <div className="absolute right-[75px] top-[40px] border-gray-500 mb-4 p-2 bg-blue-500 text-white rounded">
                    <button onClick={handlePageToggle}>
                        {pdfGeneratePage ? "PDF Generate" : "Photo Edit"}
                    </button>
                </div>
                {activeButton === 'edit' ? (
                    <div className="main-container flex flex-row w-full">
                        {tab === 0 && <div className="library-container flex flex-col border-r-2 border-gray-100 items-center">
                            <div className="flex flex-col border-b-4 border-gray-500 items-center mt-16">
                                <p className="h4-typography">
                                    Photo Library
                                </p>
                                <p className="library-explain">Collect your photos and drag the ones</p>
                                <p className="library-explain flex flex-col items-center mb-16">
                                    you like to your photo book
                                </p>
                            </div>
                            <PhotoLibrary />
                        </div>}

                        {tab === 1 && 
                        <div className="library-container flex flex-col border-r-2 border-gray-100 w-[30rem] items-center">
                            <div className="layout-border flex flex-col border-b-4 border-gray-200 items-center mt-16 w-[20rem]">
                                <Typography variant="h4" gutterBottom>
                                Layouts
                                </Typography>
                            </div>

                            <div className="layout-container flex flex-col h-[70vh] overflow-auto border-b-4 border-gray-200 w-[20rem] mt-[1rem] gap-4">
                                <PhotoLayout />
                            </div>
                            <div className="layout-border flex flex-col items-center w-[20rem] mt-4">
                                <Typography variant="h4" gutterBottom className="margin-auto">
                                Color
                                </Typography>

                                <div className="flex flex-row gap-4">
                                <div className="flex">
                                    <Radio
                                    color="success"
                                    checked={theme.theme === "light-color"}
                                    sx={{ transform: "scale(1.5)" }}
                                    onClick={() => handleThemeChange('light-color')}
                                    />
                                </div>
                                <div className="flex">
                                    <Radio
                                    color="secondary"
                                    checked={theme.theme === "dark-color"}
                                    sx={{ transform: "scale(1.5)" }}
                                    onClick={() => handleThemeChange('dark-color')}
                                    />
                                </div>
                                </div>
                            </div>
                        </div>}
                        
                        <div className="flex flex-col w-screen items-center mt-32 gap-32 mb-[230px]">
                            <div
                                className="flex flex-col w-full items-center gap-4"
                                style={{ overflowY: "auto" }}
                            >
                
                                {pdfGeneratePage? (<DesignPart />): (<PDFGeneration />)}
                            </div>
                            <ToggleButton onToggle={handleToggle}/>
                        </div>
                    </div>
                ):(
                    <div className="flex flex-col w-screen items-center mt-[4rem] mb-[20rem] gap-32 overflow-auto">
                        <Organize />
                        <ToggleButton onToggle={handleToggle}/>
                    </div>
                )}
            </DndProvider>
        </>
    )
}