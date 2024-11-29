import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import Grid2 from "@mui/material/Grid2";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import { useNavigate } from "react-router-dom";
import { useDrag, useDrop } from "react-dnd";

import { useTheme } from "../providers/ThemeProvider";
import { useBookFormat } from "../providers/BookFormatProvider";
import { useLayout } from "../providers/LayoutProvider";
import { useLibrary } from "../providers/LibraryProvider";
import GlobalData from "../global.json";
import "../index.css";

const ImageContainer = ({
  parentID,
  dropID,
  data,
  image,
  text,
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
  const [newImageWidth, setNewImageWidth] = useState(null);
  const [newImageHeight, setNewImageHeight] = useState(null);
  const [isLoadedImage, setIsLoadedImage] = useState(false);
  const imageContainerID = `image_container_${parentID}_${dropID}`;
  const [isHovered, setIsHovered] = useState(false);

  const commonStyles = {
    position: "absolute",
    top: `${data.y}%`,
    left: `${data.x}%`,
    width: `${data.width}%`,
    height: `${data.height}%`,
    fontSize: data.content_type === "text" ? "6px" : undefined,
    color: data.content_type === "text" ? "gray" : undefined,
    backgroundImage: !isLoadedImage ? "url('./assets/images/item.png')" : ``,
    display: "flex",
    backgroundSize: `100% 100%`,
    backgroundRepeat: "no-repeat",
    justifyContent: "center",
    alignItems: "center",
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
      isHovered && isLoadedImage
        ? "5px solid #4630D4"
        : "5px solid transparent",
    transition: "border 0.3s",
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

  const getImageContainerStyle = (
    bookformat,
    pagestyle,
    containerWidthRatio,
    containerHeightRatio
  ) => {
    switch (bookformat) {
      case "Square30":
      case "Square21":
        return pagestyle === "cover"
          ? {
              width: (188 * containerWidthRatio) / 100,
              height: (188 * containerHeightRatio) / 100,
            }
          : {
              width: (316 * containerWidthRatio) / 100,
              height: (188 * containerHeightRatio) / 100,
            };
      case "Landscape":
        return pagestyle === "cover"
          ? {
              width: (188 * containerWidthRatio) / 100,
              height: (131 * containerHeightRatio) / 100,
            }
          : {
              width: (316 * containerWidthRatio) / 100,
              height: (131 * containerHeightRatio) / 100,
            };
      case "Portrait":
        return pagestyle === "cover"
          ? {
              width: (188 * containerWidthRatio) / 100,
              height: (254 * containerHeightRatio) / 100,
            }
          : {
              width: (316 * containerWidthRatio) / 100,
              height: (254 * containerHeightRatio) / 100,
            };
      default:
        return {};
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
      const ratioWidth = imageWidth / width;
      const ratioHeight = imageHeight / height;
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
        ratio = ratioHeight;
      } else {
        ratio = ratioWidth;
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

  return data.content_type === "image" ? (
    <>
      <div
        ref={imageContainerRef}
        style={containerStyles}
        alt=""
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          ref={backgroundContainerRef}
          className=""
          style={frontParentStyles}
        >
          <div
            id={imageContainerID}
            ref={imageRef}
            className={`boarder-image ${
              library.selectedLibrary?.list === list &&
              library.selectedLibrary?.index === index
                ? "border-[#4630D4]"
                : "hover:border-[#4630D4]"
            }`}
            style={frontStyles}
            alt=""
          >
            {image === "" ? (
              <InsertPhotoIcon color="action" fontSize="large" />
            ) : null}
          </div>
        </div>
      </div>
    </>
  ) : (
    <>
      <p className="library-text" style={commonStyles}>
        {text}
      </p>
    </>
  );
};

const Card = ({
  index,
  data,
  layout,
  setLayout,
  navigate,
  handleClick,
  getContainerStyle,
  isSelectedImageContainer,
  isSelectedId,
  setIsSelectedId,
  categorizedLibraries,
  currentBookFormat,
  isSelectedSideImageTool,
  isLoadedImageFlag,
  setIsLoadedImageFlag,
  backgroundColor,
  moveCard,
  totalCards,
}) => {
  const ref = React.useRef(null);

  const [, drop] = useDrop({
    accept: "image",
    hover: (item, monitor) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;

      if (
        [0, 1, totalCards - 1].includes(dragIndex) ||
        [0, 1, totalCards - 1].includes(hoverIndex)
      ) {
        return;
      }

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only move the item when the mouse has crossed half of the target item's height
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      // Move the image and update the index
      moveCard(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  // Drag functionality
  const [{ isDragging }, drag] = useDrag({
    type: "image",
    item: { id: data.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      // style={{ opacity }}
      key={index}
      id={`imageSelector_${index}`}
      className="flex relative shadow-lg cursor-pointer"
      style={getContainerStyle(data.type)}
      onClick={() => {
        handleClick(index);
        setLayout({ type: "SET", key: "layout", value: data.type });
        setLayout({ type: "SET", key: "selectedComponent", value: index });
      }}
    >
      <div
        className={`flex items-center w-full absolute h-[100%] ${
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
            {categorizedLibraries[data.type][data.component]?.layout_boxes?.map(
              (box, p) => (
                <ImageContainer
                  parentID={index}
                  dropID={`droppable_${p}`}
                  key={p}
                  data={box}
                  image={
                    data.image.find((img) => img.imageOrder === p)?.src || ""
                  }
                  text={
                    data.text.find((txt) => txt.textOrder === p)?.base ||
                    "Add text here."
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
              )
            )}
          </Grid2>
          {data.type === "last" && (
            <div
              className="image-container h-full w-[100%]"
              style={{ backgroundColor: "black" }}
            ></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function DesignLayout() {
  const { layout, setLayout } = useLayout();
  const { library, setLibrary } = useLibrary();
  const navigate = useNavigate();
  const [isSelectedImageContainer, setIsSelectedImageContainer] =
    useState(false);
  const [isSelectedId, setIsSelectedId] = useState(null);
  const { format } = useBookFormat();
  const { theme } = useTheme();

  const [cards, setCards] = useState(library.library);

  const currentBookFormat = useMemo(
    () => GlobalData.BookFormatNickType[parseInt(format.format)],
    [format]
  );

  const layoutObject = useMemo(
    () => GlobalData.LayoutObject[currentBookFormat] || [],
    [currentBookFormat]
  );

  const backgroundColor = theme.theme === "light-color" ? "white" : "black";

  const categorizedLibraries = useMemo(() => {
    const categories = { cover: [], first: [], interior: [], last: [] };
    layoutObject.forEach((item) => {
      categories[item.layout_type]?.push(item);
    });
    return categories;
  }, [layoutObject]);

  const getContainerStyle = (type) => {
    switch (currentBookFormat) {
      case "Square30":
      case "Square21":
        return type === "cover"
          ? { width: 188, paddingBottom: "100%" }
          : { width: 316, paddingBottom: "100%" };
      case "Landscape":
        return type === "cover"
          ? { width: 188, paddingBottom: "72.404%" }
          : { width: 316, paddingBottom: "71.2664%" };
      case "Portrait":
        return type === "cover"
          ? { width: 188, paddingBottom: "140.794%" }
          : { width: 316, paddingBottom: "140.319%" };
      default:
        return {};
    }
  };

  // moveImage function to reorder the images
  const moveCard = useCallback((dragIndex, hoverIndex) => {
    if (
      [0, 1, cards.length - 1].includes(dragIndex) ||
      [0, 1, cards.length - 1].includes(hoverIndex)
    ) {
      return; // Do nothing if the indices are restricted
    }

    setCards((prevCards) => {
      const clonedCards = [...prevCards];
      const [removedItem] = clonedCards.splice(dragIndex, 1);
      clonedCards.splice(hoverIndex, 0, removedItem);
      setLibrary({ type: "SET", key: "library", value: clonedCards });
      return clonedCards;
    });
  }, []);

  const addComponent = (index) => {
    const dynamic = {
      component: parseInt(Math.random() * 10),
      image: [{ imageId: "", src: "", zoom: "", rotate: "", position: "" }],
      text: ["Add to text here."],
      type: "interior",
    };
    let temp = [...library.library];
    temp.splice(index, 0, dynamic);
    setLibrary({ type: "SET", key: "library", value: temp });
  };

  useEffect(() => {
    setCards(library.library);
  }, [library]);

  return (
    <>
      {cards.length > 0 && cards.map((data, index) => (
        <>
          <Card
            key={index}
            index={index}
            data={data}
            layout={layout}
            setLayout={setLayout}
            navigate={navigate}
            handleClick={() => setIsSelectedImageContainer(index)}
            getContainerStyle={getContainerStyle}
            isSelectedImageContainer={isSelectedImageContainer}
            isSelectedId={isSelectedId}
            setIsSelectedId={setIsSelectedId}
            categorizedLibraries={categorizedLibraries}
            currentBookFormat={currentBookFormat}
            backgroundColor={backgroundColor}
            moveCard={moveCard}
            totalCards={cards.length}
          />

          {index === library?.library.length - 1 ? (
            <div className="relative">
              <button
                className="border border-gray-500 rounded-full text-gray-500 px-4 py-2 hover:bg-black hover:text-white transition-all duration-300
                            absolute left-[38%] top-[40%]"
                onClick={() => {
                  addComponent(library?.library.length - 1);
                }}
              >
                +
              </button>
            </div>
          ) : null}
        </>
      ))}
    </>
  );
}
