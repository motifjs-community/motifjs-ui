import { Component, FromService, RouterView, useNavigation } from '@motifx/core';
import { Avatar, Badge, Button, Chip, toast } from '@motifx-community/ui';
import { HomeModel } from './HomeModel';
import { AutomationsIcon, BellIcon, ClimateIcon, CloudIcon, EnergyIcon, HomeIcon, RoomsIcon, SecurityIcon } from './icons';
import { SCREENS, type ScreenKey } from './routes';

const ICONS: Record<ScreenKey, () => unknown> = {
    home: HomeIcon,
    rooms: RoomsIcon,
    climate: ClimateIcon,
    energy: EnergyIcon,
    security: SecurityIcon,
    automations: AutomationsIcon
};

const time = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' });
const day = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

/** The frame of the panel: the rail of screens at the side, the day and the home's state at the top, the screen in the middle. */
export class Shell extends Component<HTMLDivElement> {
    private readonly model = FromService(HomeModel)!;
    private readonly nav = useNavigation();

    constructor() {
        super('div');
        this.model.start();
        this.motif.setDisposable(() => this.model.stop());
    }

    private read(): void {
        const s = this.model.state;
        toast.info(s.unread ? `${s.unread} new: the washing machine finished, the garden door was opened.` : 'Nothing new.', { title: 'Notifications' });
        s.unread = 0;
    }

    override view() {
        const m = this.model;
        const s = m.state;
        return (
            <div class="sh">
                <nav class="sh-rail" aria-label="Screens">
                    <div class="sh-logo" aria-hidden="true">
                        <HomeIcon />
                    </div>
                    {SCREENS.map(screen => {
                        const Icon = ICONS[screen.key] as () => Node;
                        return (
                            <a class="sh-rail-item" href={`#${screen.path}`} aria-current={() => (this.nav.meta.screen === screen.key ? 'page' : false)}>
                                <Icon />
                                <span>{screen.label}</span>
                            </a>
                        );
                    })}
                </nav>
                <div class="sh-main">
                    <header class="sh-top">
                        <div class="sh-hello">
                            <h1 class="sh-greeting">{() => `${m.greeting}, ${s.resident}`}</h1>
                            <span class="sh-day">{() => `${day.format(s.now)} · ${time.format(s.now)}`}</span>
                        </div>
                        <div class="sh-weather" aria-label={() => `Outside: ${s.outside} degrees, ${s.weather.toLowerCase()}`}>
                            <CloudIcon />
                            <strong>{() => `${s.outside}°`}</strong>
                            <span>{() => s.weather}</span>
                        </div>
                        <Chip class="sh-alarm-chip" text={() => (s.armed ? 'Alarm on' : 'Alarm off')} tone={() => (s.armed ? 'success' : 'standard')} />
                        <Button class="sh-bell" icon={() => <BellIcon />} variant="ghost" hint="Notifications" onclick={() => this.read()}>
                            <Badge count={() => s.unread} position="top-end" label="New notifications" />
                        </Button>
                        <Avatar name="Ada Yılmaz" status="online" />
                    </header>
                    <main class="sh-screen">
                        <RouterView />
                    </main>
                </div>
            </div>
        );
    }
}
