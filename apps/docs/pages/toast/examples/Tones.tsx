import { Button, toast, type ToastTone } from '@motifx-community/ui';

const TONES: { tone: ToastTone; text: string }[] = [
  { tone: 'info', text: 'A new version is ready.' },
  { tone: 'success', text: 'Your changes are saved.' },
  { tone: 'caution', text: 'Your session ends in 5 minutes.' },
  { tone: 'danger', text: 'The server did not answer.' },
];

/** A toast in each of the four tones. */
export default function Tones() {
  return (
    <>
      {TONES.map(({ tone, text }) => (
        <Button key={tone} text={tone} variant="outline" onclick={() => toast.show({ tone, text })} />
      ))}
    </>
  );
}
