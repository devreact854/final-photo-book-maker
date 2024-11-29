import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import Grid2 from "@mui/material/Grid2";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useDrop, useDrag } from "react-dnd";
import { useDispatch } from "react-redux";
import "../index.css";

import trashIcon from "../assets/icons/trash-solid.svg";
import { useTheme } from "../providers/ThemeProvider";
import { useBookFormat } from "../providers/BookFormatProvider";
import { useLayout } from "../providers/LayoutProvider";
import { useLibrary } from "../providers/LibraryProvider";
import GlobalData from "../global.json";
import SideImageTool from "./SideImageTool";
import TextEditModal from "./TextEditModal";
import BookLayoutVerticalLineCenter, { BookLayoutVerticalLineLeft, BookLayoutVerticalLineRight } from "./BookLayoutVerticalLine";
import { setTab } from "../features/tabSlice";
import UseWindowWidth from "./UseWindowWidth";
import { useDB } from "../hooks/useIndexDB";

const ItemTypes = {
  LIBRARY_IMAGE: "LIBRARY_IMAGE",
  CONTAINER_IMAGE: "CONTAINER_IMAGE",
};

const DroppableContent = ({
  parentID,
  dropID,
  data,
  image,
  imageStyle,
  text,
  textStyle,
  list,
  index,
  isSelectedId,
  setIsSelectedId,
  currentBookFormat,
  currentStyle,
  isSelectedSideImageTool,
  isLoadedImageFlag,
  setIsLoadedImageFlag,
}) => {
  const { library, setLibrary } = useLibrary();
  const imageRef = useRef(null);
  const imageContainerRef = useRef(null);
  const backgroundContainerRef = useRef(null);
  const [scale, setScale] = useState(imageStyle?.scale ?? 1);
  const [newImageWidth, setNewImageWidth] = useState(null);
  const [newImageHeight, setNewImageHeight] = useState(null);
  const [rotation, setRotation] = useState(imageStyle?.rotate ?? 0);
  const [position, setPosition] = useState({
    x: imageStyle?.position?.x ?? 0,
    y: imageStyle?.position?.y ?? 0,
  });
  const [isMoving, setIsMoving] = useState(false);
  const [isContracting, setIsContracting] = useState(false);
  const [isExpanding, setIsExpanding] = useState(true);
  const dragStart = useRef({ x: 0, y: 0 });
  const [isLoadedImage, setIsLoadedImage] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const imageContainerID = `image_container_${parentID}_${dropID}`;
  const [isHovered, setIsHovered] = useState(false);

  const [xDirect, setXDirect] = useState(0); // 1: right,2: left
  const [yDirect, setYDirect] = useState(0); // 1: bottom, 2: top

  const [isActiveComponentId, setIsActiveComponentId] = useState(false);
  const windowWidth = UseWindowWidth();
  const {photos} = useDB();

  const tolerance = 5;

  const expandImage = () => {
    if (scale > 1.8) {
      setIsExpanding(false);
      return;
    }
    setXDirect(0);
    setYDirect(0);
    setIsContracting(true);
    setScale((prevScale) => {
      const newScale = prevScale + 0.2;
      return newScale;
    });
  };

  const contractImage = () => {
    if (scale == 1) {
      setIsContracting(false)
      return;
    };
    setIsExpanding(true);
    const { imgW, imgH, contW, contH } = getWidthAndHeight();

    let currentCenterX = position.x;
    let currentCenterY = position.y;

    let x1 = Math.abs(contW / 2 - currentCenterX);
    let x2 = Math.abs(-contW / 2 - currentCenterX);
    let y1 = Math.abs(contH / 2 - currentCenterY);
    let y2 = Math.abs(-contH / 2 - currentCenterY);

    let delta_x = 0;
    let delta_y = 0;

    if (xDirect == 0 && yDirect == 0) {
      let diffX1 = ((imgW / 2) * (scale - 0.2)) / scale - x1;
      let diffX2 = ((imgW / 2) * (scale - 0.2)) / scale - x2;

      let stepX = ((imgW / 2) * 0.2) / scale;

      if (diffX2 < diffX1 && Math.abs(diffX2) / stepX < 1) {
        // left boundary
        delta_x = diffX2;
        setXDirect(2);
      } else if (diffX1 < diffX2 && Math.abs(diffX1) / stepX < 1) {
        // right boundary
        delta_x = -diffX1;
        setXDirect(1);
      }

      let diffY1 = ((imgH / 2) * (scale - 0.2)) / scale - y1;
      let diffY2 = ((imgH / 2) * (scale - 0.2)) / scale - y2;

      let stepY = ((imgH / 2) * 0.2) / scale;

      if (diffY2 < diffY1 && Math.abs(diffY2) / stepY < 1) {
        // top boundary
        delta_y = diffY2;
        setYDirect(2);
      } else if (diffY1 < diffY2 && Math.abs(diffY1) / stepY < 1) {
        // bottom boundary
        delta_y = -diffY1;
        setYDirect(1);
      }

      setPosition({
        x: currentCenterX + delta_x,
        y: currentCenterY + delta_y,
      });
    } else {
      if (scale === 1) return;
      let stepX = ((imgW / 2) * 0.2) / scale;
      let stepY = ((imgH / 2) * 0.2) / scale;
      let delta_x = 0;

      if (xDirect != 0) {
        delta_x = [(-1) ** (xDirect - 1)] * stepX;
      }

      let delta_y = 0;
      if (yDirect != 0) {
        delta_y = [(-1) ** (yDirect - 1)] * stepY;
      }

      setPosition({
        x: currentCenterX + delta_x,
        y: currentCenterY + delta_y,
      });
    }
    setScale((prevScale) => {
      const newScale = Math.max(1, prevScale - 0.2);
      return newScale;
    });
  };

  // const rotateImage = () => setRotation((prevAngle) => (prevAngle + 90));
  const rotateImage = () => {
    centerImage();
    setScale(1); // Reset scale
    setIsExpanding(true);
    setIsContracting(false);

    const { imgW, imgH, contW, contH } = getWidthAndHeight();

    // Image dimensions in different orientations
    let horizonW,
      horizonH,
      verticalW,
      verticalH,
      horizonRateW,
      horizonRateH,
      verticalRateW,
      verticalRateH;

    // Update rotation angle
    setRotation((prevAngle) => prevAngle + 90);

    if (rotation % 180 === 0) {
      verticalW = imgH;
      verticalH = imgW;
      verticalRateW = contW / verticalW;
      verticalRateH = contH / verticalH;
    } else {
      horizonW = imgH;
      horizonH = imgW;
      horizonRateW = contW / horizonW;
      horizonRateH = contH / horizonH;
    }
    // Determine if the image is in vertical or horizontal orientation
    if (rotation % 180 === 0) {
      // Vertical orientation (fit image by height)
      if (verticalRateW < verticalRateH) {
        // Fit image to container height
        verticalW = imgH * verticalRateH;
        verticalH = contH;
      } else {
        // Fit image to container width
        verticalW = contW;
        verticalH = imgW * verticalRateW;
      }
    } else {
      // Horizontal orientation (fit image by width)
      if (horizonRateW < horizonRateH) {
        // Fit image to container height
        horizonW = contH;
        horizonH = imgH * horizonRateH;
      } else {
        // Fit image to container width
        horizonW = contW;
        horizonH = imgW * horizonRateW;
      }
    }

    // Set the final dimensions
    if (rotation % 180 === 0) {
      setNewImageWidth(verticalH);
      setNewImageHeight(verticalW);
      horizonW = verticalH;
      horizonH = verticalW;
    } else {
      setNewImageWidth(horizonH);
      setNewImageHeight(horizonW);
      verticalW = horizonH;
      verticalH = horizonW;
    }
  };

  const isImageCentered = useMemo(() => {
    return Math.abs(position.x) < tolerance && Math.abs(position.y) < tolerance;
  }, [position.x, position.y]);

  const centerImage = () => setPosition({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsActiveComponentId(isSelectedId === imageContainerID);
    e.stopPropagation(); // Prevents other components from receiving this event
    setIsMoving(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isMoving || !isActiveComponentId) return;
    // Calculate the new position
    let deltaX = e.clientX - dragStart.current.x;
    let deltaY = e.clientY - dragStart.current.y;

    restrictOutlet(deltaX, deltaY);
  };

  const handleMouseUp = () => {
    setIsMoving(false);
  };

  const getWidthAndHeight = () => {
    if (imageRef.current && imageContainerRef.current) {
      const imgContainerRect =
        imageContainerRef.current.getBoundingClientRect();
      const imgRect = imageRef.current.getBoundingClientRect();

      const imgW = imgRect.width;
      const imgH = imgRect.height;
      const contW = imgContainerRect.width;
      const contH = imgContainerRect.height;

      return {
        imgW,
        imgH,
        contW,
        contH,
      };
    }
  };

  const restrictOutlet = (deltaX, deltaY) => {
    let newCenterX = deltaX;
    let newCenterY = deltaY;

    const distances = getWidthAndHeight();
    const { imgH, imgW, contW, contH } = distances;

    if (deltaX >= imgW / 2 - contW / 2 && deltaX > 0) {
      newCenterX = imgW / 2 - contW / 2;
    }
    if (deltaX <= -(imgW / 2 - contW / 2) && deltaX < 0) {
      newCenterX = -(imgW / 2 - contW / 2);
    }
    if (deltaY >= imgH / 2 - contH / 2 && deltaY > 0) {
      newCenterY = imgH / 2 - contH / 2;
    }
    if (deltaY <= -(imgH / 2 - contH / 2) && deltaY < 0) {
      newCenterY = -(imgH / 2 - contH / 2);
    }
    setPosition({
      x: newCenterX,
      y: newCenterY,
    });
  };

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CONTAINER_IMAGE,
    item: { id: dropID, src: image, type: 'CONTAINER_IMAGE', parentID, list }, // Data to pass on drop
    canDrag: !!image, // Only draggable if there's an image
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const [{ isOver }, drop] = useDrop(() => ({
    accept: [ItemTypes.LIBRARY_IMAGE,ItemTypes.CONTAINER_IMAGE],
    drop: async (item) => {
      if(item.type === ItemTypes.LIBRARY_IMAGE) {

        setLibraryImage(item);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const setLibraryImage = (item) => {
    let tempLibrary = library.library;
      let flag = false;
      photos.forEach((data) => {
        if(data.id === item.id) {
          if (tempLibrary[index].image[list]) {
            for (let i = 0; i < tempLibrary[index].image.length; i++) {
              if (tempLibrary[index].image[i].imageOrder == list) {
                tempLibrary[index].image[list].imageId = data.id;
                tempLibrary[index].image[list].src = data.data;
                flag = true;
                break;
              }
            }
          }

          if (!flag) {
            let obj = {
              imageId: data.id,
              src: data.data,
              scale: 1,
              rotate: 0,
              position: { x: 0, y: 0 },
              imageOrder: list,
            };
            tempLibrary[index].image.push(obj);
          }
    
          setLibrary({ type: "SET", key: "library", value: tempLibrary });
        }
      })
      
  }

  const swapImages = (item) => {
    let tempLibrary = library.library;
    let temp = tempLibrary[item.parentID].image[0]; //drag item

    setLibrary({ type: "SET", key: "library", value: tempLibrary });
  };

  drag(drop(imageContainerRef));

  const commonStyles = {
    position: "absolute",
    top: `${data.y}%`,
    left: `${data.x}%`,
    width: `${data.width}%`,
    height: `${data.height}%`,
    color: data.content_type === "text" ? "gray" : undefined,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: isMoving ? "5px solid #4630D4" : "5px solid #fff", // Optional visual feedback
    fontSize: textStyle?.font?.size,
    fontFamily: textStyle?.font?.family,
    fontWeight: textStyle?.font?.weight
  };

  const frontStyles = {
    position: "absolute",
    width: image ? `${newImageWidth}px` : "100%", // Set new width if image exists
    height: image ? `${newImageHeight}px` : "100%", // Set new height if image exists
    backgroundImage: !isLoadedImage
      ? "url('./assets/images/item.png')"
      : `url(${image})`,
    display: "flex",
    backgroundRepeat: "no-repeat",
    justifyContent: "center",
    alignItems: "center",
    opacity: "100%",
    backgroundSize: "cover",
  };

  const frontParentStyles = {
    position: "absolute",
    display: "flex",
    backgroundRepeat: "no-repeat",
    justifyContent: "center",
    alignItems: "center",
    opacity: "100%",
    overflow: "hidden",
    width: "100%",
    height: "100%",
  };

  const containerStyles = {
    position: "absolute",
    top: `${data.y}%`,
    left: `${data.x}%`,
    width: `${data.width}%`,
    height: `${data.height}%`,
    fontSize: data.content_type === "text" ? "24px" : undefined,
    color: data.content_type === "text" ? "gray" : undefined,
    backgroundImage: !isLoadedImage
      ? "url('./assets/images/item.png')"
      : undefined,
    display: "flex",
    backgroundSize: "cover", // Alternatively use "100% 100%" if you don't want aspect ratio maintained
    backgroundRepeat: "no-repeat",
    justifyContent: "center",
    alignItems: "center",
    border:
      isSelectedId && isSelectedId === imageContainerID && isLoadedImage
        ? "5px solid #4630D4"
        : isHovered && isLoadedImage
        ? "5px solid #4630D4"
        : "5px solid transparent",
    transition: "border 0.3s",
    outline:
      isSelectedId && isSelectedId === imageContainerID && isLoadedImage
        ? `5px solid #3f2eba`
        : "",
  };

  const backStyles = {
    width: image ? `${newImageWidth}px` : "100%",
    height: image ? `${newImageHeight}px` : "100%",
    maxWidth: "none",
    opacity: 0.1, // Corrected opacity value
    transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
    transition: !isMoving ? "transform 0.3s ease-out" : "none",
    display:
      isSelectedId === imageContainerID && isSelectedId && isLoadedImage
        ? "block"
        : "none", // Fixed display syntax
  };

  const adjustImage = () => {
    const img = new Image();
    img.src = image;
    img.onload = () => {
      const { naturalWidth, naturalHeight } = img;
      const { newWidth, newHeight } = adjustImageToContainer(
        naturalWidth,
        naturalHeight
      );

      if (imageRef.current) {
        imageRef.current.style.width = `${newWidth}px`;
        imageRef.current.style.height = `${newHeight}px`;

        setNewImageWidth(newWidth);
        setNewImageHeight(newHeight);
      }
    };
  };

  const frontAnimationStyles = {
    transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
    transition: !isMoving ? "transform 0.3s ease-out" : "none", // Transition only when not dragging
  };

  const frontShowingImageStyles = {
    ...frontStyles,
    ...frontAnimationStyles,
  };

  const scaleToContainer = (mm) => {
    return mm * 2.5;
  }

  const getImageContainerStyle = (
    bookformat,
    pagestyle,
    containerWidthRatio,
    containerHeightRatio
  ) => {
    if(windowWidth < 1280) {
      switch (bookformat) {
        case "Square30":
        case "Square21":
          return pagestyle === "cover"
            ? {
                width: ( 216  * containerWidthRatio) / 100,
                height: ( 216  * containerHeightRatio) / 100,
              }
            : {
                width: (426 * containerWidthRatio) / 100,
                height: ( 216  * containerHeightRatio) / 100,
              };
        case "Landscape":
          return pagestyle === "cover"
            ? {
                width: ( 303  * containerWidthRatio) / 100,
                height: (216 * containerHeightRatio) / 100,
              }
            : {
                width: (600 * containerWidthRatio) / 100,
                height: (216 * containerHeightRatio) / 100,
              };
        case "Portrait":
          return pagestyle === "cover"
            ? {
                width: ( 216  * containerWidthRatio) / 100,
                height: (303 * containerHeightRatio) / 100,
              }
            : {
                width: (426 * containerWidthRatio) / 100,
                height: (303 * containerHeightRatio) / 100,
              };
        default:
          return {};
      }
    } else {
      switch (bookformat) {
        case "Square30":
        case "Square21":
          return pagestyle === "cover"
            ? {
                width: ( scaleToContainer(216)  * containerWidthRatio) / 100,
                height: ( scaleToContainer(216)  * containerHeightRatio) / 100,
              }
            : {
                width: (scaleToContainer(426) * containerWidthRatio) / 100,
                height: ( scaleToContainer(216)  * containerHeightRatio) / 100,
              };
        case "Landscape":
          return pagestyle === "cover"
            ? {
                width: ( scaleToContainer(303)  * containerWidthRatio) / 100,
                height: ( scaleToContainer(216)  * containerHeightRatio) / 100,
              }
            : {
                width: (scaleToContainer(600) * containerWidthRatio) / 100,
                height: (scaleToContainer(216)  * containerHeightRatio) / 100,
              };
        case "Portrait":
          return pagestyle === "cover"
            ? {
                width: ( scaleToContainer(216)  * containerWidthRatio) / 100,
                height: (scaleToContainer(303)  * containerHeightRatio) / 100,
              }
            : {
                width: (scaleToContainer(426) * containerWidthRatio) / 100,
                height: (scaleToContainer(303)  * containerHeightRatio) / 100,
              };
        default:
          return {};
      }
    }
  };

  const adjustImageToContainer = (imageWidth, imageHeight) => {
    const imageContainerStyle = getImageContainerStyle(
      currentBookFormat,
      currentStyle,
      data.width,
      data.height
    );
    const { width, height } = imageContainerStyle;

    if (imageWidth >= width && imageHeight >= height) {
      const ratioWidth = imageWidth / (width-15);//shrink problem
      const ratioHeight = imageHeight / (height-15);//shrink problem
      let ratio;
      if (ratioWidth >= ratioHeight) {
        ratio = ratioHeight;
      } else {
        ratio = ratioWidth;
      }
      const newWidth = imageWidth / ratio;
      const newHeight = imageHeight / ratio;
      return { newWidth, newHeight };
    } else if (imageWidth >= width && imageHeight < height) {
      const ratio = height / imageHeight;
      const newWidth = imageWidth * ratio;
      const newHeight = height;
      return { newWidth, newHeight };
    } else if (imageWidth < width && imageHeight >= height) {
      const ratio = width / imageWidth;
      const newWidth = width;
      const newHeight = imageHeight * ratio;
      return { newWidth, newHeight };
    } else if (imageWidth < width && imageHeight < height) {
      const ratioHeight = height / imageHeight;
      const ratioWidth = width / imageWidth;
      let ratio;
      if (ratioWidth >= ratioHeight) {
        ratio = ratioWidth;
      } else {
        ratio = ratioHeight;
      }
      const newWidth = imageWidth * ratio;
      const newHeight = imageHeight * ratio;
      return { newWidth, newHeight };
    }
  };

  useEffect(() => {
    if (image === "" && data.content_type === "image") {
      setIsLoadedImage(false);
    } else {
      setIsLoadedImage(true);
    }
    adjustImage();
  }, [image]);

  const handleClickImageOrNot = () => {
    setIsLoadedImageFlag(isLoadedImage);
  };

  const handleComplete = () => {
    let currentIndex = isSelectedId && isSelectedId.split("_")[2];
    let currentSelect = isSelectedId && isSelectedId.split("_")[4];
    let tempLibrary = library.library;
    tempLibrary[currentIndex].image[currentSelect].scale = scale;
    tempLibrary[currentIndex].image[currentSelect].rotate = rotation;
    tempLibrary[currentIndex].image[currentSelect].position = position;

    setLibrary({ type: "SET", key: "library", value: tempLibrary });
  };

  const handleDelete = () => {
    if (!isSelectedId) {
      console.error("No item selected to delete.");
      return;
    }
  
    // Extract currentIndex and currentSelect from isSelectedId
    const splitId = isSelectedId.split("_");
    const currentIndex = parseInt(splitId[2], 10); // Convert to number
    const currentSelect = parseInt(splitId[4], 10); // Convert to number
  
    // Validate indices and library structure
    if (
      isNaN(currentIndex) ||
      isNaN(currentSelect) ||
      !library.library[currentIndex]
    ) {
      console.error("Invalid index or item.");
      return;
    }
    let tempLibrary = JSON.parse(JSON.stringify(library.library));
    tempLibrary[currentIndex].image = tempLibrary[currentIndex].image.filter(
      (item) => item?.imageOrder !== currentSelect
    );

    setLibrary({ type: "SET", key: "library", value: tempLibrary });
  };
  
  
  return data.content_type === "image" ? (
    <>
      <div
        ref={imageContainerRef}
        // className={`container-border `}
        style={containerStyles}
        alt=""
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`${
            library.selectedLibrary?.list === list &&
            library.selectedLibrary?.index === index
              ? "border-[#4630D4]"
              : "hover:border-[#4630D4]"
          }`}
          alt=""
        >
          <img
            ref={imageRef}
            src={image}
            style={backStyles}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseDown={handleMouseDown}
          />
        </div>

        <div
          ref={backgroundContainerRef}
          className=""
          style={frontParentStyles}
        >
          <div
            id={imageContainerID}
            className={`boarder-image ${
              library.selectedLibrary?.list === list &&
              library.selectedLibrary?.index === index
                ? "border-[#4630D4]"
                : "hover:border-[#4630D4]"
            }`}
            ref={drop}
            style={frontShowingImageStyles}
            alt=""
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseDown={handleMouseDown}
            onClick={handleClickImageOrNot}
          />
          {image === "" ? (
              <>
                {/* Icon Container - Decoupled from scaling */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 1000, // Ensure it is above all other content
                    pointerEvents: "none", // Prevent interfering with user actions
                    isolation: "isolate"
                  }}
                >
                  <InsertPhotoIcon color="action" fontSize="large" />
                </div>
              </>
            ) : null}
        </div>
        <div className="absolute right-[-51px] top-[-10px] z-10">
          {isSelectedId &&
            isSelectedId === imageContainerID &&
            isLoadedImage && (
              <SideImageTool
                onDelete={handleDelete}
                onExpand={expandImage}
                onContract={contractImage}
                onRotate={rotateImage}
                onCenter={centerImage}
                onComplete={handleComplete}
                isCentered={isImageCentered}
                isExpanded={isExpanding}
                isContracted={isContracting}
              />
            )}
        </div>
      </div>
    </>
  ) : (
    <>
      <p className="library-text" style={commonStyles} onClick={openModal}>
        {text}
      </p>
      <TextEditModal isOpen={isModalOpen} onClose={closeModal} textIndex={index} textList={list} />
    </>
  );
};

export default function DesignItem() {
  const { theme } = useTheme();
  const { format } = useBookFormat();
  const { layout, setLayout } = useLayout();
  const { library, setLibrary } = useLibrary();
  const [isSelectedImageContainer, setIsSelectedImageContainer] =
    useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isSelectedId, setIsSelectedId] = useState(null);
  const [selectedImageContainerId, setSelectedImageContainerId] =
    useState(null);
  const [isSelectedSideImageTool, setIsSelectedSideImageTool] = useState(false);
  const [isLoadedImageFlag, setIsLoadedImageFlag] = useState(false);
  const [isSelectedBoarderImage, setIsSelectedBoarderImage] = useState(false);
  const [isSelectedTextEdit, setIsSelectedTextEdit] = useState(false);
  const windowWidth = UseWindowWidth();

  const dispatch = useDispatch();
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

  const backgroundColor = theme.theme === "light-color" ? "white" : "black";
  const bookFormat = format.format;

  const scaleToContainer = (mm) => {
    return mm * 2.5;
  }
  const getContainerStyle = (type) => {
    let width, height;
    if(windowWidth < 1280) {
      if (type === "cover") {
        // Handle different cases based on currentBookFormat
        switch (currentBookFormat) {
            case "Square21": // 216x216 mm
                width = (216);
                height = (216);
                break;
            case "Landscape": // 303x216 mm
                width = (303);
                height = (216);
                break;
            case "Portrait": // 216x303 mm
                width = (216);
                height = (303);
                break;
            case "Square30": // 306x306 mm
                width = (216);
                height = (216);
                break;
            default:
                width = (216); // Default or fallback
                height = (216);
        }
      } else {
          switch (currentBookFormat) {
              case "Square21": // 426x216 mm
                  width = (426);
                  height = (216);
                  break;
              case "Landscape": // 600x216 mm
                  width = (600);
                  height = (216);
                  break;
              case "Portrait": // 426x303 mm
                  width = (426);
                  height = (303);
                  break;
              case "Square30": // 606x306 mm
                  width = (426);
                  height = (216);
                  break;
              default:
                  width = (216); // Default or fallback
                  height = (216);
          } 
      }
    } else {
      if (type === "cover") {
        // Handle different cases based on currentBookFormat
        switch (currentBookFormat) {
            case "Square21": // 216x216 mm
                width = scaleToContainer(216);
                height = scaleToContainer(216);
                break;
            
            case "Landscape": // 303x216 mm
                width = scaleToContainer(303);
                height = scaleToContainer(216);
                break;
            case "Portrait": // 216x303 mm
                width = scaleToContainer(216);
                height = scaleToContainer(303);
                break;
            case "Square30": // 306x306 mm
                width = scaleToContainer(216);
                height = scaleToContainer(216);
                break;
            default:
                width = scaleToContainer(216); // Default or fallback
                height = scaleToContainer(216);
        }
      } else {
          switch (currentBookFormat) {
              case "Square21": // 426x216 mm
                  width = scaleToContainer(426);
                  height = scaleToContainer(216);
                  break;
              case "Landscape": // 600x216 mm
                  width = scaleToContainer(600);
                  height = scaleToContainer(216);
                  break;
              case "Portrait": // 426x303 mm
                  width = scaleToContainer(426);
                  height = scaleToContainer(303);
                  break;
              case "Square30": // 606x306 mm
                  width = scaleToContainer(426);
                  height = scaleToContainer(216);
                  break;
              default:
                  width = scaleToContainer(216); // Default or fallback
                  height = scaleToContainer(216);
          } 
      }
    }
    return { width, height };
  };
  

  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (e.target && e.target.classList.contains("image-container")) {
        setSelectedImageContainerId(e.target.id);
        setIsSelectedImageContainer(true);
      } else {
        setIsSelectedImageContainer(false);
      }

      if (e.target && e.target.classList.contains("boarder-image")) {
        setIsSelectedId(e.target.id); // get boarder-image div, which is image container
        setIsSelectedBoarderImage(true);
      } else {
        setIsSelectedBoarderImage(false);
      }

      if (e.target && e.target.classList.contains("side-image-tool")) {
        setIsSelectedSideImageTool(true);
      } else {
        setIsSelectedSideImageTool(false);
      }

      if (e.target && e.target.classList.contains("library-text")) {
        setIsSelectedTextEdit(true);
      } else {
        setIsSelectedTextEdit(false);
      }
    };

    window.addEventListener("click", handleGlobalClick);

    return () => {
      window.removeEventListener("click", handleGlobalClick);
    };
  }, []);

  const handleClick = (index) => {
    setSelectedIndex(index);
  };

  const addComponent = (index) => {
    const dynamic = {
      component: parseInt(Math.random() * 10),
      image: [{ imageId: "", src: "", zoom: "", rotate: "", position: "" }],
      text: ["Add to text here."],
      type: "interior",
    };
    let temp = [...library.library];
    temp.splice(index + 1, 0, dynamic);
    setLibrary({ type: "SET", key: "library", value: temp });
  };

  return (
    <>
      {library.library
        ? library.library.map((data, index) => (
            <React.Fragment key={data?.id || index}>
              <div
                key={index}
                id={"imageSelector_" + index}
                className="flex relative shadow-lg cursor-pointer"
                style={getContainerStyle(data.type)}
                onClick={() => {
                  handleClick(index);
                  setLayout({ type: "SET", key: "layout", value: data.type });
                  setLayout({
                    type: "SET",
                    key: "selectedComponent",
                    value: index,
                  });
                  {
                    isSelectedImageContainer && dispatch(setTab(1));
                  }
                }}
              >
                
                <div
                  className={`flex items-center w-full  absolute h-[100%] ${
                    layout?.selectedComponent === index
                      ? "border-[#4630D4] border-4"
                      : "border-4 hover:border-[#4630D4]"
                  } border rounded-[5px] `}
                  style={{ padding: "5px" }}
                >
                  
                  <div
                    className="image-container flex w-full h-full shadow-md border"
                    style={{ backgroundColor }}
                  >
                    
                    {data.type === "first" && (
                      <div
                        className="image-container h-full w-[100%]"
                        style={{ backgroundColor: "black" }}
                      ></div>
                    )}
                    

                    <Grid2
                      container
                      className="image-container flex flex-grow h-full relative"
                      width={"100%"}
                    >
                      
                      {categorizedLibraries[data.type][
                        data.component
                      ]?.layout_boxes?.map((box, p) => (
                        <DroppableContent
                          parentID={index}
                          dropID={"droppable_" + p}
                          key={`${index}-${p}`}
                          data={box}
                          image={
                            data.image.find((img) => img.imageOrder === p)
                              ?.src || ""
                          }
                          imageStyle={data.image.find(
                            (img) => img.imageOrder === p
                          )}
                          text={
                            data.text.find((txt) => txt.textOrder === p)
                              ?.textContent || "Add text here."
                          }
                          textStyle={
                            data.text.find(
                              (txt) => txt.textOrder === p
                            )
                          }
                          index={index}
                          list={p}
                          isSelectedId={isSelectedId}
                          setIsSelectedId={setIsSelectedId}
                          currentBookFormat={currentBookFormat}
                          currentStyle={data.type}
                          isSelectedSideImageTool={isSelectedSideImageTool}
                          isLoadedImageFlag={isLoadedImageFlag}
                          setIsLoadedImageFlag={setIsLoadedImageFlag}
                        />
                      ))}
                      {data.type === "interior" && (<BookLayoutVerticalLineCenter bookFormat={bookFormat} />)}
                      {data.type === "first" && (<BookLayoutVerticalLineLeft bookFormat={bookFormat} />)}
                      {data.type === "last" && (<BookLayoutVerticalLineRight bookFormat={bookFormat} />)}

                    </Grid2>
                    {data.type === "last" && (
                      <div
                        className="image-container h-full w-[100%]"
                        style={{ backgroundColor: "black" }}
                      ></div>
                    )}
                  </div>

                  <div className="flex top-[102%] p-3 w-[100%] justify-between absolute">
                    <div>
                      {data.type === "interior"
                        ? 2 * (index - 1)
                        : data.type === "last"
                        ? 2 * (index - 1)
                        : ""}
                    </div>

                    <div>
                      {data.type === "interior"
                        ? 2 * index - 1
                        : data.type === "first"
                        ? 1
                        : ""}
                    </div>
                  </div>
                  {layout?.selectedComponent === index &&
                    layout.layout === "interior" &&
                    (isSelectedImageContainer ||
                      (isSelectedBoarderImage && !isLoadedImageFlag)) && (
                      <ToggleButtonGroup
                        orientation="vertical"
                        exclusive
                        className="bg-[#4834d4] absolute right-[-40px] top-[-4px]"
                      >
                        <ToggleButton
                          value="trash"
                          onClick={() => {
                            const tempLibrary = library.library.filter(
                              (_, key) => key !== index
                            );
                            setLibrary({
                              type: "SET",
                              key: "library",
                              value: tempLibrary,
                            });
                          }}
                        >
                          <img
                            src={trashIcon}
                            alt="del"
                            className="w-[13px] h-[18px]"
                          />
                        </ToggleButton>
                      </ToggleButtonGroup>
                    )}
                </div>

              </div>
              {index != 0 && index != library?.library.length - 1 ? (
                <button
                  className="border border-gray-500 rounded-full text-gray-500 px-4 py-2 hover:bg-black hover:text-white transition-all duration-300"
                  onClick={() => {
                    addComponent(index);
                  }}
                >
                  +
                </button>
              ) : null}
            </React.Fragment>
          ))
        : null}
    </>
  );
}
