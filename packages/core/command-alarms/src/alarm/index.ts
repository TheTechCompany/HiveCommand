
export interface AlarmItem {

    id?: string;

    ack?: boolean;

    causeId: string;

    message: string;

    level?: string;

    createdAt: Date;
}

export interface AlarmRegister {
    getLast?(message: string, causeId: string, level?: string): Promise<AlarmItem | undefined>;
    getAll?(): Promise<AlarmItem[] | undefined>;
    
    create?(message: string, causeId: string, level?: string): Promise<AlarmItem>;

    acknowledge?(id: string) : boolean;
}