import { Button } from "@mui/material"
import { useMatch, useNavigate, useResolvedPath } from "react-router-dom"

export interface RoutedTabButtonProps {
	path: string;
	label: string;
	default?: boolean;
}

export const RoutedTabButton : React.FC<RoutedTabButtonProps> = (props) => {

	const navigate = useNavigate()

	const resolvedPath = useResolvedPath(props.path)
	const defaultPath = useResolvedPath('')

	const match = useMatch(resolvedPath.pathname)
	const defaultMatch = useMatch(defaultPath.pathname)

	return (
		<Button 
					
			
			onClick={() => {
				// setActiveProgram(undefined)
				// setView(menu_item as any)
				navigate(`${props.path}`)
			}}
			// style={{padding: 6, marginRight: '3px', borderRadius: 3, color: '#fff'}} 
			// active={match !== null || (props.default && defaultMatch !== null)} 
			>
			{props.label}
		</Button>
	)
}