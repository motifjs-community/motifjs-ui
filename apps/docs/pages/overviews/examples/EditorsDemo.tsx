import { reactive } from '@motifx/core';
import {
    Button,
    Calendar,
    ColorBox,
    DateBox,
    DateRangeBox,
    FileUploader,
    NumberBox,
    OtpInput,
    Rating,
    Signature,
    Slider,
    TextArea,
    TextBox,
    ValidationGroup,
    ValidationSummary,
    toast,
    type DateRange
} from '@motifx-community/ui';

// Stands in for a server: takes a file in a second and reports how far it is.
const send = (file: File, report: (fraction: number) => void) =>
    new Promise<string>(resolve => {
        let step = 0;
        const timer = setInterval(() => {
            report(++step / 10);
            if (step === 10) {
                clearInterval(timer);
                resolve(file.name);
            }
        }, 100);
    });

/** A room booking: text, numbers, dates, a range, a choice of color, files, a code and a signature, checked together on Book. */
export default function EditorsDemo() {
    const group = new ValidationGroup();
    const today = new Date();
    const b = reactive({
        name: '',
        email: '',
        phone: '',
        guests: 2,
        stay: [null, null] as DateRange,
        arrival: null as Date | null,
        budget: [80, 180] as number[],
        accent: '#2f7d6d' as string | null,
        rating: 4,
        notes: '',
        code: '',
        strokes: null as unknown,
        day: today as Date | null
    });

    const book = async () => {
        if (!(await group.validate())) return;
        toast.success(`${b.name}, your room for ${b.guests} is booked.`, { title: 'Booked' });
    };

    return (
        <div class="ov-frame ov-editors">
            <h3 class="ov-title">Book a room</h3>
            <ValidationSummary group={group} />
            <div class="ov-grid">
                <TextBox label="&Name" required x-model={() => b.name} validationGroup={group} />
                <TextBox label="E-&mail" type="email" required rules={[{ type: 'email' }]} x-model={() => b.email} validationGroup={group} />
                <TextBox label="&Phone" mask="(000) 000 00 00" x-model={() => b.phone} helpText="Only if we need to call you." />
                <NumberBox label="&Guests" min={1} max={6} required x-model={() => b.guests} validationGroup={group} />
                <DateRangeBox label="&Stay" required min={today} minDays={1} x-model={() => b.stay} validationGroup={group} />
                <DateBox label="&Arrival time" type="time" timeStep={30} x-model={() => b.arrival} />
                <Slider label="Budget a night" range min={40} max={300} step={10} x-model={() => b.budget} format={{ style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }} showValue="drag" />
                <ColorBox label="Room light" x-model={() => b.accent} />
                <Rating label="Your last stay" x-model={() => b.rating} />
                <OtpInput label="Member code" length={6} x-model={() => b.code} helpText="Six digits from the member card." />
                <TextArea class="ov-wide" stretch label="Wishes" autoGrow maxLength={300} showCounter x-model={() => b.notes} />
                <FileUploader class="ov-wide" stretch label="Identity document" accept="image/*,.pdf" maxFiles={1} upload={send} />
                <Signature label="Signature" height={140} x-model={() => b.strokes} />
                <Calendar x-model={() => b.day} min={today} />
            </div>
            <div class="ov-status">
                <output class="ov-editors-sum">{() => `${b.guests} guest(s), ${b.budget[0]} to ${b.budget[1]} EUR a night`}</output>
                <div class="ov-bar">
                    <Button text="Start again" variant="outline" onclick={() => group.reset()} />
                    <Button class="ov-book" text="&Book" tone="accent" onclick={() => void book()} />
                </div>
            </div>
        </div>
    );
}
