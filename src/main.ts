import { AppOne as App } from './AppOne';
// import { App } from './App';

console.log(`main.ts starting ${App.name}`);
window.addEventListener('DOMContentLoaded', () => {
    // Remember the element that would receive the rendered elements?
    let canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;

    // Run app and render to canvas.
    let app = new App(canvas);
    app.run();
});