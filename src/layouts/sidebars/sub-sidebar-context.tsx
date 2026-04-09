
import { createContext, useContext } from 'use-context-selector'

interface SubSidebarContextProps {
    collapsed: boolean
    toggleCollapse: () => void,
    icon?:string,
    name?:string,
}

const SubSidebarContext = createContext<SubSidebarContextProps>({
    collapsed: false,
    toggleCollapse: () => { },
    icon:'',
    name:'',
    
})

export default SubSidebarContext;