/**
 * 创建标签示例
 */

import * as THREE from 'three'
import { labelRenderer as labelRenderer2D, tag as tag2D } from '@/core/tag2D'
import { ref } from 'vue'

export const useTag = (threeObj) => {
  const labelRenderer2DObj = ref(null)

  const handleClickTag = (e) => {
    console.log('点击了', e.target.innerHTML)
  }

  const createTag = (list = []) => {
    const tagList = [
      {
        className: 'tag',
        modelName: '可选(自定义属性)',
        name: '1栋',
        position: new THREE.Vector3(14.163, 16.252, 141.966),
      },
      {
        className: 'tag',
        modelName: 'xxx',
        name: '2栋',
        position: new THREE.Vector3(3.216, 74.810, 103.162),
      },
      {
        className: 'tag',
        modelName: 'xx',
        name: '3栋',
        position: new THREE.Vector3(62.499, 75.957, 50.435),
      },
      {
        className: 'tag',
        modelName: 'xxx',
        name: '4栋',
        position: new THREE.Vector3(-0.851, 78.213, -27.966),
      },
      {
        className: 'tag',
        modelName: 'xxx',
        name: '5栋',
        position: new THREE.Vector3(-39.118, 78.213, 12.048),
      },
      {
        className: 'tag',
        modelName: 'xx',
        name: '6栋',
        position: new THREE.Vector3(-76.208, 78.213, 50.992),
      },
      {
        className: 'tag',
        modelName: 'xx',
        name: '7栋',
        position: new THREE.Vector3(-60.747, 61.667, 98.025),
      },
    ]

    tagList.forEach(({ name, position, modelName, className }) => {
      const label2D = tag2D(name, modelName, className, handleClickTag)
      position.multiplyScalar(threeObj.modelScale)
      label2D.position.copy(position)
      threeObj.scene.add(label2D)
    })

    if (!labelRenderer2DObj.value) {
      labelRenderer2DObj.value = labelRenderer2D(threeObj.container)
    }

    return labelRenderer2DObj
  }

  const renderTag = (scene, camera) => {
    return labelRenderer2DObj.value?.render(
      scene ?? threeObj.scene,
      camera ?? threeObj.camera,
    )
  }

  return {
    createTag,
    renderTag,
  }
}
