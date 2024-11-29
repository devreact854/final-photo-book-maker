import React from 'react';
import { useDrag } from 'react-dnd';

const ItemTypes = {
    LIBRARY_IMAGE: "LIBRARY_IMAGE",
    CONTAINER_IMAGE: "CONTAINER_IMAGE",
  };

export function ImageContainer({ id, url, type, className }) {
    
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.LIBRARY_IMAGE,
        item: { id, url, type },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));
    
    return (
        <img
            ref={drag}
            src={url}
            alt=''
            className={className}
            style={{ opacity: isDragging ? "0%" : "100%", height: '7rem', objectFit: 'cover'}}
        />
    );
}
