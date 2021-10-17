export abstract class BasePlugin {
	public TAG : string = "BASE";

	async discover() : Promise<any[]> {
		return [];
	}

	async read(bus: string) : Promise<any[]> {
		return []
	}

	async write(bus: string | null, port: string, value: any) {
		
	}

}