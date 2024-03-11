/**
 * 功能:太阳光模拟
 * 原理:通过经纬度和位置,计算太阳运行的轨迹
 */

import { solarTerm } from '@/help/constant'
import { reactive, ref, watch } from 'vue'
import * as SunCalc from '@/help/suncalc.js'
import * as THREE from 'three'

export const useSun = () => {
  const curSolarTerms = ref(solarTerm.minorCold)

  const curDate = ref()

  // 当前的建筑位置的经纬度( 实际使用的话肯定需要动态去获取 )
  const latitude = ref(23.1291)
  const longitude = ref(113.2644)

  const sunOffset = ref(20) // 太阳光角度偏移
  const animationHandle = ref()
  const sunlightPosition = ref()
  const progress = ref(0)
  const isRunning = ref(false)

  const timeInfo = reactive({
    startTime: '8:00',
    endTime: '16:00',
    curTime: '',
    curHour: 0,
    curMin: 0,
  })

  const initSun = () => {
    onChangeTerm()
  }

  // 改变节气后,计算当前年份节气的日期
  const onChangeTerm = (term) => {
    destroyAnimation()
    curSolarTerms.value = term ?? curSolarTerms.value
    const curYear = new Date().getFullYear()
    curDate.value = new Date(
      31556925974.7 * (curYear - 1900) +
      curSolarTerms.value.value * 60000 +
      Date.UTC(1900, 0, 6, 2, 5),
    )
    progress.value = 0

    run()
  }

  const destroyAnimation = () => {
    if (animationHandle.value) {
      cancelAnimationFrame(animationHandle.value)
      animationHandle.value = null
    }
  }

  // 计算太阳的位置
  const calcSunPosition = () => {
    const sunPosition = SunCalc.getPosition(
      curDate.value,
      latitude.value,
      longitude.value,
    )

    // 太阳角度偏移(可选)
    const offSetRad =
      sunOffset.value > 0 ? THREE.MathUtils.degToRad(sunOffset.value) : 0

    const sunDirection = new THREE.Vector3()
    sunDirection.setFromSphericalCoords(
      1,
      Math.PI / 2 - sunPosition.altitude,
      -sunPosition.azimuth - offSetRad,
    )
    sunDirection.normalize()

    //光源到原点的距离
    sunlightPosition.value = sunDirection.clone().multiplyScalar(200)
  }

  const run = () => {
    isRunning.value = true
    destroyAnimation()
    requestAnimationFrame(animate)
  }

  const animate = () => {
    if (!isRunning) return
    progress.value += 1
    /**
     * 我本来是计算出日出和日落的时间来作为开始和结束时间
     * 后来发现意义不大,普遍的做法是从早上8点到下午4点
     * 所以,我这个示例: 
     * 计算时间为 8~16点, 总分钟数为480
     */
    if (progress.value >= 480) {
      progress.value = 0
      destroyAnimation()
      // 当运行到末尾时,不会马上开始,而是停顿一下再开始, 为了更好的体验
      setTimeout(() => {
        animationHandle.value = requestAnimationFrame(animate)
      }, 666)
    } else {
      animationHandle.value = requestAnimationFrame(animate)
    }
  }

  watch(progress, () => {
    progressToDate()
    calcSunPosition()
  })

  const progressToDate = () => {
    const hours = 8 + Math.floor(progress.value / 60)
    const minutes = progress.value % 60
    curDate.value = new Date(
      curDate.value.getFullYear(),
      curDate.value.getMonth(),
      curDate.value.getDate(),
      hours,
      minutes,
    )

    timeInfo.curHour = +hours > 9 ? hours : '0' + hours
    timeInfo.curMin = +minutes > 9 ? minutes : '0' + minutes
  }

  const stop = () => {
    isRunning.value = false
    destroyAnimation()
  }

  return {
    initSun,
    curSolarTerms,
    onChangeTerm,
    calcSunPosition,
    sunlightPosition,
    progress,
    run,
    stop,
    timeInfo,
    isRunning,
  }
}
