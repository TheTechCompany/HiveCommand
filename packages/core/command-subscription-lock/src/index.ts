import path from 'path'
import { readFileSync, existsSync, writeFileSync } from 'fs';
export interface SubscriptionLockOptions {
	path: string;
}

export interface CommandSubscription {
	master: string;
	id: number;
}

export class SubscriptionLock {
	private opts: SubscriptionLockOptions;

	private lockFile: string;

	private subscriptions : CommandSubscription[] = []

	constructor(opts: SubscriptionLockOptions){
		this.opts = opts;

		this.lockFile = path.join(this.opts.path, './subscription.lock')
	}

	addSubscription(subscription: CommandSubscription){
		this.subscriptions.push(subscription)

		this.write()
	}

	removeSubscription(subscription: CommandSubscription){
		let ix = this.subscriptions.map((x) => x.id).indexOf(subscription.id)

		if(ix > -1){
			this.subscriptions.splice(ix, 1)
		}
		this.write()
	}

	write(){
		writeFileSync(this.lockFile, JSON.stringify(this.subscriptions))
	}

	isSubscriptionLock(){
		if(existsSync(this.lockFile)){
			const lock = readFileSync(this.lockFile, 'utf8')
			return JSON.parse(lock)
		}else{
			return false
		}
	}
}