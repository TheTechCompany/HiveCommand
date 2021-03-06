import { InfiniteCanvasNode } from '@hexhive/ui';
import React, {Reducer} from 'react';

export const useEditor = (reduction: (state, action) => any, initialState: any) => {
	return React.useReducer<
		Reducer<
			{nodes?: InfiniteCanvasNode[]}, 
			{type?: string, data?: any}
		>
	>((state, action) => {

		return reduction(state, action)
		return state;
	}, initialState)

}