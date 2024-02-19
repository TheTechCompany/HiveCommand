
export interface AlarmItem {

    id?: string;

    ack?: boolean;

    causeId: string;

    message: string;

    level?: string;


}

export interface AlarmRegister {
    getLast?(message: string, causeId: string, level?: string): Promise<AlarmItem | undefined>;
    create?(message: string, causeId: string, level?: string): Promise<AlarmItem>;
}