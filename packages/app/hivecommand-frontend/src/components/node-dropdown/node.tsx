import React from 'react';
import {useDraggable} from '@dnd-kit/core';

export const Node = (props) => {
  
const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: props.id,
    
  });

  const style = transform ? {
    // transform: `translate3d(${transform.x}px, ${transform.y}px, 50px)`
  } : undefined;

  
  return (
    <div ref={setNodeRef} style={{...style, marginBottom: '6px', zIndex: 100}} {...listeners} {...attributes}>
      {props.children}
    </div>
  );
}