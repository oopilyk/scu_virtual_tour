import * as THREE from 'three'

export const randomColor = (x: number, y: number, z: number) => {
  if (!x) {
    var r = Math.random(),
      g = Math.random(),
      b = Math.random()
    return new THREE.Color(r, g, b)
  } else {
    return new THREE.Color(x, y, z)
  }
}
