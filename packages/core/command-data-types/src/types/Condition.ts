export interface EdgeCondition {
	inputDevice: {
		id: string
		name: string;
	};
	inputDeviceKey: {
		key: string;
	}
	comparator: string;
	assertion: EdgeConditionAssertion;
}

export interface EdgeConditionAssertion {
	setpoint: {
		value: string;
	}
	variable: {
		name: string;
	}
	value: any;
}