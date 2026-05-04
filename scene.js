const loading = document.querySelector('#loader')
const canvas = document.querySelector('.webgl')
const scenePanel = document.querySelector('#scene-panel')

const scene = new THREE.Scene()

const sizes = {
    width: scenePanel.clientWidth,
    height: scenePanel.clientHeight
}

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
scene.add(ambientLight)
const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
dirLight.position.set(5, 8, 5)
scene.add(dirLight)
const fillLight = new THREE.DirectionalLight(0xfff0e0, 0.4)
fillLight.position.set(-5, 2, -3)
scene.add(fillLight)

// Camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 1000)
scene.add(camera)

// Controls
const controls = new THREE.OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enableZoom = true
controls.enablePan = false
controls.minPolarAngle = Math.PI / 6
controls.maxPolarAngle = Math.PI / 1.8

function fitCameraToModel(model) {
    const box = new THREE.Box3()
    model.traverse(child => {
        if (!child.isMesh) return
        const meshBox = new THREE.Box3().setFromObject(child)
        const size = meshBox.getSize(new THREE.Vector3())
        // skip flat ground planes
        if (size.y < 0.01) return
        box.union(meshBox)
    })
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const fov = camera.fov * (Math.PI / 180)
    const distance = (maxDim / 2) / Math.tan(fov / 2) * 1.5
    camera.position.set(center.x + distance * 0.4, center.y + distance * 0.3, center.z + distance)
    camera.near = distance / 100
    camera.far = distance * 10
    camera.updateProjectionMatrix()
    controls.target.copy(center)
    controls.minDistance = distance * 0.6
    controls.maxDistance = distance * 4
    controls.update()
}

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding
renderer.physicallyCorrectLights = true


// Tweaker UI
const tweaker = document.createElement('div')
tweaker.id = 'tweaker'
tweaker.innerHTML = `
  <div class="tw-row"><label>Scale<span id="tw-scale-val">1.0</span></label><input id="tw-scale" type="range" min="0.1" max="5" step="0.01" value="1"></div>
  <div class="tw-row"><label>Azimuth<span id="tw-az-val">0°</span></label><input id="tw-az" type="range" min="-180" max="180" step="1" value="0"></div>
  <div class="tw-row"><label>Elevation<span id="tw-el-val">20°</span></label><input id="tw-el" type="range" min="5" max="85" step="1" value="20"></div>
  <button id="tw-copy">Copy values</button>
`
scenePanel.appendChild(tweaker)

// GLTF
const loaderText = document.getElementById('loader-text')
const gltfLoader = new THREE.GLTFLoader()
let loadedModel = null
gltfLoader.load(
    'demo_nights.glb',
    (gltf) => {
        loadedModel = gltf.scene
        loadedModel.scale.setScalar(4.65)
        scene.add(loadedModel)
        // set near/far from fitCamera, then lock to saved view
        fitCameraToModel(loadedModel)
        camera.position.set(1.5278, 0.3733, -0.5767)
        controls.target.set(-0.05, 0.2435, 0.08)
        controls.update()
        loading.style.display = 'none'
        document.getElementById('tw-scale').value = 4.65
        document.getElementById('tw-scale-val').textContent = '4.65'
        document.getElementById('tw-az').value = 113
        document.getElementById('tw-az-val').textContent = '113°'
        document.getElementById('tw-el').value = 5
        document.getElementById('tw-el-val').textContent = '5°'
        bindTweakers()
    },
    (xhr) => {
        if (xhr.total) {
            const pct = (xhr.loaded / xhr.total * 100).toFixed(0)
            loaderText.textContent = `LOADING_ ${pct}%`
        }
    }
)

function bindTweakers() {
    const scaleSlider = document.getElementById('tw-scale')
    const azSlider    = document.getElementById('tw-az')
    const elSlider    = document.getElementById('tw-el')

    function applyTweaks() {
        const scale = parseFloat(scaleSlider.value)
        const az    = parseFloat(azSlider.value) * Math.PI / 180
        const el    = parseFloat(elSlider.value) * Math.PI / 180
        document.getElementById('tw-scale-val').textContent = scale.toFixed(2)
        document.getElementById('tw-az-val').textContent    = azSlider.value + '°'
        document.getElementById('tw-el-val').textContent    = elSlider.value + '°'

        loadedModel.scale.setScalar(scale)

        const box = new THREE.Box3().setFromObject(loadedModel)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        const fov = camera.fov * (Math.PI / 180)
        const dist = controls.target.distanceTo(camera.position)
        const r = dist
        camera.position.set(
            center.x + r * Math.sin(az) * Math.cos(el),
            center.y + r * Math.sin(el),
            center.z + r * Math.cos(az) * Math.cos(el)
        )
        controls.target.copy(center)
        controls.update()
    }

    scaleSlider.addEventListener('input', applyTweaks)
    azSlider.addEventListener('input', applyTweaks)
    elSlider.addEventListener('input', applyTweaks)

    document.getElementById('tw-copy').addEventListener('click', () => {
        const txt = `scale: ${scaleSlider.value}, azimuth: ${azSlider.value}°, elevation: ${elSlider.value}°`
        navigator.clipboard.writeText(txt).then(() => {
            const btn = document.getElementById('tw-copy')
            btn.textContent = 'Copied!'
            setTimeout(() => btn.textContent = 'Copy values', 1500)
        })
    })
}

// Resize
window.addEventListener('resize', () => {
    sizes.width = scenePanel.clientWidth
    sizes.height = scenePanel.clientHeight
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const tick = () => {
    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}
tick()
