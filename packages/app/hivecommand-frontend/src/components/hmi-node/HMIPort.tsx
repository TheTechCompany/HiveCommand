import React from 'react'
import { BasePort } from '@hexhive/ui/dist/components/InfiniteCanvas/components/ports/base'

export const HMIPort = (props) => {
    console.log({props})
    return (
        <BasePort 
          
            >
             <div      
             style={{
                position: 'absolute',
                    left: `${props.x}px`,
                    top: `${props.y}px`,
                transform: `rotate(${props.rotation || 0}deg) scaleX(${1/props.scaleX}) scaleY(${1/props.scaleY}) ${props.scaleX > 1 ? `translateX(${1/props.scaleX * 100}%)` : ''} ${props.scaleY > 1 ? `translateY(${1/props.scaleY * 100}%)` : ''}`
            }} >
                <div
                    style={{
                        borderRadius: 7, 
                        width: 7, 
                        height: 7, 
                        position: 'absolute',
                        top: '2',
                        background: 'gray'
                    }} />
                <div 
                    style={{
                        width: 20,
                        height: 2,
                        marginTop: '2px',
                        background: 'gray'
                    }} />
            </div>
        </BasePort>
    )
}