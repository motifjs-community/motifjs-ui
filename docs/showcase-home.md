# Showcase: a smart home

> Get started · @motifx-community/ui 0.1.0-beta.11

A smart home panel for a tablet, built with the kit as a MotifJS application of its own: a rail of screens, the day and the home's state at the top, and tiles you can touch. The devices report new values every two seconds.

[Open the panel on its own](/smart-home/)

## Screens

| Screen | Shows |
| --- | --- |
| `Home` | Scenes, the climate with its target, power now, the doors and the alarm, every room with its lights, and what happened. |
| `Rooms` | One room at a time: its temperature and target, each light with its brightness and color, the blinds. |
| `Climate` | Every room's temperature and target, the mode, the air quality and humidity, and the last hours on a chart. |
| `Energy` | Power from the grid and the sun now, today by device, the day and the week on charts. |
| `Security` | The alarm, turned off with a code, the doors, the cameras and the events. |
| `Automations` | What the home does on its own, switched on and off, and a new one step by step in a window. |

## How it is built

| Part | How |
| --- | --- |
| `Application` | One `HomeModel` registered as a singleton service; every screen takes it with `FromService`, so all of them show the same home. |
| `Router` | Each screen is a route loaded when first opened, under a shell with the rail and the top bar. Hash addresses keep the app in one folder of a static site. |
| `Live values` | The model moves the values every two seconds, as devices would report them; the controls follow because they bind to the model with functions. |
| `Components` | `Card`, `Gauge`, `BarGauge`, `Chart`, `Sparkline`, `Switch`, `Slider`, `ColorBox`, `ListBox`, `ButtonGroup`, `Button`, `Chip`, `Badge`, `Avatar`, `OtpInput`, `Gallery`, `Timeline`, `DateBox`, `ChipGroup`, `MxForm`, `Wizard` and `toast`. |

## Feedback

Loading issues…
