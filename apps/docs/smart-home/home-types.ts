export interface Light {
    id: string;
    name: string;
    on: boolean;
    level: number;
    color: string | null;
}

export interface Room {
    id: string;
    name: string;
    temperature: number;
    humidity: number;
    target: number;
    blinds: number;
    lights: Light[];
    history: number[];
}

export interface PowerPoint {
    time: Date;
    grid: number;
    solar: number;
}

export interface DayUse {
    day: string;
    grid: number;
    solar: number;
}

export interface DeviceUse {
    device: string;
    kwh: number;
}

export interface Lock {
    id: string;
    name: string;
    locked: boolean;
}

export interface HomeEvent {
    key: string;
    date: Date;
    title: string;
    tone?: 'info' | 'success' | 'caution' | 'danger';
}

export interface Automation {
    id: number;
    name: string;
    on: boolean;
    time: Date | null;
    days: string[];
    action: string;
}

export type Scene = 'home' | 'away' | 'movie' | 'night';
