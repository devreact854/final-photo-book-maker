import React, { useState, useEffect, useRef, useMemo } from "react";
import DownloadForOfflineIcon from "@mui/icons-material/DownloadForOffline";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import { FileUpload } from "primereact/fileupload";

import { ImageContainer } from "./ImageContainer";
import { useLibrary } from "../providers/LibraryProvider";
import { useBookFormat } from "../providers/BookFormatProvider";
import GlobalData from "../global.json";
import { useDB } from "../hooks/useIndexDB";

export default function PhotoLibrary() {
  const {initDB, savePhoto, photos} = useDB();
  const { library, setLibrary } = useLibrary();
  const { format } = useBookFormat();
  const fileUploadRef = useRef(null);
  const [confPhoto, setConfPhoto] = useState([]);

  const initSetting = async () => {
    let tempArry = [];
    photos.map((data, key) => {
      let cnt = 0;
      library.library?.map((item, index) => {
        item?.image?.map((list) => {
          if (list.imageId == data.id) {
            cnt++;
          }
        });
      });
      data.cnt = cnt;
      tempArry.push(data);
    });
    setConfPhoto([...tempArry]);
  };

  useEffect(() => {
    initSetting();
  }, [library,photos]);


  const currentBookFormat = useMemo(
    () => GlobalData.BookFormatNickType[parseInt(format.format)],
    [format]
  );

  const layoutObject = useMemo(
    () => GlobalData.LayoutObject[currentBookFormat] || [],
    [currentBookFormat]
  );

  const categorizedLibraries = useMemo(() => {
    const categories = { cover: [], first: [], interior: [], last: [] };
    layoutObject.forEach((item) => {
      categories[item.layout_type]?.push(item);
    });

    return categories;
  }, [layoutObject]);
  
  const customChooseOptions = {
    label: "Upload your photo",
    icon: <DownloadForOfflineIcon />,
    className: "custom-choose-button",
  };

  const onUpload = async (e) => {
    const uploadedFiles = Array.from(e.files);
  
    // Retry logic for initDB
    let dbInitialized = false;
    let retryCount = 0;

    while (!dbInitialized && retryCount < 5) { // Retry up to 5 times
      try {
        await initDB();
        dbInitialized = true; // Exit loop if successful
      } catch (error) {
        retryCount++;
        console.error(`initDB failed, retrying... (${retryCount})`, error);
        await new Promise((resolve) => setTimeout(resolve, 100)); // Wait 1 second before retrying
      }
    }

    if (dbInitialized) {
      await Promise.all(uploadedFiles.map((file, index) => savePhoto(file, index)));
    }
    
    if (fileUploadRef.current) {
      fileUploadRef.current.clear();
      location.reload();
    }
  };

  const fillBook = () => {
    let tempLibrary = library?.library;

    confPhoto.map((data, index) => {
      for (let i = 0; i < tempLibrary.length; i++) {
        let flag = false;
        for (let j = 0; j < tempLibrary[i]?.image?.length; j++) {
          if (tempLibrary[i].image[j]?.imageId == data?.id) {
            flag = true;
            break;
          }
        }

        if (flag) break;
        else {
          for (let t = 0; t < tempLibrary.length; t++) {
            let tempLength = 0;

            categorizedLibraries[tempLibrary[t]?.type][
              tempLibrary[t]?.component
            ].layout_boxes?.map((category, key) => {
              if (category?.content_type == "image") tempLength++;
            });
            if (tempLibrary[t]?.image.length < tempLength) {
              let obj = {
                imageId: data.id,
                src: data.data,
                scale: 1,
                rotate: 0,
                position: { x: 0, y: 0 },
                imageOrder: tempLibrary[t]?.image.length,
                type: "CONTAINER_IMAGE",
              };
              tempLibrary[t].image.push(obj);
              break;
            }
          }
          break;
        }
      }
    });

    setLibrary({ type: "SET", key: "library", value: tempLibrary });
  };

  return (
    <>
      <div className="flex flex-col h-[60vh] overflow-auto">
      <div className="mt-4 mx-4">
        <ImageList cols={3}>
          {confPhoto.map((image, index) => (
            <ImageListItem key={index}>
              <div style={{ position: 'relative' }}>
                <ImageContainer id={image.id} url={image.thumbnailImage} type={`LIBRARY_IMAGE`} />
                {image?.cnt > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: 'rgb(0, 123, 255)',
                      color: 'white',
                      fontFamily: 'Arial, sans-serif',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontSize: '16px',
                    }}
                  >
                    {image.cnt === 1 ? `✔` : image.cnt}
                  </div>
                )}
              </div>
            </ImageListItem>
          ))}
        </ImageList>
      </div>
      </div>
      <div
        id="btn-album-upload"
        className="image-uploader-btn flex flex-row mt-32 gap-8 mb-[48px]"
      >
        <div className="flex">
          <FileUpload
            name="demo[]"
            multiple
            ref={fileUploadRef}
            auto
            accept="image/*" // Restrict to image files only
            maxFileSize={20000000} // 2MB limit
            onSelect={onUpload}
            chooseLabel="Upload"
            chooseOptions={customChooseOptions}
            itemTemplate={() => {}}
            customUpload
          />
        </div>
        <div className="flex">
          {confPhoto.length > 0 && (
            <button
              className="border border-gray-500 text-gray-500 px-4 py-2 rounded hover:bg-black hover:text-white transition-all duration-300"
              onClick={fillBook}
            >
              Fill book
            </button>
          )}
        </div>
      </div>
    </>
  );
}
