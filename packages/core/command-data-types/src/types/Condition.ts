export interface EdgeCondition {
	inputDevice: string;
	inputDeviceKey: string
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