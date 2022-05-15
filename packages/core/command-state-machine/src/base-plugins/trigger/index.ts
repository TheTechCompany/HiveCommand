
export const handler = async (
	options: any,
	hub: {performOperation: (device: string, release : boolean, operation?: string) => void}
) => {

	return {
		promise: Promise.resolve(true),
		cancel: () => {}
	};

}