export interface EdgeCondition {
	inputDevice: string;
	inputDeviceKey: string
	comparator: string;
	assertion: EdgeConditionAssertion;
}

export interface EdgeConditionAssertion {
	setpoint: {
		id: string;
		value: string;
	}
	variable: {
		name: string;
	}
	value: any;
}