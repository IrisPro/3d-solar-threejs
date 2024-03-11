<script setup>
import * as THREE from 'three'
import { ref, computed, watch, onMounted } from 'vue'
import { basicThree } from '../core/basicThree'
import { useSun } from '../hooks/sun'
import { solarTerms } from '../help/constant'
import { useTag } from '@/hooks/useTag'
import { tweenCamera } from '@/help/animate'

let threeObj = null
onMounted(() => {
  threeObj = new basicThree()
  threeObj.modelUrl = './scene.glb'
  threeObj.initModel()
  initSun()

  // 延迟加载标签
  setTimeout(() => {
    const { createTag, renderTag } = useTag(threeObj)
    createTag()
    threeObj.registRenderEvent(renderTag)
  }, 1200)

  initClick()
})

const {
  initSun,
  curSolarTerms,
  onChangeTerm,
  sunlightPosition,
  progress,
  run,
  stop,
  timeInfo,
  isRunning,
} = useSun()
const showPicker = ref(false)

const isShowSingle = ref(false)

watch(sunlightPosition, (newVal) => {
  threeObj.sunLight.position.copy(newVal)
  threeObj.sunLight.target.position.set(0, 0, 0)
})

const onConfirmPicker = (value) => {
  onChangeTerm(value.selectedOptions[0])
  showPicker.value = false
}

const dragStart = () => {
  stop()
}

// 每次跳转到单体时,记录先记录当前相机位置
const originalCameraPosition = ref()

const initClick = () => {
  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()

  let isDragging = false
  document.addEventListener('mousedown', () => {
    isDragging = false
  })

  document.addEventListener('mousemove', () => {
    isDragging = true
  })

  document.addEventListener('mouseup', (event) => {
    if (!isDragging) {
      if (isShowSingle.value) {
        return
      }
      event.preventDefault()

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      raycaster.setFromCamera(mouse, threeObj.camera)
      const intersects = raycaster.intersectObjects(threeObj.scene.children)

      console.log('intersects', intersects);

      if (intersects.length > 0 && (intersects[0]?.object.name.includes('Object') || intersects[0]?.object.name.includes('default'))) {
        // 拿到最近的物体
        const clickedObject = intersects[0].object?.parent

        if (!clickedObject) {
          return
        }

        console.log('clickedObject', clickedObject);
        isShowSingle.value = true

        // 隐藏其他模型
        for (var i = threeObj.scene.children.length - 1; i >= 0; i--) {
          const object = threeObj.scene.children[i]

          // 寻找其它楼栋,楼栋放在group中, 楼栋由多个mesh组成,
          // 修改mesh的材质的透明度
          if (object.isGroup) {
            object.children.forEach((mesh) => {
              if (mesh.uuid !== clickedObject.uuid) {
                mesh.children.forEach(childMesh => {
                  childMesh.material.transparent = true
                  childMesh.material.opacity = 0.08
                })
              }
            })
          }
          if (object.isCSS2DObject) {
            if (object.name !== clickedObject.name) {
              object.element.style.opacity = 0.5
            } else {
              object.element.style.opacity = 1
            }
          }
        }

        originalCameraPosition.value = threeObj.camera.position.clone()

        const toPosition = clickedObject.position.clone()

        // 调整相机位置和角度
        tweenCamera(
          threeObj.camera,
          threeObj.camera.position,
          toPosition,
          666,
          -160,
          () => {
            threeObj.controls.target.copy(clickedObject.position)
          },
          threeObj.controls,
        )
      }
    }

    isDragging = false
  })
}

const backSandbox = () => {
  isShowSingle.value = false

  tweenCamera(
    threeObj.camera,
    threeObj.camera.position,
    originalCameraPosition.value,
    666,
    0,
    () => {
      // threeObj.controls.target.copy(threeObj.originalTarget)
    },
  )

  threeObj.scene.children.forEach((child) => {
    if (child.isGroup) {
      child.children.forEach((mesh) => {
        mesh.children.forEach(childMesh => {
          childMesh.material.opacity = 1
        })
      })
    }
  })
}

const changeModelColor = (isDefault) => {
  const { scene } = threeObj
  const targetGroups = scene.children.find(child => child.isGroup).children

  targetGroups.forEach(group => {
    group.children.forEach(mesh => {
      if (isDefault) {
        mesh.material.color.setHex(0xfffff0)
      } else {
        mesh.material.color.copy(mesh.material.originColor)
      }
    })
  })
}

const tabStatus = ref('effect')
const isEffect = computed(() => {
  return tabStatus.value === 'effect'
})
const onChangeStatus = () => {
  if (isEffect.value) {
    changeModelColor(true)
  } else {
    changeModelColor()
  }
}

const colorTips = [
  { title: '不足', color: '#ff4307' },
  { title: '较弱', color: '#ffbf0c' },
  { title: '普通', color: '#c0ff0e' },
  { title: '良好', color: '#c0ff0e' },
  { title: '优秀', color: '#05ff3f' },
  { title: '极佳', color: '#04febd' },
]

</script>
<template>
  <div id="sunshine">
    <header>
      <div class="nav">
        <van-tabs v-model:active="tabStatus" @change="onChangeStatus" line-width="16px" title-inactive-color="#969696"
          title-active-color="#0059f0">
          <van-tab title="日照效果" name="effect"></van-tab>
          <van-tab title="日照时长" name="duration"></van-tab>
        </van-tabs>
      </div>
    </header>

    <footer class="ctrl-wrapper">
      <div v-if="isShowSingle" class="back-btn" @click="backSandbox">
        <van-icon name="arrow-left" />
        <span>返回小区</span>
      </div>
      <div v-if="!isEffect" class="gauge-container">
        <div v-for="(color, index) in colorTips" :key="index" :style="{ backgroundColor: color.color }">{{ color.title
          }}
        </div>
      </div>
      <div class="title">
        <div v-if="isShowSingle" class="back" @click="backSandbox">
          <van-icon name="arrow-left" />
          <span>返回</span>
        </div>
        <span class="project-name">楼栋日照模拟</span>
      </div>
      <div class="sun-ctrl">
        <div class="btn-show-picker" @click="showPicker = true">
          {{ curSolarTerms.text }}
          <van-icon name="play" />
        </div>
        <div class="slider">
          <span class="time">{{ timeInfo.startTime }}</span>
          <van-slider v-model="progress" style="width: 70%" :step="5" :min="0" active-color="#eaedee"
            inactive-color="#eaedee" bar-height="5px" :max="480" @drag-start="dragStart">
            <template #button>
              <div class="custom-sun-slider">
                <div>{{ timeInfo.curHour + ':' + timeInfo.curMin }}</div>
                <img src="../assets/sun.png" ondragstart="return false" alt="" />
              </div>
            </template>
          </van-slider>
          <span class="time">{{ timeInfo.endTime }}</span>
        </div>
        <div class="ctrl-btn" @click="isRunning ? stop() : run()">
          <van-icon v-if="isRunning" size="18" color="#fff" name="pause" />
          <van-icon v-else color="#fff" size="18" name="play" />
        </div>
      </div>

    </footer>

    <div class="compass">
      <div class="bg"></div>
      <img src="../assets/compass-point.jpg">
    </div>
    <van-popup v-model:show="showPicker" round position="bottom">
      <van-picker :columns="solarTerms()" title="节气" @cancel="showPicker = false" @confirm="onConfirmPicker" />
    </van-popup>
  </div>
</template>

<style scoped lang="less">
.ctrl-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  max-width: 520px;
  background-color: #fff;
  padding: 10px;

  .back-btn {
    position: absolute;
    left: 0;
    right: 0;
    margin: auto;
    top: -50px;
    font-size: 16px;
    color: #fff;
    border-radius: 20px;
    background-color: #333030;
    width: 80px;
    display: flex;
    padding: 4px 2px;
    justify-content: center;
    align-items: center;
    cursor: pointer;

    >span {
      font-size: 14px;
      margin-left: 0px;
      margin-right: 4px;
    }
  }

  .gauge-container {
    display: flex;
    position: absolute;
    width: 100%;
    left: 0;
    top: -16px;

    >div {
      width: calc(100% / 6);
      height: 16px;
      color: #fff;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .sun-ctrl {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;

    .btn-show-picker {
      font-size: 12px;
      color: #565656;
      padding: 5px 10px;
      background-color: #f4f4f4;
      border-radius: 20px;
      cursor: pointer;

      >i {
        transform: rotate(90deg);
        color: #b6b6b6;
      }
    }

    .slider {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 70%;
    }

    .time {
      font-size: 14px;
      color: #000;
      margin: 0 4px;
    }
  }

  .ctrl-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background-color: #1989fa;
    margin-right: 20px;
  }

  .title {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .back {
      cursor: pointer;
      font-size: 14px;
      color: #0059F0;
    }

    .project-name {
      color: #252525;
      font-size: 14px;
      font-weight: 500;
    }
  }
}

header {
  /deep/ .nav {
    position: absolute;
    left: 0;
    right: 0;
    top: 18px;
    margin: auto;
    width: 174px;
    height: 36px;
    border-radius: 18px;
    background: #fff;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .2);
    overflow: hidden;
    z-index: 100;

    .van-tabs--line .van-tabs__wrap {
      height: 36px;
    }

    .van-tabs__line {
      background-color: #0059F0;
    }

    .van-tabs__nav--line {
      padding-bottom: 10px;
    }
  }
}

.compass {
  left: 50px;
  top: 50px;
  touch-action: none;
  position: absolute;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);

  >div {
    width: 80px;
    height: 80px;
    background-size: contain;
    background-image: url('../assets/compass-bg.png');
  }

  >img {
    position: absolute;
    width: 24px;
    left: 50%;
    top: 50%;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
  }
}
</style>

<style lang="less">
.custom-sun-slider {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  margin-bottom: 15px;

  >div {
    width: 46px;
    color: #fff;
    font-size: 12px;
    text-align: center;
    border-radius: 100px;
  }

  >img {
    width: 20px;
    height: 20px;
  }
}
</style>

<style less>
.tag2,
.tag {
  box-shadow: 0 0 2px #00ffff inset;
  background: #00ffff;
  background-repeat: no-repeat;
  background-size:
    1px 6px,
    6px 1px;
  background-color: rgba(0, 0, 0, 0.4);
  color: #ffffff;
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 10px;
  user-select: auto !important;
  pointer-events: all;
  cursor: pointer;
}

.tag2 {
  color: pink;
}
</style>
../core/basicThree