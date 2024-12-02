# Cloak and Danger

A multi-genre game about a girl who can transform into a rat.

My daughter and I made it during November 2024 and submitted it just in time for Game Off 2024. The theme was "secrets" and we really leaned into that — you collect secrets, find secret passages, etc. 

👉 [Play and rate Cloak and Danger](https://itch.io/jam/game-off-2024/rate/3149709) 


<img width="985" alt="Cloak and Danger gameplay screenshot" src="https://github.com/user-attachments/assets/f2aa980b-b9b8-415c-95d6-a56bc91ee033">


## Retro

- There were a lot of things we had to cut due to lack of time, unfortunately
- After the game jam voting is over, we'd like to revisit those
  - transform into a penguin at the end
  - add more sound
- Phaser is a powerful game engine but it was frustrating at times
  - it doesn't follow semver
  - the official docs have broken links
  - many online tutorials etc are using outdated APIs

## Development

[Node.js](https://nodejs.org) is required to install dependencies and run scripts via `npm`.

| Command               | Description                                                                                              |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| `npm install`         | Install project dependencies                                                                             |
| `npm run dev`         | Launch a development web server                                                                          |
| `npm run build`       | Create a production build in the `dist` folder                                                           |

### Template

This project started from [template-vite-ts](https://github.com/phaserjs/template-vite-ts) with the following versions:

- [Phaser 3.86.0](https://github.com/phaserjs/phaser)
- [Vite 5.3.1](https://github.com/vitejs/vite)
- [TypeScript 5.4.5](https://github.com/microsoft/TypeScript)

