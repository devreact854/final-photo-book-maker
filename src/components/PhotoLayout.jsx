import React, { useEffect, useRef, useState } from "react";
import { useBookFormat } from "../providers/BookFormatProvider";
import { useLayout } from "../providers/LayoutProvider";
import GlobalData from "../global.json";
import { useLibrary } from "../providers/LibraryProvider";

export default function PhotoLayout() {
  const [currentLayoutData, setCurrentLayoutData] = useState([]);
  const { format } = useBookFormat();
  const { layout, setLayout } = useLayout();
  const { library, setLibrary } = useLibrary();
  const [selectLayout, setSelectLayout] = useState(0);

  const layoutRefs = useRef([]); // Store refs for each layout

  let tempLibrary = [];

  useEffect(() => {
    // Safely access the currentBookFormat and layoutObject
    const currentBookFormat =
      GlobalData.BookFormatNickType?.[parseInt(format?.format)];
    const layoutObject = GlobalData.LayoutObject?.[currentBookFormat];

    if (layoutObject) {
      const realData = layoutObject.filter(
        (data) => data.layout_type === layout?.layout
      );
      setCurrentLayoutData([...realData]);
    }

    setSelectLayout(
      library?.library?.[layout?.selectedComponent]?.component || 0
    );
  }, [format, layout, library]);

  useEffect(() => {
    if (layoutRefs.current[selectLayout]) {
      layoutRefs.current[selectLayout].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectLayout]);

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      {currentLayoutData?.map((data, index) => (
        <div
          key={index}
          ref={(el) => (layoutRefs.current[index] = el)} // Store ref for each layout
          className={`flex rounded-lg border-4 cursor-pointer `}
        >
          <div
            className={`flex rounded-lg border-4 ${
              selectLayout === index
                ? "border-[#4630D4]"
                : "border-white hover:border-[#4630D4]"
            }`}
            onClick={() => {
              tempLibrary = library?.library ? [...library.library] : [];
              if (tempLibrary[layout?.selectedComponent]) {
                tempLibrary[layout.selectedComponent].component = index;

                setLibrary({
                  type: "SET",
                  key: "library",
                  value: tempLibrary,
                });
              }
            }}
          >
            <img
              src={data.get_url?.svg || "fallback_image_url"} // Fallback image if undefined
              alt={`Layout ${index}`}
              className="w-full h-full"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
