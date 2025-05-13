document.addEventListener('DOMContentLoaded', () => {
  // 1) Setup
  const container = document.getElementById('globe');
  const tooltip   = document.getElementById('pin-tooltip');
  const scene     = new THREE.Scene();
  const camera    = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  const renderer  = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.domElement.style.touchAction = 'none'; // zorg dat touch-events doorkomen
  container.appendChild(renderer.domElement);

  // 2) Licht
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
  dirLight.position.set(5, 3, 5);
  scene.add(dirLight);

  // 3) Aarde
  const R = 5;
  const earthMesh = new THREE.Mesh(
    new THREE.SphereGeometry(R, 64, 64),
    new THREE.MeshStandardMaterial({
      map: new THREE.TextureLoader().load('images/earth_noClouds.0330.jpeg')
    })
  );
  scene.add(earthMesh);

  // 4) Helper: lat/lon → Vector3
  function latLonToVector(lat, lon, radius) {
    const phi   = (90 - lat) * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
       radius * Math.cos(phi),
       radius * Math.sin(phi) * Math.sin(theta)
    );
  }

  // 5) Extrude‐shape voor drop-pin
  const dropShape = new THREE.Shape();
  dropShape.moveTo(0,0);
  dropShape.bezierCurveTo(0.4,0, 0.4,0.75, 0,1.2);
  dropShape.bezierCurveTo(-0.4,0.75, -0.4,0, 0,0);
  const extrudeSettings = {
    depth: 0.05,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 4
  };
  const pinGeo = new THREE.ExtrudeBufferGeometry(dropShape, extrudeSettings);
  pinGeo.center();
  const PIN_COLOR = 0xd2784b;
  const pinMat    = new THREE.MeshStandardMaterial({ color: PIN_COLOR });

  // 6) Functie om een drop-pin + wit bolletje te maken
  function makeDropPin(lat, lon, label, href) {
    const group = new THREE.Group();

    // druppel-pin
    const pin = new THREE.Mesh(pinGeo, pinMat);
    pin.rotation.x = Math.PI;
    pin.userData = { label, href };
    group.add(pin);

    // wit bolletje
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    head.position.set(0, 0.4, 0);
    head.userData = { label, href };
    group.add(head);

    // plaats en oriëntatie
    const pos = latLonToVector(lat, lon, R + 0.03);
    group.position.copy(pos);
    group.lookAt(earthMesh.position);
    group.userData = { label, href };

    earthMesh.add(group);
    return group;
  }

  // 7) Jouw vier pins
   const pins = [
    makeDropPin(37.7749, -122.4194, 'West America', 'https://500px.com/p/amybruyninckx/galleries/usa'),
    makeDropPin(7.8731,    80.7718,   'Sri Lanka',   'https://500px.com/p/amybruyninckx/galleries/sri-lanka'),
    makeDropPin(15.8700,  100.9925,   'Thailand',    'https://500px.com/p/amybruyninckx/galleries/thailand'),
    makeDropPin(50.8503,    4.3517,   'Belgium',     'https://500px.com/p/amybruyninckx/galleries/fotoshoots')
  ];

  // 8) Raycaster & pointer helpers
  const raycaster = new THREE.Raycaster();
  const pointer   = new THREE.Vector2();

  function updatePointer(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    // pak juiste coords voor muis én touch
    let clientX = event.clientX;
    let clientY = event.clientY;
    if (event.touches && event.touches[0]) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    }
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    return { x: clientX, y: clientY };
  }

  function handleClick(event) {
    const { x, y } = updatePointer(event);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(pins, true)
                      .find(i => i.object.userData.href);
    if (hit) window.open(hit.object.userData.href, '_blank');
  }

  // luister op zowel click, pointerup als touchend
  renderer.domElement.addEventListener('click',     handleClick, { passive: true });
  renderer.domElement.addEventListener('pointerup', handleClick, { passive: true });
  renderer.domElement.addEventListener('touchend',  handleClick, { passive: true });

  // 9) Hover‐handler voor tooltip
  renderer.domElement.addEventListener('pointermove', event => {
    const { x, y } = updatePointer(event);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(pins, true)
                      .find(i => i.object.userData.label);
    if (hit) {
      tooltip.style.display = 'block';
      tooltip.textContent = hit.object.userData.label;
      tooltip.style.left = (x + 8) + 'px';
      tooltip.style.top  = (y + 8) + 'px';
    } else {
      tooltip.style.display = 'none';
    }
  }, { passive: true });

  // 10) Controls
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableZoom = true;
  camera.position.set(0, 0, 18);
  controls.update();

  // 11) Responsiveness
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // 12) Animatie‐loop
  (function animate() {
    requestAnimationFrame(animate);
    earthMesh.rotation.y += 0.001;
    controls.update();
    renderer.render(scene, camera);
  })();

});
