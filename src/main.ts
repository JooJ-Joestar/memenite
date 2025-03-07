import { BabylonApp as App } from './BabylonApp';

console.log(`main.ts starting ${App.name}`);
window.addEventListener('DOMContentLoaded', () => {
    // Remember the element that would receive the rendered elements?
    let canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;

    // Run app and render to canvas.
    let app = new App(canvas);
    app.run();
});