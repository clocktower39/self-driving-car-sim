const carCanvas = document.getElementById('carCanvas');
carCanvas.window = 200;
const networkCanvas = document.getElementById('networkCanvas');
networkCanvas.window = 300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

let restartCanvas = false;
let currentControl = 'AI';
let N = 1000;
let cars = generateCars(N);
let bestCar = cars[0];
let selectedTrafficSituation = 0;

checkSavedBrain(cars);

const trafficSituations = [
    [
        [road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2],
        [road.getLaneCenter(1), -400, 30, 50, "DUMMY", 2],
        [road.getLaneCenter(0), -225, 30, 50, "DUMMY", 2],
        [road.getLaneCenter(2), -225, 30, 50, "DUMMY", 2],
    ],
    [
        [road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2],
        [road.getLaneCenter(0.5), -200, 30, 50, "DUMMY", 2],
        [road.getLaneCenter(1.5), -400, 30, 50, "DUMMY", 2],
        [road.getLaneCenter(0.5), -300, 30, 50, "DUMMY", 2],
    ],
    [
        [road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2],
        [road.getLaneCenter(1), -400, 30, 50, "DUMMY", 2],
        [road.getLaneCenter(0), -225, 30, 50, "DUMMY", 2],
        [road.getLaneCenter(2), -225, 30, 50, "DUMMY", 2],
        [road.getLaneCenter(0), -575, 30, 50, "DUMMY", 2],
        [road.getLaneCenter(2), -575, 30, 50, "DUMMY", 2],
        [road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2],
        
        [road.getLaneCenter(0.5), -775, 30, 50, "DUMMY", 2],
        [road.getLaneCenter(1.5), -775, 30, 50, "DUMMY", 2],
        [road.getLaneCenter(1), -900, 30, 50, "DUMMY", 2],
    ],
    [
        [road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2],
        [road.getLaneCenter(0.5), -200, 30, 50, "DUMMY", 2],
        [road.getLaneCenter(0), -1000, 30, 50, "DUMMY", 2],
        [road.getLaneCenter(1), -1000, 30, 50, "DUMMY", 2],
        [road.getLaneCenter(1.5), -1000, 30, 50, "DUMMY", 2],
        [road.getLaneCenter(2), -500, 30, 50, "DUMMY", 2],
        [road.getLaneCenter(2), -600, 30, 50, "DUMMY", 2],
        [road.getLaneCenter(0), -600, 30, 50, "DUMMY", 2],
        [road.getLaneCenter(0), -200, 30, 50, "DUMMY", 2],
    ],
]

let traffic = [...trafficSituations[selectedTrafficSituation]].map(trafficVehicle => new Car(...trafficVehicle));

animate();

function save() {
    localStorage.setItem("bestBrain",
        JSON.stringify(bestCar.brain));
}

function discardBestCar() {
    localStorage.removeItem("bestBrain");
}

function restart() {
    restartCanvas = true;
}

function generateCars(N) {
    const cars = [];
    for (let i = 1; i <= N; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));
    }
    return cars;
}

function handleRadioClick(myRadio) {
    N = myRadio.value === "AI" ? 1000 : 1;
    currentControl = myRadio.value;
}

function handleSenarioChange(e) {
    selectedTrafficSituation = Number(e.value);
}

function animate(time) {
    traffic.map(car => car.update(road.borders, []));
    cars.forEach(car => car.update(road.borders, traffic));

    bestCar = cars.find(
        c => c.y === Math.min(...cars.map(c => c.y))
    );

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCtx.save();
    carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);

    road.draw(carCtx);
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(carCtx, 'red');
    }
    carCtx.globalAlpha = 0.2;
    cars.forEach(car => car.draw(carCtx, 'blue'));

    carCtx.globalAlpha = 1;
    bestCar.draw(carCtx, 'blue', true)

    carCtx.restore();

    networkCtx.lineDashOffset = -time / 50;
    Visualizer.drawNetwork(networkCtx, bestCar.brain);

    if (restartCanvas === true) {
        cars = generateCars(N);
        traffic = [...trafficSituations[selectedTrafficSituation]].map(trafficVehicle => new Car(...trafficVehicle));
        traffic.forEach(car => car.reset(car.x, car.y, car.width, car.height, "DUMMY", 2))
        cars.forEach(car => car.reset(road.getLaneCenter(1), 100, 30, 50, currentControl));
        restartCanvas = false;
        checkSavedBrain(cars);
    }
    requestAnimationFrame(animate);
}