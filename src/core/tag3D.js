/**
 * 创建一个3D标签
 * 仅供参考
 */


import {
  CSS3DRenderer,
  CSS3DObject,
  CSS3DSprite,
} from 'three/examples/jsm/renderers/CSS3DRenderer.js'

// 创建一个HTML标签
function tag3D(name) {
  var div = document.createElement('div') // 创建div元素(作为标签)
  div.innerHTML = name
  div.classList.add('tag')
  var label = new CSS3DObject(div) //div元素包装为CSS3模型对象CSS3DObject
  div.style.pointerEvents = 'none' //避免HTML标签遮挡三维场景的鼠标事件
  // 设置HTML元素标签在three.js世界坐标中位置
  // label.position.set(x, y, z);
  //缩放CSS3DObject模型对象
  label.scale.set(0.2, 0.2, 0.2) //根据相机渲染范围控制HTML 3D标签尺寸
  label.rotateY(Math.PI / 2) //控制HTML标签CSS3对象姿态角度
  // label.rotateX(-Math.PI/2);
  return label //返回CSS3模型标签
}

// 创建一个HTML标签
function tag3DSprite(name) {
  // 创建div元素(作为标签)
  var div = document.createElement('div')
  div.innerHTML = name
  div.classList.add('tag')
  //div元素包装为CSS3模型对象CSS3DSprite
  var label = new CSS3DSprite(div)
  div.style.pointerEvents = 'none' //避免HTML标签遮挡三维场景的鼠标事件
  // 设置HTML元素标签在three.js世界坐标中位置
  // label.position.set(x, y, z);
  //缩放CSS3DSprite模型对象
  label.scale.set(0.2, 0.2, 0.2) //根据相机渲染范围控制HTML 3D标签尺寸
  label.rotateY(Math.PI / 2) //控制HTML标签CSS3对象姿态角度
  // label.rotateX(-Math.PI/2);
  return label //返回CSS3模型标签
}

// 创建一个CSS2渲染器CSS2DRenderer
function labelRenderer(container) {
  var labelRenderer = new CSS3DRenderer()
  labelRenderer.setSize(container.offsetWidth, container.offsetHeight)
  labelRenderer.domElement.style.position = 'absolute'
  // 相对标签原位置位置偏移大小
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  // 设置.pointerEvents=none，以免模型标签HTML元素遮挡鼠标选择场景模型
  labelRenderer.domElement.style.pointerEvents = 'none'
  container.appendChild(labelRenderer.domElement)
  return labelRenderer
}

export { tag3D, tag3DSprite, labelRenderer }
