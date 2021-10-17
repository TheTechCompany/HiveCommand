export abstract class BasePlugin {
	public TAG : string = "BASE";

	async discover() : Promise<any[]> {
		return [];
	}

	async read() : Promise<any[]> {
		return []
	}

}