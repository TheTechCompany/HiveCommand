import { useState } from "react"

export const useModal = () => {
    const [ isOpen, _openModal ] = useState(false);
    
    const [ selected, setSelected ] = useState<any>({})


    const openModal = (bool: boolean, selection?: any) => {
        if(bool){
            setSelected(selection || {});
        }
        _openModal(bool);
    }

    return [isOpen, openModal, selected, setSelected]
}