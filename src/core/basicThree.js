import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import * as TWEEN from 'tween.js'
import * as Stats from 'stats.js'

export class basicThree {
  constructor() {
    this.container = document.querySelector('#sunshine')
    this.modelScale = 1 // 模型缩放倍数
    this.modelUrl // 模型URL

    // three 3要素
    this.renderer // 渲染器
    this.camera // 相机
    this.scene // 场景

    //光源
    this.ambientLight // 环境光
    this.sunLight // 太阳光

    //摄像头控制
    this.controls
    this.renderEvents = []

    // 记录原始的旋转中心点
    this.originalTarget

    this.init()
  }

  init() {
    this.initScene()
    this.initCamera()
    this.initRender()

    this.orbitHelper()
    this.statsHelper() //性能辅助
    this.animate()

    window.onresize = this.onWindowResize.bind(this)
  }

  initScene() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color('#b2e0ff')
    // this.scene.add(new THREE.AmbientLight(0xffffff, 1))

    // 半球光,会比环境光颜色更自然
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1) // (sky color, floor color)
    this.scene.add(hemisphereLight)

    this.scene.receiveShadow = true
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      3000,
    )
    // 相机所在的位置，这是示例,最终的位置还得根据小区大小来选择,如果小区较大
    // 则相机需要更远, fov可能需要更大
    this.camera.position.set(0, 500, 500)
    this.camera.lookAt(new THREE.Vector3(0, 0, 0))
  }

  initRender() {
    const renderer = new THREE.WebGLRenderer({
      antialias: true, // 抗锯齿
      logarithmicDepthBuffer: true,
      alpha: true,
    })

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(1)
    //告诉渲染器需要阴影效果
    renderer.shadowMap.enabled = true
    //RGB模式编码（sRGBEncoding）进行对材质进行渲染,SRGBColorSpace
    renderer.outputEncoding = THREE.SRGBColorSpace
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ReinhardToneMapping
    // 默认1为了让场景更明亮
    renderer.toneMappingExposure = 1

    this.container.appendChild(renderer.domElement)
    this.renderer = renderer
  }

  initLight() {
    this.sunLight = new THREE.DirectionalLight(0xffffff)
    this.sunLight.visible = true
    this.sunLight.intensity = 20 //光线的密度，默认为1。 光照越强，物体表面就更明亮
    this.sunLight.shadow.camera.near = -1000 //产生阴影的最近距离
    this.sunLight.shadow.camera.far = 1000 //产生阴影的最远距离
    this.sunLight.shadow.camera.left = -1000 //产生阴影距离位置的最左边位置
    this.sunLight.shadow.camera.right = 1000 //最右边
    this.sunLight.shadow.camera.top = 1000 //最上边
    this.sunLight.shadow.camera.bottom = -1000 //最下面
    this.sunLight.shadow.bias = -0.01 //用于解决阴影水波纹条纹阴影的问题
    this.sunLight.shadow.mapSize.set(4096, 4096) //阴影清晰度

    //告诉平行光需要开启阴影投射,物体遮挡阴影
    this.sunLight.castShadow = true
    this.scene.add(this.sunLight)
  }

  /** 加载模型 */
  loadModel() {
    const loader = new GLTFLoader()
    /**
     * DRACOLoader 解码器介绍:
     * 在Three.js中，加载GLB模型时是否需要DRACOLoader解码器取决于您的模型文件是否使用了Draco压缩。
     * DRACOLoader是一个用于解码Draco压缩网格数据的加载器。
     * 如果您的GLB模型文件中的几何体数据已经通过 Draco 压缩过，那么在加载时就需要使用DRACOLoader进行解码。
     * 如果没有进行Draco压缩，那么直接使用GLTFLoader即可加载，无需额外设置DRACOLoader。
     */
    /**
     * 如果您使用gltf-pipeline工具对模型进行了Draco压缩，
     * 那么在加载这个压缩后的GLTF或GLB文件时，
     * 就需要用到DRACOLoader来解码Draco压缩过的几何数据。
     */

    const dracoLoader = new DRACOLoader()

    /**
     * 设置Draco解码库
     * Path: node_modules/three/examples/jsm/libs/draco文件复制到public文件下
     */
    dracoLoader.setDecoderPath('./draco/')
    dracoLoader.setDecoderConfig({ type: 'js' }) // 使用js方式解压
    dracoLoader.preload() // 初始化_initDecoder 解码器
    loader.setDRACOLoader(dracoLoader) // 设置gltf加载器dracoLoader解码器

    loader.load(
      this.modelUrl,
      (gltf) => {
        const model = gltf.scene

        // 遍历模型中的所有子对象，设置阴影接收和投射属性
        model.traverse((child) => {
          if (child.isMesh) {
            const copyMaterial = child.material.clone()
            copyMaterial.side = THREE.DoubleSide
            copyMaterial.originColor = copyMaterial.color.clone()
            copyMaterial.color.setHex(0xfffff0)
            child.material = copyMaterial

            //物体遮挡阴影
            child.castShadow = true
            child.receiveShadow = true
          }
        })

        model.scale.set(this.modelScale, this.modelScale, this.modelScale)
        this.building = gltf.scene
        this.scene.add(gltf.scene)
      },
      undefined,
      function (error) {
        console.error(error)
      },
    )
  }

  initModel() {
    this.loadModel()
    this.initLight()
    this.basicfloor()
  }

  /**
   * 轨道控制器
   * 作用: 用户可以通过鼠标或触摸输入来交互式地旋转、缩放和平移3D视图
   */
  orbitHelper() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    // 使动画循环使用时阻尼或自转 意思是否有惯性
    this.controls.enableDamping = true

    //是否可以缩放
    this.controls.enableZoom = true
    //设置相机距离原点的最远距离
    this.controls.minDistance = 100
    //设置相机距离原点的最远距离
    this.controls.maxDistance = 800
    //设置相机上下旋转最大角度最大到平面
    this.controls.minPolarAngle = 0
    this.controls.maxPolarAngle = Math.PI / 2 - 0.2

    this.originalTarget = this.controls.target.clone()

    // 指南针
    this.controls.addEventListener('change', () => {
      const rotation = this.camera.rotation
      let rotationDegrees = {
        x: THREE.MathUtils.radToDeg(rotation.x),
        y: THREE.MathUtils.radToDeg(rotation.y),
        z: THREE.MathUtils.radToDeg(rotation.z),
      }
      document.querySelector(".compass>div").style.transform =
        "rotate(" + rotationDegrees.z + "deg)";
    })
  }

  // 创建网格辅助
  gridHelper() {
    var gridHelper = new THREE.GridHelper(20, 20, 0x404040, 0x404040)
    this.scene.add(gridHelper)
  }

  //性能插件
  statsHelper() {
    this.stats = new Stats()
    this.stats.dom.style.top = '100px'
    document.body.appendChild(this.stats.dom)
  }

  //坐标轴辅助
  axesHelper() {
    var helper = new THREE.AxesHelper(10)
    this.scene.add(helper)
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.render()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  render() {
    if (this.stats) this.stats.update()
    this.renderer.render(this.scene, this.camera)
    this.controls.update()
    TWEEN.update()
    this.renderEvents.forEach((e) => {
      if (e && typeof e === 'function') {
        e()
      }
    })
  }

  /** 注册渲染回调事件,以便外界想要在渲染的时候去执行一些事件 */
  registRenderEvent(event) {
    this.renderEvents.push(event)
  }

  animate() {
    this.render()
    requestAnimationFrame(this.animate.bind(this))
  }

  // 设置地面
  basicfloor() {
    const planeGeometry = new THREE.CircleGeometry(2048)
    const texture = new THREE.TextureLoader().load(
      './bg.jpg',
    )
    texture.colorSpace = THREE.SRGBColorSpace
    texture.magFilter = THREE.LinearFilter
    texture.minFilter = THREE.LinearMipmapLinearFilter

    const planeMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      reflectivity: 0, // 反射率
      roughness: 1, // 粗糙度
      metalness: 0,
    })

    this.plane = new THREE.Mesh(planeGeometry, planeMaterial)
    this.plane.rotation.x = -0.5 * Math.PI
    this.plane.position.y = 0
    //物体遮挡阴影
    this.plane.castShadow = true
    //告诉底部平面需要接收阴影
    this.plane.receiveShadow = true
    this.scene.add(this.plane)
  }
}
