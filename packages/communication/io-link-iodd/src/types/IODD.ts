export interface IODD {
    identity: {
        vendorId: string
        vendorName: string
        deviceId: string
    },
    gradient: string;
    function: {
        inputs: {
            name?: string,
            struct: {
                name?: string,
                bits: IODDBits
            }[]
        }[],
        outputs: {
            name?: string;
            struct: {
                name?: string;
                bits: IODDBits
            }[]
        }[]
    }
}

/**
 * Parse data using an IODD ProcessDataIn Structure
 * 
 * @param value - Raw hex output of IO-Link device
 * 
 * @returns IODD parsed output
 */
export type IODDFilter = (value: any) => any;

export interface IODDBits{
    name?: string;
    type: string;
    length?: string;
    offset: string;
    subindex: string;
}

export interface XMLIODD {
    IODevice: {
        DocumentInfo: {'$': {version: string, releaseDate: string, copyright: string}}[],
        ProfileHeader: {
            ProfileIdentification: string[], 
            ProfileRevision: string[], 
            ProfileName: string[], 
            ProfileSource: string[], 
            ProfileClassID: string[], 
            ISO15745Reference: any[]
        }[],
        ProfileBody: {
            DeviceIdentity: {
                '$': {
                    vendorId: string,
                    vendorName: string,
                    deviceId: string
                },
                VendorText: {'$': {textId: string}}[],
                VendorUrl: {'$': {textId: string}}[],
                VendorLogo: {'$': {name: string}}[],
                DeviceName: {'$': {textId: string}}[],
                DeviceFamily: {'$': {textId: string}}[],
                DeviceVariantCollection: {
                    DeviceVariant: {'$': {productId: string, deviceSymbol: string, deviceIcon: string}}[], 
                    Name: {'$': {textId: string}}[],
                    Description: {'$': {textId: string}}[]
                }[]
            }[], 
            DeviceFunction: {
                Features: {
                    '$': {
                        blockParameter: string, 
                        dataStorage: string, 
                        profileCharacteristic: string
                    },
                    SupportedAccessLocks: {
                        '$': {
                            localUserInterface: string,
                            dataStorage: string, 
                            parameter: string, //these are mostly bools
                            localParameterization: string
                        }
                    }[]
                }[], 
                VariableCollection: {
                    StdVariableRef: {
                        '$': {
                            id: string,
                            fixedLengthRestriction?: string,
                            defaultValue?: string,
                        },
                        StdRecordItemRef?: {'$': {subindex?: string, defaultValue?: string}}[],
                        StdSingleValueRef?: {'$': {value: string}}[],
                        SingleValue?: {
                            '$': {
                                value?: string;
                                textId?: string;
                            },
                            Name: {
                                '$': {textId: string}
                            }[]
                        }[]
                    }[],
                    Variable: {
                        '$': {
                            id: string,
                            index: string,
                            accessRights: string,
                            defaultValue?: string,
                            dynamic?: string
                        },
                        Datatype: {
                            '$': {
                                'xsi:type': string,
                                bitLength: string,
                                subindexAccessSupported?: string;
                            },
                            RecordItem?: {
                                '$': {
                                    bitOffset: string,
                                    subindex: string
                                },
                                ValueRange?: {
                                    lowerValue?: string;
                                    upperValue?: string;
                                }[]
                                SimpleDatatype?: {
                                    '$': {
                                        'xsi:type': string, //XSI:type
                                        bitLength: string
                                    }
                                }[],
                                SingleValue?: {
                                    '$': {
                                        value: string
                                    },
                                    Name: {
                                        '$': {
                                            textId: string
                                        }
                                    }[]
                                }[],
                                Name?: {
                                    '$': {
                                        textId: string
                                    }
                                }[]
                                Description?: {
                                    textId: string
                                }[]
                            }[]
                        }[]
                        Name: {textId: string}[],
                        RecordItemInfo?: {
                            '$': {
                                subindex: string, 
                                defaultValue?: string
                            }
                        }[],
                        Description: {
                            textId: string
                        }[]
                    }[]
                }[], 
                ProcessDataCollection: {
                    ProcessData: {
                        '$': {
                            id: string
                        },
                        ProcessDataIn: {
                            '$': {
                                id: string,
                                bitLength: string
                            },
                            Datatype: {
                                '$': {
                                    'xsi:type': string,
                                    bitLength: string,
                                    subindexAccessSupported: string
                                },
                                RecordItem: {
                                    '$': {
                                        bitOffset: string,
                                        subindex: string
                                    },
                                    SimpleDatatype: {
                                        '$': {
                                            'xsi:type': string,
                                            bitLength: string
                                        },
                                        ValueRange: {
                                            '$': {
                                                lowerValue: string,
                                                upperValue: string
                                            }
                                        }[],
                                        SingleValue: {
                                            '$': {
                                                value: string
                                            },
                                            Name: {
                                                '$': {
                                                    textId: string
                                                }
                                            }[]
                                        }[]
                                    }[],
                                    Name: {'$': {textId: string}}[]
                                    Description: {textId: string}[]
                                }[]
                            }[],
                            Name: {'$': { textId: string}}[]
                        }[],
                        ProcessDataOut?: {
                            '$': {
                                id: string,
                                bitLength: string
                            },
                            Datatype: {
                                '$': {
                                    'xsi:type': string,
                                    bitLength: string,
                                    subindexAccessSupported: string
                                },
                                RecordItem: {
                                    '$': {
                                        bitOffset: string,
                                        subindex: string
                                    },
                                    SimpleDatatype: {
                                        '$': {
                                            'xsi:type': string,
                                            bitLength: string
                                        },
                                        ValueRange: {
                                            '$': {
                                                lowerValue: string,
                                                upperValue: string
                                            }
                                        }[],
                                        SingleValue: {
                                            '$': {
                                                value: string
                                            },
                                            Name: {
                                                '$': {
                                                    textId: string
                                                }
                                            }[]
                                        }[]
                                    }[],
                                    Name: {'$': {textId: string}}[]
                                    Description: {textId: string}[]
                                }[]
                            }[],
                            Name: {'$': { textId: string}}[]
                        }[]
                    }[]
                }[], 
                ErrorTypeCollection: {
                    StdErrorTypeRef: {'$': {code: string, additionalCode: string}}[]
                }[], 
                EventCollection: {
                    StdEventRef: {
                        '$': {
                            code: string
                        }
                    }[],
                    Event: {
                        '$': {
                            code: string,
                            type: string
                        },
                        Name: {textId: string}[]
                        Description: {textId: string}[]
                    }[]
                }[], 
                UserInterface: {
                    MenuCollection: {
                        Menu: {
                            '$': {
                                id: string
                            },
                            MenuRef?: {
                                '$': {
                                    menuId: string
                                },
                                Condition?: {
                                    '$': {
                                        variableId: string,
                                        value: string
                                    }
                                }[]
                            }[],
                            VariableRef?: {
                                '$': {
                                    variableId: string,
                                    gradient?: string;
                                    offset?: string;
                                    displayFormat?: string;
                                    unitCode?: string;
                                    accessRightRestriction?: string;
                                },
                                Button?: {'$': {buttonValue: string}}[]
                            }[],
                            RecordItemRef?: {
                                '$': {
                                    variableId: string,
                                    gradient?: string;
                                    offset?: string;
                                    displayFormat?: string;
                                    unitCode?: string;
                                    accessRightRestriction?: string;
                                },
                                Button?: {'$': {buttonValue: string}}[]
                            }[] 
                        }[]
                    }[]
                }[]
            }[]
        }[],
        CommNetworkProfile: any[],
        ExternalTextCollection: {
            PrimaryLanguage: {
                '$': {
                    'xml:lang': string
                },
                Text: {
                    '$': {
                        id: string;
                        value: string;
                    }
                }[]
            }[]
        }[],
        Stamp: any[]
    }
}   