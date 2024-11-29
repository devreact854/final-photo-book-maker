import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLibrary } from "../providers/LibraryProvider";
import { Grid2 } from "@mui/material";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

import GlobalData from "../global.json";
import { useBookFormat } from "../providers/BookFormatProvider";
import { useLayout } from "../providers/LayoutProvider";
import { useTheme } from "../providers/ThemeProvider";

const mmToPx = (mm, ppi = 96) => {
    return mm * (ppi / 25.4);
}

const ImageContainer3 = ({
    data,
    image,
    imageStyle,
    text,
    textStyle,
    list,
    index,
    currentBookFormat,
    currentStyle,
    onUpdateAttributes,
}) => {
    const imageRef = useRef(null);
    const imageContainerRef = useRef(null);
    const backgroundContainerRef = useRef(null);
    const [scale, setScale] = useState(imageStyle?.scale ?? 1);
    const [rotation, setRotation] = useState(imageStyle?.rotate ?? 0);
    const [position, setPosition] = useState({
        x: imageStyle?.position?.x ?? 0,
        y: imageStyle?.position?.y ?? 0,
    });
    const [newImageWidth, setNewImageWidth] = useState(null);
    const [newImageHeight, setNewImageHeight] = useState(null);
    const [isLoadedImage, setIsLoadedImage] = useState(false);

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
    
      const frontAnimationStyles = {
        transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
      };
    
      const frontShowingImageStyles = {
        ...frontStyles,
        ...frontAnimationStyles,
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
            onUpdateAttributes(index, list, {
                width: newWidth,
                height: newHeight,
                x: position.x,
                y: position.y,
                scale,
                rotation,
                originW: naturalWidth, 
                originH: naturalHeight
            });
        }
        };
    };

    const getImageContainerStyle = (
        bookformat,
        pagestyle,
        containerWidthRatio,
        containerHeightRatio
      ) => {
        let width, height;

        if (pagestyle === "cover") {
            // Cover dimensions in mm
            switch (bookformat) {
                case "Square21": // 216x216 mm
                    width = mmToPx(216);
                    height = mmToPx(216);
                    break;
                case "Landscape": // 303x216 mm
                    width = mmToPx(303);
                    height = mmToPx(216);
                    break;
                case "Portrait": // 216x303 mm
                    width = mmToPx(216);
                    height = mmToPx(303);
                    break;
                case "Square30": // 306x306 mm
                    width = mmToPx(306);
                    height = mmToPx(306);
                    break;
                default: // Default size if none match
                    width = mmToPx(216);
                    height = mmToPx(216);
            }
        } else {
            // Interior dimensions in mm (2x the cover width for spread pages)
            switch (bookformat) {
                case "Square21": // 426x216 mm
                    width = mmToPx(426);
                    height = mmToPx(216);
                    break;
                case "Landscape": // 600x216 mm
                    width = mmToPx(600);
                    height = mmToPx(216);
                    break;
                case "Portrait": // 426x303 mm
                    width = mmToPx(426);
                    height = mmToPx(303);
                    break;
                case "Square30": // 606x306 mm
                    width = mmToPx(606);
                    height = mmToPx(306);
                    break;
                default:
                    width = mmToPx(426);
                    height = mmToPx(216);
            }
        }

        // Apply container ratios for responsive adjustments
        return {
            width: (width * containerWidthRatio) / 100,
            height: (height * containerHeightRatio) / 100,
        };
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
    }, []);

    return data.content_type === "image" ? (
        <>
            <div
                ref={imageContainerRef}
                style={containerStyles}
                alt=""
            >
                <div
                    ref={backgroundContainerRef}
                    className=""
                    style={frontParentStyles}
                >
                    <div
                        ref={imageRef}
                        style={frontShowingImageStyles}
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
}

const PDFGeneration = () => {
    const { library } = useLibrary();
    const contentRef = useRef(); // Reference for the content to be captured
    const { format } = useBookFormat();
    const { setLayout } = useLayout();
    const { theme } = useTheme();
    const [imageAttributes, setImageAttributes] = useState({}); // Store size, position, scale, rotation

    // Callback function to update image attributes
    const updateImageAttributes = (index, list, attributes) => {
        setImageAttributes((prev) => ({
        ...prev,
        [`${index}-${list}`]: attributes, // Unique key for each image
        }));
    };

    const currentBookFormat = useMemo(
        () => GlobalData.BookFormatNickType[parseInt(format.format)],
        [format]
    );

    const layoutObject = useMemo(
        () => GlobalData.LayoutObject[currentBookFormat] || [], 
        [currentBookFormat]
    );

    const categorizedLibraries = useMemo(() => {
        const categories = {cover: [], first: [], interior: [], last: []};
        layoutObject.forEach((item) => {
            categories[item.layout_type]?.push(item);
        });
        return categories;
    }, [layoutObject]);

    const getContainerStyle = (type) => {
        let width, height;
    
        if (type === "cover") {
            // Handle different cases based on currentBookFormat
            switch (currentBookFormat) {
                case "Square21": // 216x216 mm
                    width = mmToPx(216);
                    height = mmToPx(216);
                    break;
                
                case "Landscape": // 303x216 mm
                    width = mmToPx(303);
                    height = mmToPx(216);
                    break;
                case "Portrait": // 216x303 mm
                    width = mmToPx(216);
                    height = mmToPx(303);
                    break;
                case "Square30": // 306x306 mm
                    width = mmToPx(306);
                    height = mmToPx(306);
                    break;
                default:
                    width = mmToPx(216); // Default or fallback
                    height = mmToPx(216);
            }
        } else {
            switch (currentBookFormat) {
                case "Square21": // 426x216 mm
                    width = mmToPx(426);
                    height = mmToPx(216);
                    break;
                case "Landscape": // 600x216 mm
                    width = mmToPx(600);
                    height = mmToPx(216);
                    break;
                case "Portrait": // 426x303 mm
                    width = mmToPx(426);
                    height = mmToPx(303);
                    break;
                case "Square30": // 606x306 mm
                    width = mmToPx(606);
                    height = mmToPx(306);
                    break;
                default:
                    width = mmToPx(216); // Default or fallback
                    height = mmToPx(216);
            } 
        }
    
        return { width, height };
    };
    const getPDFStyle = (type = "cover") => {
        let pdfWidthMm, pdfHeightMm, pdfWidthPixel, pdfHeightPixel;
        
        if(type === "cover") {
            switch (currentBookFormat) {
                case "Square21": // 216x216 mm
                    pdfWidthMm = 216;
                    pdfHeightMm = 216;
                    pdfWidthPixel = mmToPx(216);
                    pdfHeightPixel = mmToPx(216);
                    break;
                
                case "Landscape": // 303x216 mm
                    pdfWidthMm = 303;
                    pdfHeightMm = 216;
                    pdfWidthPixel = mmToPx(303);
                    pdfHeightPixel = mmToPx(216);
                    break;
                case "Portrait": // 216x303 mm
                    pdfWidthMm = 216;
                    pdfHeightMm = 303;
                    pdfWidthPixel = mmToPx(216);
                    pdfHeightPixel = mmToPx(303);
                    break;
                case "Square30": // 306x306 mm
                    pdfWidthMm = 306;
                    pdfHeightMm = 306;
                    pdfWidthPixel = mmToPx(306);
                    pdfHeightPixel = mmToPx(306);
                    break;
                default:
                    pdfWidthMm = 216;
                    pdfHeightMm = 216;
                    pdfWidthPixel = mmToPx(216); // Default or fallback
                    pdfHeightPixel = mmToPx(216);
            }
        } else {
            switch (currentBookFormat) {
                case "Square21": // 426x216 mm
                    pdfWidthMm = 426;
                    pdfHeightMm = 216;
                    pdfWidthPixel = mmToPx(426);
                    pdfHeightPixel = mmToPx(216);
                    break;
                
                case "Landscape": // 600x216 mm
                    pdfWidthMm = 600;
                    pdfHeightMm = 216;
                    pdfWidthPixel = mmToPx(600);
                    pdfHeightPixel = mmToPx(216);
                    break;
                case "Portrait": // 426x303 mm
                    pdfWidthMm = 426;
                    pdfHeightMm = 303;
                    pdfWidthPixel = mmToPx(426);
                    pdfHeightPixel = mmToPx(303);
                    break;
                case "Square30": // 606x306 mm
                    pdfWidthMm = 606;
                    pdfHeightMm = 306;
                    pdfWidthPixel = mmToPx(606);
                    pdfHeightPixel = mmToPx(306);
                    break;
                default:
                    pdfWidthMm = 426;
                    pdfHeightMm = 216;
                    pdfWidthPixel = mmToPx(426);
                    pdfHeightPixel = mmToPx(216);
            } 
        }

        return {pdfWidthMm, pdfHeightMm, pdfWidthPixel, pdfHeightPixel};
    }

    const backgroundColor = theme.theme === "light-color" ? "white" : "black";

    const coverDimensions = getPDFStyle("cover");
    const otherDimensions = getPDFStyle("other");

    const adjustImageToContainer = (containerW, containerH, width, height) => {
        if (width >= containerW && height >= containerH) {
            const ratioWidth = width / (containerW);//shrink problem
            const ratioHeight = height / (containerH);//shrink problem
            let ratio;
            if (ratioWidth >= ratioHeight) {
              ratio = ratioHeight;
            } else {
              ratio = ratioWidth;
            }
            const newWidth = width / ratio;
            const newHeight = height / ratio;
            return { newWidth, newHeight };
          } else if (width >= containerW && height < containerH) {
            const ratio = containerH / height;
            const newWidth = width * ratio;
            const newHeight = containerH;
            return { newWidth, newHeight };
          } else if (width < containerW && height >= containerH) {
            const ratio = containerW / width;
            const newWidth = containerW;
            const newHeight = height * ratio;
            return { newWidth, newHeight };
          } else if (width < containerW && height < containerH) {
            const ratioHeight = containerH / height;
            const ratioWidth = containerW / width;
            let ratio;
            if (ratioWidth >= ratioHeight) {
              ratio = ratioWidth;
            } else {
              ratio = ratioHeight;
            }
            const newWidth = width * ratio;
            const newHeight = height * ratio;
            return { newWidth, newHeight };
          }
    }

    const adjustWithCanvas = (contW, contH, imgW, imgH) => {
        const ratioWidth = contW / imgW;
        const ratioHeight = contH / imgH;
        let ratio;
        if (imgW >= contW && imgH >= contH) {
            if (ratioWidth >= ratioHeight) {
                ratio = ratioHeight;
            } else {
                ratio = ratioWidth;
            }
            return 1/ratio;
        } else if (imgW >= contW && imgH < contH) {
            ratio = ratioWidth;
            return 1/ratio;
        } else if (imgW < contW && imgH >= contH) {
            ratio = ratioHeight;
            return 1/ratio;
        } else if (imgW < contW && imgH < contH) {
            if (ratioWidth >= ratioHeight) {
                ratio = ratioHeight;
            } else {
                ratio = ratioWidth;
            }
            return 1/ratio;
        } else {
            ratio = 1;
            return ratio;
        }
    }

    const percentToPoints = (percent, totalPoints) => (percent / 100) * totalPoints;

    async function cropImageOnCanvas(originalImageSrc, attributes, cropWidth, cropHeight) {
        return new Promise((resolve) => {
            const originalImage = new Image();
            originalImage.src = originalImageSrc;

            originalImage.onload = () => {
                const { x, y, scale, rotation, originW, originH } = attributes;
                const {newWidth, newHeight} = adjustImageToContainer(cropWidth, cropHeight, originW, originH);

                //create rotate canvas
                const rotateCanvas = document.createElement('canvas');
                const rotateCtx = rotateCanvas.getContext('2d');

                if(rotation === 90) {
                    //rotate the image by 90 degree
                    rotateCanvas.width = originH;            //new height, so give height of the original image
                    rotateCanvas.height = originW;          //new width, so give width of the original image
                    rotateCtx.save();
                    rotateCtx.translate(rotateCanvas.width/2, rotateCanvas.height/2);
                    rotateCtx.rotate(Math.PI/2);
                    
                } else if( rotation === 180) {
                    rotateCanvas.width = originW;
                    rotateCanvas.height = originH;
                    rotateCtx.save();
                    rotateCtx.translate(rotateCanvas.width/2, rotateCanvas.height/2);
                    rotateCtx.rotate(Math.PI);
                } else if( rotation === 270) {
                    //rotate the image by 90 degree
                    rotateCanvas.width = originH;            //new height, so give height of the original image
                    rotateCanvas.height = originW;          //new width, so give width of the original image
                    rotateCtx.save();
                    rotateCtx.translate(rotateCanvas.width/2, rotateCanvas.height/2);
                    rotateCtx.rotate(Math.PI*3/2);
                } else {
                    rotateCanvas.width = originW;
                    rotateCanvas.height = originH;
                    rotateCtx.save();
                    rotateCtx.translate(rotateCanvas.width/2, rotateCanvas.height/2);
                    rotateCtx.rotate(0);
                }
                rotateCtx.drawImage(originalImage, -originalImage.width/2, -originalImage.height/2);
                rotateCtx.restore();

                //create canvas to expand the image
                const fitCanvas = document.createElement('canvas');
                const fitCtx = fitCanvas.getContext('2d');

                fitCanvas.width = newWidth;
                fitCanvas.height = newHeight;

                //draw the expanded image
                fitCtx.drawImage(rotateCanvas, 0, 0, newWidth, newHeight);

                //create another canvas for scaleing
                const scaleCanvas = document.createElement('canvas');
                const scaleCtx = scaleCanvas.getContext('2d');
                
                scaleCanvas.width = newWidth * scale;
                scaleCanvas.height = newHeight * scale;

                scaleCtx.save();
                // scaleCtx.scale(scale, scale);
                scaleCtx.drawImage(fitCanvas, 0, 0, newWidth*scale, newHeight*scale);
                
                //create another canvas for cropping
                const cropCanvas = document.createElement('canvas');
                const cropCtx = cropCanvas.getContext('2d');

                cropCanvas.width = cropWidth;
                cropCanvas.height = cropHeight;

                const cropX = (scaleCanvas.width - cropCanvas.width)/2 + x;
                const cropY = (scaleCanvas.height - cropCanvas.height)/2 + y;
                cropCtx.drawImage(scaleCanvas, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

                fitCtx.restore();
                cropCtx.restore();
                scaleCtx.restore();
                resolve(cropCanvas.toDataURL('image/png'));
            };
        });
    }
      

    async function addImageToPdf(
        imageObj, 
        pdfDoc, page, embeddedImage, attributes, 
        pageHeight, pageWidth, 
        imgX, imgY,
        containerW, containerH) 
    {
        // Step 1: Crop the image using the canvas
        const croppedDataUrl = await cropImageOnCanvas(
            imageObj?.src,
            attributes,
            containerW,
            containerH,
        );

        // Step 2: Embed the cropped image back into the PDF
        const croppedImageBytes = await fetch(croppedDataUrl).then((res) =>
            res.arrayBuffer()
        );
        const bottomLeftY = pageHeight - (imgY + containerH);

        const croppedEmbeddedImage = await pdfDoc.embedPng(croppedImageBytes);
        //no rotation
        page.drawImage(croppedEmbeddedImage, {
            x: imgX,
            y: bottomLeftY,
            width: containerW,
            height: containerH,
        });
    }

    function measureText(font, text, fontSize) {
        const textWidth = font.widthOfTextAtSize(text, fontSize); // Measure width
        const textHeight = fontSize; // Approximate height as the font size
      
        return { textWidth, textHeight };
    }
      
    async function generatePDF() {
        const pdfDoc = await PDFDocument.create();
        const { pdfWidthMm: coverWidthMm, pdfHeightMm: coverHeightMm } = coverDimensions;
        const { pdfWidthMm: otherWidthMm, pdfHeightMm: otherHeightMm } = otherDimensions;

        for (const [index, data] of library.library.entries()) {
            const isCoverPage = index === 0;
            const pageWidthMm = isCoverPage ? coverWidthMm : otherWidthMm;
            const pageHeightMm = isCoverPage ? coverHeightMm : otherHeightMm;
            const page = pdfDoc.addPage([mmToPx(pageWidthMm), mmToPx(pageHeightMm)]);

            for (const [p, box] of categorizedLibraries[data.type][data.component]?.layout_boxes.entries() || []) {
                let containerW, containerH, imgX, imgY, boxX;

                if(categorizedLibraries[data.type][data.component]?.layout_type === 'first' 
                ) {
                    containerW = percentToPoints(box.width, mmToPx(pageWidthMm))/2;
                    boxX = percentToPoints((box.x + 100), mmToPx(pageWidthMm))/2;
                    imgX = percentToPoints((box.x + 100), mmToPx(pageWidthMm))/2;
                } else if(
                    categorizedLibraries[data.type][data.component]?.layout_type === 'last'
                ) {
                    containerW = percentToPoints(box.width, mmToPx(pageWidthMm))/2;
                    boxX = percentToPoints(box.x, mmToPx(pageWidthMm))/2;
                    imgX = percentToPoints(box.x, mmToPx(pageWidthMm))/2;
                } else {
                    containerW = percentToPoints(box.width, mmToPx(pageWidthMm));
                    boxX = percentToPoints(box.x, mmToPx(pageWidthMm));
                    imgX = percentToPoints(box.x, mmToPx(pageWidthMm));
                }
                    containerH = percentToPoints(box.height, mmToPx(pageHeightMm));
                    imgY = percentToPoints(box.y, mmToPx(pageHeightMm));

                const boxY = mmToPx(pageHeightMm) - percentToPoints(box.y, mmToPx(pageHeightMm));
                
                const imageKey = `${index}-${p}`;
                const attributes = imageAttributes[imageKey];
                if(box.content_type === "image") {
                    const imageObj = data.image?.find((img) => img.imageOrder === p);
                    const image = imageObj?.src || "";

                    if (typeof image === "string" && image.startsWith("data:image")) {
                        try {
                            const pageWidth = page.getWidth();
                            const pageHeight = page.getHeight();
                            const isPng = image.startsWith("data:image/png");
                            const embeddedImage = isPng
                                ? await pdfDoc.embedPng(image)
                                : await pdfDoc.embedJpg(image);

                            await addImageToPdf(imageObj, pdfDoc, page, embeddedImage, attributes, pageHeight, pageWidth, imgX, imgY, containerW, containerH);
                        } catch(error){
                            console.error(error);
                        }
                    }
                } else if(box.content_type === "text") {
                    const textObj = data.text?.find((txt) => txt.textOrder === p); // Use `p` instead of `box.index`
                    const text = textObj?.textContent || "Add text here";
                    const defineTextId = `text_${index}_${p}`;
                    const textId = textObj?.textId;
                    if (text && (defineTextId === textId)) {
                        const fontSize = parseFloat(textObj?.font?.size) || 14; // Default font size
                        
                        // Embedding the font
                        const font = await pdfDoc.embedFont(StandardFonts.Helvetica); // Replace with your desired font
                        const textColor = rgb(0.5, 0.5, 0.5); // Gray color as RGB

                        const { textWidth, textHeight } = measureText(font, text, fontSize); // text width and height
                        const xOffset = imgX + (containerW - textWidth)/2;
                        const yOffset = mmToPx(pageHeightMm) - (imgY + (containerH - textHeight)/2 + fontSize/4);
                        page.drawText(text, {
                            x: xOffset,
                            y: yOffset,
                            size: fontSize,
                            font: font,
                            color: textColor,
                        });
                    }
                }
            }
        }
        
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "document.pdf";
        link.click();
    }
     
    return (
        <div className="">
            <button 
                onClick={generatePDF} 
                // className="pdf-generate-button bg-blue-500 text-white rounded mb-4"
                className="absolute top-[40px] right-[200px] p-[8px] bg-[#d2b48c] rounded-[5px] text-white"
            >
                Generate PDF
            </button>
            <div ref={contentRef} className="pdf-content bg-gray-100 shadow-lg">
                {library.library && library.library.map((data, index) => (
                    <div 
                        key={index} 
                        className="flex relative shadow-lg"
                        style={getContainerStyle(data.type)}  
                        onClick={() => {
                            setLayout({ type: "SET", key: "layout", value: data.type });
                            setLayout({ type: "SET", key: "selectedComponent", value: index})
                        }}  
                    >
                        <div className="flex items-center w-full absolute h-[100%] border rounded-[5px] p-[5px]">
                            <div className="flex w-full h-full shadow-md border" style={{ backgroundColor }}>
                                {data.type === "first" && (
                                    <div className="h-full w-[100%]" style={{ backgroundColor: "black" }}></div>
                                )}
                                <Grid2 container className="flex flex-grow h-full relative" width={"100%"}>
                                    {categorizedLibraries[data.type][data.component]?.layout_boxes?.map((box, p) => (
                                        <ImageContainer3
                                            key={p}
                                            data={box}
                                            image={
                                                data.image.find((img) => img.imageOrder === p)?.src || ""
                                            }
                                            imageStyle={data.image.find(
                                                (img) => img.imageOrder === p
                                              )}
                                            text={
                                                data.text.find((txt) => txt.textOrder === p)?.textContent ||
                                                "Add text here."
                                            }
                                            textStyle={
                                                data.text.find(
                                                  (txt) => txt.textOrder === p
                                                )
                                            }
                                            index={index}
                                            list={p}
                                            currentBookFormat={currentBookFormat}
                                            currentStyle={data.type}
                                            onUpdateAttributes={updateImageAttributes}
                                        />
                                    ))}
                                </Grid2>
                                {data.type === "last" && (
                                    <div className="h-full w-[100%]" style={{ backgroundColor: "black" }}></div>
                                )}
                            </div>
                            <div className="flex top-[92%] right-[49px] text-[16pt] p-3 w-[95%] justify-between absolute z-10">
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
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PDFGeneration;
