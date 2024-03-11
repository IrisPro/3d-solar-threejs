import * as THREE from 'three'
import * as TWEEN from 'tween.js'

export const tweenCamera = (
  camera,
  fromPosition,
  toPosition,
  animateDuration = 666,
  offset = -90,
  cbComplete,
) => {
  const tween = new TWEEN.Tween(fromPosition)
    .to(toPosition, animateDuration)
    .easing(TWEEN.Easing.Quadratic.Out)
    // 在每次动画更新时调用的回调函数
    .onUpdate(() => {
      // 计算相机的方向向量
      const cameraDirection = new THREE.Vector3()
      camera.getWorldDirection(cameraDirection)
      // 计算缩放后的方向向量
      const scaledDirection = cameraDirection.clone().multiplyScalar(offset)
      // 更新相机的位置
      camera.position.add(scaledDirection)
    })
    .onComplete(() => {
      tween.stop()
      cbComplete && cbComplete()
    })
    .start()
}
