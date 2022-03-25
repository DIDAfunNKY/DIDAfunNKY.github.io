import * as THREE from 'three';

import { PointerLockControls } from './jsm/controls/PointerLockControls.js';

let camera, scene, renderer, controls;

const objects = [];

let raycaster, raycasterz, raycasterx;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const color = new THREE.Color();

init();
//时间模块
var timePlane = setUpAText(10, 4, "time", scene, 0, 23, -16);
timePlane.material = new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(getTextCanvas("hello")), side: THREE.DoubleSide });

//天空球
const ball = new THREE.SphereGeometry(40000);
const skyTexture = new THREE.TextureLoader().load('./texture/sky.jpg');
const sphereMaterial = new THREE.MeshBasicMaterial({ map: skyTexture });
const sky = new THREE.Mesh(ball.scale(-1, -1, -1), sphereMaterial);
sky.rotateX(60 * Math.PI / 180);
scene.add(sky);

animate();

function setUpAPost(width, height, texturePath, scene, x, y, z) {
    var plane = new THREE.PlaneGeometry(width, height); //矩形平面
    var texture = new THREE.TextureLoader().load(texturePath); //加载数学竞赛奖状贴图
    var planeMaterial = new THREE.MeshLambertMaterial({ //贴图通过材质添加给几何体
        map: texture,
        side: THREE.DoubleSide //给纹理属性map赋值
    }); //材质对象
    var planeMesh = new THREE.Mesh(plane, planeMaterial); //纹理贴图网格模型

    planeMesh.translateX(x); //平移纹理贴图网格模型
    planeMesh.translateY(y); //平移纹理贴图网格模型
    planeMesh.translateZ(z); //平移纹理贴图网格模型
    scene.add(planeMesh); //纹理贴图网格模型添加到场景中
}

function setUpAText(width, height, context, scene, x, y, z) {
    var plane = new THREE.PlaneGeometry(width, height); //矩形平面
    var canvas1 = getTextCanvas(context);
    var planeMaterial = new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(canvas1), side: THREE.DoubleSide });
    var planeMesh = new THREE.Mesh(plane, planeMaterial); //纹理贴图网格模型
    planeMesh.translateX(x); //平移纹理贴图网格模型
    planeMesh.translateY(y); //平移纹理贴图网格模型
    planeMesh.translateZ(z); //平移纹理贴图网格模型
    scene.add(planeMesh); //纹理贴图网格模型添加到场景中
    return planeMesh;
}

function init() {

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 41000);
    camera.position.y = 15;
    camera.position.z = 1;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    // scene.fog = new THREE.Fog(0xffffff, 0, 750);

    const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
    light.position.set(0.5, 1, 0.75);
    scene.add(light);

    controls = new PointerLockControls(camera, document.body);

    const blocker = document.getElementById('blocker');
    const instructions = document.getElementById('instructions');

    instructions.addEventListener('click', function() {

        controls.lock();

    });

    controls.addEventListener('lock', function() {

        instructions.style.display = 'none';
        blocker.style.display = 'none';

    });

    controls.addEventListener('unlock', function() {

        blocker.style.display = 'block';
        instructions.style.display = '';

    });

    scene.add(controls.getObject());

    const onKeyDown = function(event) {

        switch (event.code) {

            case 'ArrowUp':
            case 'KeyW':
                moveForward = true;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = true;
                break;

            case 'ArrowDown':
            case 'KeyS':
                moveBackward = true;
                break;

            case 'ArrowRight':
            case 'KeyD':
                moveRight = true;
                break;

            case 'Space':
                if (canJump === true) velocity.y += 350;
                canJump = false;
                break;

        }

    };

    const onKeyUp = function(event) {

        switch (event.code) {

            case 'ArrowUp':
            case 'KeyW':
                moveForward = false;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = false;
                break;

            case 'ArrowDown':
            case 'KeyS':
                moveBackward = false;
                break;

            case 'ArrowRight':
            case 'KeyD':
                moveRight = false;
                break;

        }

    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);
    raycasterz = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, 0, -1), 0, 10);
    raycasterx = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(-1, 0, 0), 0, 10);

    // floor

    let floorGeometry = new THREE.PlaneGeometry(250, 250, 100, 100);
    floorGeometry.rotateX(-Math.PI / 2);

    // vertex displacement

    let position = floorGeometry.attributes.position;

    for (let i = 0, l = position.count; i < l; i++) {

        vertex.fromBufferAttribute(position, i);

        vertex.x += Math.random() * 20 - 10;
        vertex.y += Math.random() * 2;
        vertex.z += Math.random() * 20 - 10;

        position.setXYZ(i, vertex.x, vertex.y, vertex.z);

    }

    floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices

    position = floorGeometry.attributes.position;
    const colorsFloor = [];

    for (let i = 0, l = position.count; i < l; i++) {

        color.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
        colorsFloor.push(color.r, color.g, color.b);

    }

    floorGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colorsFloor, 3));

    const floorMaterial = new THREE.MeshBasicMaterial({ vertexColors: true });

    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    scene.add(floor);

    // objects

    const boxGeometry = new THREE.BoxGeometry(20, 20, 20);

    position = boxGeometry.attributes.position;
    const colorsBox = [];

    for (let i = 0, l = position.count; i < l; i++) {

        color.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
        colorsBox.push(color.r, color.g, color.b);

    }

    boxGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colorsBox, 3));

    //和宝贝的合照
    // setUpAPost(640, 360, "./texture/BB.png", scene, 30, 45, -200);
    //简历1
    setUpAPost(16, 20, "./texture/resume1.png", scene, -9, 12, -15);
    //简历2
    setUpAPost(16, 20, "./texture/resume2.png", scene, 9, 12, -15);

    //欢迎标语
    setUpAText(24, 5, "欢迎来到元宇宙", scene, 0, 24, -12);
    //右侧墙

    const boxMaterial = new THREE.MeshPhongMaterial({ specular: 0xffffff, flatShading: true, vertexColors: true, side: THREE.DoubleSide });
    boxMaterial.color.setHSL(Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75);

    const box = new THREE.Mesh(boxGeometry.scale(3.3, 1, 0.25), boxMaterial);
    box.position.x = 50;
    box.position.y = 10;
    box.position.z = -20;
    scene.add(box);
    objects.push(box);
    setUpAPost(12, 9, "./texture/mathPrize.png", scene, box.position.x - 26, box.position.y, box.position.z + 3); //prize1
    setUpAPost(12, 9, "./texture/ePrize.jpg", scene, box.position.x - 13, box.position.y, box.position.z + 3); //加载电子设计奖状贴图
    setUpAPost(12, 9, "./texture/gPrize.jpg", scene, box.position.x, box.position.y, box.position.z + 3); //加载游戏奖状贴图
    setUpAPost(12, 16, "./texture/szuePrize.jpg", scene, box.position.x + 13, box.position.y, box.position.z + 3); //加载电子设计奖状贴图
    setUpAPost(12, 9, "./texture/mPrize.jpg", scene, box.position.x + 26, box.position.y, box.position.z + 3); //加载数学建模奖状贴图
    setUpAText(20, 5, "所获奖项", scene, box.position.x, box.position.y + 12, box.position.z + 4);
    //左侧墙
    const box1 = new THREE.Mesh(boxGeometry, boxMaterial);
    box1.position.x = -50;
    box1.position.y = 10;
    box1.position.z = -20;
    scene.add(box1);
    objects.push(box1);
    setUpAPost(10, 15, "./texture/score4.png", scene, box1.position.x - 26, box1.position.y, box1.position.z + 3); //prize1
    setUpAPost(10, 15, "./texture/score3.png", scene, box1.position.x - 13, box1.position.y, box1.position.z + 3); //加载电子设计奖状贴图
    setUpAPost(10, 15, "./texture/score2.png", scene, box1.position.x, box1.position.y, box1.position.z + 3); //加载游戏奖状贴图
    setUpAPost(10, 15, "./texture/score1.png", scene, box1.position.x + 13, box1.position.y, box1.position.z + 3); //加载电子设计奖状贴图
    setUpAPost(10, 15, "./texture/cet6.png", scene, box1.position.x + 26, box1.position.y, box1.position.z + 3); //加载数学建模奖状贴图
    setUpAText(20, 5, "在校成绩", scene, box1.position.x, box1.position.y + 12, box1.position.z + 4);

    //

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    //

    window.addEventListener('resize', onWindowResize);

}

function getTextCanvas(text) {
    var width = 1024,
        height = 256;
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#C3C3C3';
    ctx.fillRect(0, 0, width, height);
    ctx.font = 50 + 'px " bold';
    ctx.fillStyle = '#2891FF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);
    return canvas;
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

    requestAnimationFrame(animate);

    const time = performance.now();
    timePlane.material = new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(getTextCanvas(new Date().toLocaleTimeString())), side: THREE.DoubleSide });
    sky.rotateY(0.005 * Math.PI / 180);
    if (controls.isLocked === true) {
        //时钟

        raycaster.ray.origin.copy(controls.getObject().position);
        raycaster.ray.origin.y -= 10;
        raycasterz.ray.origin.copy(controls.getObject().position);
        raycasterz.ray.origin.z += 6;
        raycasterx.ray.origin.copy(controls.getObject().position);
        raycasterx.ray.origin.x += 6;

        const intersections = raycaster.intersectObjects(objects, false);
        const intersectionsz = raycasterz.intersectObjects(objects, false);
        const intersectionsx = raycasterx.intersectObjects(objects, false);

        const onObject = intersections.length > 0;
        const beforeObject = intersectionsz.length > 0;
        const asideObject = intersectionsx.length > 0;

        const delta = (time - prevTime) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize(); // this ensures consistent movements in all directions

        if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

        if (onObject === true) {

            velocity.y = Math.max(0, velocity.y);
            canJump = true;

        }
        // if (beforeObject === true || asideObject == true) {

        //     velocity.z = Math.max(0, velocity.z);
        //     velocity.x = Math.max(0, velocity.x);
        // }
        if (beforeObject === true) {
            velocity.z = Math.max(0, velocity.z);
        }
        if (asideObject === true) {
            velocity.x = Math.max(0, velocity.x);
        }

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);


        controls.getObject().position.y += (velocity.y * delta); // new behavior

        if (controls.getObject().position.y < 10) {

            velocity.y = 0;
            controls.getObject().position.y = 10;

            canJump = true;

        }

    }

    prevTime = time;

    renderer.render(scene, camera);

}