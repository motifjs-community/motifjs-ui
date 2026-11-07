import { Component } from '@motifx/core';
import { ApiTable, Rich, Section } from '../../../shared/doc';

/** The width and height of a tablet held across, in CSS pixels: the panel is drawn at this size and scaled to the page. */
const TABLET = { width: 1180, height: 820 };

const SCREENS = [
    ['Home', 'Scenes, the climate with its target, power now, the doors and the alarm, every room with its lights, and what happened.'],
    ['Rooms', 'One room at a time: its temperature and target, each light with its brightness and color, the blinds.'],
    ['Climate', 'Every room\'s temperature and target, the mode, the air quality and humidity, and the last hours on a chart.'],
    ['Energy', 'Power from the grid and the sun now, today by device, the day and the week on charts.'],
    ['Security', 'The alarm, turned off with a code, the doors, the cameras and the events.'],
    ['Automations', 'What the home does on its own, switched on and off, and a new one step by step in a window.'],
];

const PARTS = [
    ['Application', 'One `HomeModel` registered as a singleton service; every screen takes it with `FromService`, so all of them show the same home.'],
    ['Router', 'Each screen is a route loaded when first opened, under a shell with the rail and the top bar. Hash addresses keep the app in one folder of a static site.'],
    ['Live values', 'The model moves the values every two seconds, as devices would report them; the controls follow because they bind to the model with functions.'],
    ['Components', '`Card`, `Gauge`, `BarGauge`, `Chart`, `Sparkline`, `Switch`, `Slider`, `ColorBox`, `ListBox`, `ButtonGroup`, `Button`, `Chip`, `Badge`, `Avatar`, `OtpInput`, `Gallery`, `Timeline`, `DateBox`, `ChipGroup`, `MxForm`, `Wizard` and `toast`.'],
];

/** The smart home panel, shown in a tablet frame; it is a MotifJS app of its own, built with the kit. */
export default class SmartHomePage extends Component {
    private fit(stage: HTMLElement): void {
        const scale = () => {
            const k = Math.min(1, stage.clientWidth / TABLET.width);
            stage.style.setProperty('--sh-scale', String(k));
            stage.style.blockSize = `${Math.round(TABLET.height * k)}px`;
        };
        const watch = new ResizeObserver(scale);
        watch.observe(stage);
        scale();
        this.motif.setDisposable(() => watch.disconnect());
    }

    override view() {
        return (
            <>
                <p class="lead">
                    <Rich text="A smart home panel for a tablet, built with the kit as a MotifJS application of its own: a rail of screens, the day and the home's state at the top, and tiles you can touch. The devices report new values every two seconds." />
                </p>
                <div class="sh-stage" onBuilt={(c: { element: HTMLElement }) => this.fit(c.element)}>
                    <iframe class="sh-tablet" src="/smart-home/" title="Smart home panel" width={String(TABLET.width)} height={String(TABLET.height)} />
                </div>
                <p>
                    <a class="sh-open" href="/smart-home/" target="_blank" rel="noopener">
                        <Rich text="Open the panel on its own" />
                    </a>
                </p>
                <Section anchor="screens" title="Screens">
                    <ApiTable head={['Screen', 'Shows']} rows={SCREENS} />
                </Section>
                <Section anchor="parts" title="How it is built">
                    <ApiTable head={['Part', 'How']} rows={PARTS} />
                </Section>
            </>
        );
    }
}
