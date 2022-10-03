import { Box } from "grommet"
import { RoutedTabButton } from "./RoutedTabButton"

export interface RoutedTabProps{
	tabs: {
		path: string;
		label: string,
		default?: boolean;
	}[]
}

export const RoutedTabs : React.FC<RoutedTabProps> = (props) => {
	return (
		<Box direction="row" >
			{props.tabs.map((tab) => (
				<RoutedTabButton
					default={tab.default}
					label={tab.label}
					path={tab.path} />
			))}
		</Box>
	)
}