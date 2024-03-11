/**
 * 创建一个2D标签
 * 仅供参考
 */

import {
  CSS2DRenderer,
  CSS2DObject,
} from 'three/examples/jsm/renderers/CSS2DRenderer.js'

// 创建一个HTML标签
function tag(name, modelName, className, event) {
  // 创建div元素(作为标签)
  const div = document.createElement('div')
  div.innerHTML = name
  div.classList.add('lqr-tag')
  div.classList.add(className)
  div.addEventListener('click', event)

  //div元素包装为CSS2模型对象CSS2DObject
  const label = new CSS2DObject(div)
  label.name = modelName

  //避免HTML标签遮挡三维场景的鼠标事件
  div.style.pointerEvents = 'auto'

  // 设置HTML元素标签在three.js世界坐标中位置
  // label.position.set(x, y, z);
  return label //返回CSS2模型标签
}

// 避免重复创建
let labelRendererObj

// 创建一个CSS2渲染器CSS2DRenderer
function labelRenderer(container) {
  if (!labelRendererObj) {
    labelRendererObj = new CSS2DRenderer()
    labelRendererObj.setSize(window.innerWidth, window.innerHeight)
    labelRendererObj.domElement.style.position = 'absolute'
    // 相对标签原位置位置偏移大小
    labelRendererObj.domElement.style.top = '0px'
    labelRendererObj.domElement.style.left = '0px'
    // //设置.pointerEvents=none，以免模型标签HTML元素遮挡鼠标选择场景模型
    labelRendererObj.domElement.style.pointerEvents = 'none'
    container.appendChild(labelRendererObj.domElement)
  }

  return labelRendererObj
}

export { tag, labelRenderer }
