import { reactive } from '@motifx/core';
import type { Automation, DayUse, DeviceUse, HomeEvent, Lock, PowerPoint, Room, Scene } from './home-types';

const MINUTE = 60_000;

const light = (id: string, name: string, on: boolean, level = 80, color: string | null = null) => ({ id, name, on, level, color });

// Each room has its own course over the day and ends at its temperature now, so no two lines lie on each other.
const history = (now: number, shift: number, swing: number) => Array.from({ length: 24 }, (_, i) => Math.round((now + (Math.sin((i + shift) / 3) - Math.sin((23 + shift) / 3)) * swing + ((i * 7 + shift) % 5) * 0.06) * 10) / 10);

/** The scenes: what each one sets. */
const SCENES: Record<Scene, { target: number; lights: number; blinds: number; armed: boolean }> = {
    home: { target: 22, lights: 80, blinds: 100, armed: false },
    away: { target: 17, lights: 0, blinds: 40, armed: true },
    movie: { target: 21, lights: 15, blinds: 0, armed: false },
    night: { target: 19, lights: 0, blinds: 0, armed: true }
};

/**
 * The state of a home and what can be done with it. The values move on their own every two seconds, as if the devices
 * reported them; the page only binds to the state and calls the operations.
 */
export class HomeModel {
    timer = 0;
    readonly state = reactive({
        name: 'Ada’s flat',
        resident: 'Ada',
        now: new Date(),
        outside: 9,
        weather: 'Cloudy',
        humidity: 46,
        air: 34,
        mode: 'heat' as unknown,
        scene: 'home' as Scene,
        armed: false,
        unread: 3,
        washer: 0.42,
        solarNow: 2.4,
        gridNow: 1.6,
        rooms: [
            { id: 'living', name: 'Living room', temperature: 21.4, humidity: 45, target: 22, blinds: 100, lights: [light('ceiling', 'Ceiling', true, 70), light('lamp', 'Reading lamp', true, 45, '#ffb86b'), light('strip', 'TV strip', false, 60, '#6b8cff')], history: history(21.4, 0, 0.8) },
            { id: 'kitchen', name: 'Kitchen', temperature: 22.1, humidity: 52, target: 22, blinds: 100, lights: [light('ceiling', 'Ceiling', true, 90), light('counter', 'Counter', true, 100)], history: history(22.1, 5, 0.6) },
            { id: 'bedroom', name: 'Bedroom', temperature: 19.6, humidity: 48, target: 20, blinds: 30, lights: [light('ceiling', 'Ceiling', false, 60), light('bedside', 'Bedside', false, 30, '#ffcf8a')], history: history(19.6, 9, 1) },
            { id: 'office', name: 'Office', temperature: 21.0, humidity: 41, target: 21, blinds: 80, lights: [light('desk', 'Desk', true, 100), light('shelf', 'Shelf', false, 50, '#9be1c4')], history: history(21, 14, 0.5) },
            { id: 'bath', name: 'Bathroom', temperature: 23.2, humidity: 64, target: 23, blinds: 100, lights: [light('mirror', 'Mirror', false, 100)], history: history(23.2, 3, 0.7) }
        ] as Room[],
        room: 'living' as unknown,
        power: [] as PowerPoint[],
        week: [
            { day: 'Mon', grid: 9.4, solar: 6.1 },
            { day: 'Tue', grid: 8.2, solar: 8.9 },
            { day: 'Wed', grid: 10.6, solar: 3.2 },
            { day: 'Thu', grid: 7.9, solar: 9.4 },
            { day: 'Fri', grid: 8.8, solar: 7.7 },
            { day: 'Sat', grid: 11.3, solar: 5.0 },
            { day: 'Sun', grid: 6.4, solar: 10.2 }
        ] as DayUse[],
        usage: [
            { device: 'Heating', kwh: 6.8 },
            { device: 'Kitchen', kwh: 3.1 },
            { device: 'Laundry', kwh: 2.4 },
            { device: 'Media', kwh: 1.2 },
            { device: 'Lights', kwh: 0.9 }
        ] as DeviceUse[],
        locks: [
            { id: 'front', name: 'Front door', locked: true },
            { id: 'garden', name: 'Garden door', locked: false },
            { id: 'garage', name: 'Garage', locked: true }
        ] as Lock[],
        events: [] as HomeEvent[],
        automations: [
            { id: 1, name: 'Wake up', on: true, time: new Date(2026, 0, 1, 6, 45), days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], action: 'Morning scene' },
            { id: 2, name: 'Leaving', on: true, time: new Date(2026, 0, 1, 8, 30), days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], action: 'Away scene' },
            { id: 3, name: 'Lights out', on: false, time: new Date(2026, 0, 1, 23, 30), days: ['Sat', 'Sun'], action: 'Night scene' }
        ] as Automation[]
    });

    constructor() {
        const now = Date.now();
        // Today so far, every fifteen minutes.
        this.state.power = Array.from({ length: 56 }, (_, i) => {
            const t = new Date(now - (56 - i) * 15 * MINUTE);
            const h = t.getHours() + t.getMinutes() / 60;
            const solar = Math.max(0, Math.sin(((h - 7) / 12) * Math.PI) * 3.2);
            return { time: t, grid: Math.round((0.6 + Math.abs(Math.sin(i / 4)) * 1.4) * 10) / 10, solar: Math.round(solar * 10) / 10 };
        });
        this.log('Front door locked', 'success', 42);
        this.log('Washing machine started', 'info', 35);
        this.log('Garden door opened', 'caution', 12);
    }

    get current(): Room {
        return this.state.rooms.find(r => r.id === this.state.room) ?? this.state.rooms[0];
    }

    get indoor(): number {
        const rooms = this.state.rooms;
        return Math.round((rooms.reduce((sum, r) => sum + r.temperature, 0) / rooms.length) * 10) / 10;
    }

    get lightsOn(): number {
        return this.state.rooms.reduce((n, r) => n + r.lights.filter(l => l.on).length, 0);
    }

    get unlocked(): Lock[] {
        return this.state.locks.filter(l => !l.locked);
    }

    log(title: string, tone?: HomeEvent['tone'], minutesAgo = 0): void {
        const date = new Date(Date.now() - minutesAgo * MINUTE);
        this.state.events = [{ key: `${date.getTime()}-${title}`, date, title, tone }, ...this.state.events].slice(0, 8);
    }

    /** Sets a scene, and gives back what to call to undo it. */
    setScene(scene: Scene): () => void {
        const s = this.state;
        const before = { scene: s.scene, armed: s.armed, rooms: s.rooms.map(r => ({ target: r.target, blinds: r.blinds, lights: r.lights.map(l => ({ on: l.on, level: l.level })) })) };
        const set = SCENES[scene];
        s.scene = scene;
        s.armed = set.armed;
        for (const room of s.rooms) {
            room.target = set.target;
            room.blinds = set.blinds;
            for (const l of room.lights) {
                l.on = set.lights > 0;
                if (set.lights > 0) l.level = set.lights;
            }
        }
        this.log(`Scene: ${scene}`, 'info');
        return () => {
            s.scene = before.scene;
            s.armed = before.armed;
            s.rooms.forEach((room, i) => {
                room.target = before.rooms[i].target;
                room.blinds = before.rooms[i].blinds;
                room.lights.forEach((l, j) => Object.assign(l, before.rooms[i].lights[j]));
            });
        };
    }

    /** The target of one room, or of every room, a step up or down. */
    nudge(step: number, room?: Room): void {
        for (const r of room ? [room] : this.state.rooms) r.target = Math.min(28, Math.max(14, Math.round((r.target + step) * 2) / 2));
    }

    get target(): number {
        return this.state.rooms[0].target;
    }

    get greeting(): string {
        const h = this.state.now.getHours();
        return h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    }

    roomLights(room: Room, on: boolean): void {
        for (const l of room.lights) l.on = on;
    }

    allLights(on: boolean): void {
        for (const room of this.state.rooms) for (const l of room.lights) l.on = on;
        this.log(on ? 'All lights on' : 'All lights off', 'info');
    }

    lockAll(): void {
        for (const l of this.state.locks) l.locked = true;
        this.log('Every door locked', 'success');
    }

    arm(on: boolean): void {
        this.state.armed = on;
        this.log(on ? 'Alarm on' : 'Alarm off', on ? 'success' : 'caution');
    }

    addAutomation(a: Omit<Automation, 'id'>): void {
        const id = Math.max(0, ...this.state.automations.map(x => x.id)) + 1;
        this.state.automations = [...this.state.automations, { ...a, id }];
        this.log(`Automation “${a.name}” added`, 'success');
    }

    /** The devices report: temperatures move toward their targets, power and sun change, the washer runs. */
    tick(): void {
        const s = this.state;
        s.now = new Date();
        for (const room of s.rooms) {
            const step = (room.target - room.temperature) * 0.15 + (Math.random() - 0.5) * 0.1;
            room.temperature = Math.round((room.temperature + step) * 10) / 10;
            room.history = [...room.history.slice(1), room.temperature];
        }
        s.gridNow = Math.max(0.2, Math.round((s.gridNow + (Math.random() - 0.5) * 0.6) * 10) / 10);
        s.solarNow = Math.max(0, Math.round((s.solarNow + (Math.random() - 0.5) * 0.4) * 10) / 10);
        s.air = Math.max(5, Math.min(95, Math.round(s.air + (Math.random() - 0.5) * 6)));
        const last = s.power[s.power.length - 1];
        s.power = [...s.power.slice(-95), { time: new Date(last.time.getTime() + 15 * MINUTE), grid: s.gridNow, solar: s.solarNow }];
        if (s.washer < 1) {
            s.washer = Math.min(1, Math.round((s.washer + 0.04) * 100) / 100);
            if (s.washer === 1) {
                this.log('Washing machine finished', 'success');
                s.unread++;
            }
        }
    }

    start(): void {
        if (!this.timer) this.timer = window.setInterval(() => this.tick(), 2000);
    }

    stop(): void {
        clearInterval(this.timer);
        this.timer = 0;
    }
}
